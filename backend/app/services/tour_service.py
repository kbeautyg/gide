"""
Сервис для работы с экскурсиями
"""
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Tuple
import uuid
from datetime import datetime

from app.models.tour import Tour
from app.models.user import User


class TourService:
    """Сервис для работы с экскурсиями"""
    
    @staticmethod
    async def get_tours(
        db: AsyncSession,
        location: Optional[str] = None,
        category: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        date_start: Optional[str] = None,
        date_end: Optional[str] = None,
        guests: Optional[int] = None,
        duration_min: Optional[int] = None,
        duration_max: Optional[int] = None,
        rating_min: Optional[float] = None,
        tour_type: Optional[str] = None,
        search: Optional[str] = None,
        themes: Optional[str] = None,
        tags: Optional[str] = None,
        landmarks: Optional[str] = None,
        page: int = 1,
        page_size: int = 12,
        include_private: bool = False,
        guide_id: Optional[int] = None,
    ) -> Tuple[List[Tour], int]:
        """
        Получение списка экскурсий с фильтрами
        
        Returns:
            tuple: (список экскурсий, общее количество)
        """
        from sqlalchemy import and_, or_
        
        # Базовый запрос с eager loading связанного гида
        query = select(Tour).where(Tour.active == True).options(selectinload(Tour.guide))

        # Фильтр публикации
        if include_private and guide_id is not None:
            # Для приватного списка показываем только СВОИ экскурсии гида
            # Исключаем туры системного гида (phone: 00000000000)
            query = query.where(
                and_(
                    Tour.guide_id == guide_id,
                    User.phone != "00000000000"  # Исключаем системного гида
                )
            ).join(User, Tour.guide_id == User.id)
        else:
            # Для публичного списка показываем только опубликованные экскурсии
            query = query.where(Tour.is_public == True)
        
        # Применяем фильтры
        if location:
            # Поиск по локации (город или страна)
            query = query.where(Tour.location.ilike(f"%{location}%"))
        
        if category:
            query = query.where(Tour.category.ilike(f"%{category}%"))
        
        if min_price is not None:
            query = query.where(Tour.price >= min_price)
        
        if max_price is not None:
            query = query.where(Tour.price <= max_price)
        
        if duration_min is not None:
            query = query.where(Tour.duration >= duration_min)
        
        if duration_max is not None:
            query = query.where(Tour.duration <= duration_max)
        
        if rating_min is not None:
            query = query.where(Tour.rating >= rating_min)
        
        if guests is not None:
            # Фильтруем только туры, которые могут вместить столько гостей
            query = query.where(Tour.max_group_size >= guests)
        
        # Фильтр по типу (tours vs experiences) - можно реализовать через категории
        if tour_type == 'experiences':
            # "Впечатления" - это категории типа Приключения, Экстрим, Необычное
            experience_categories = ['Приключения', 'Экстрим', 'Фотосессия', 'Необычное', 'Для семей']
            conditions = [Tour.category.ilike(f"%{cat}%") for cat in experience_categories]
            query = query.where(or_(*conditions))
        
        # Полнотекстовый поиск по нескольким полям
        if search:
            search_conditions = [
                Tour.title.ilike(f"%{search}%"),
                Tour.description.ilike(f"%{search}%"),
                Tour.location.ilike(f"%{search}%"),
                Tour.category.ilike(f"%{search}%"),
            ]
            query = query.where(or_(*search_conditions))
        
        # Поиск по темам (JSON массив)
        if themes:
            themes_list = [t.strip() for t in themes.split(',')]
            for theme in themes_list:
                from sqlalchemy.dialects.postgresql import JSONB
                from sqlalchemy import cast
                query = query.where(
                    cast(Tour.themes, JSONB).contains([theme])
                )
        
        # Поиск по тегам (JSON массив)
        if tags:
            tags_list = [t.strip() for t in tags.split(',')]
            for tag in tags_list:
                from sqlalchemy.dialects.postgresql import JSONB
                from sqlalchemy import cast
                query = query.where(
                    cast(Tour.tags, JSONB).contains([tag])
                )
        
        # Поиск по достопримечательностям
        if landmarks:
            landmarks_list = [l.strip() for l in landmarks.split(',')]
            for landmark in landmarks_list:
                from sqlalchemy.dialects.postgresql import JSONB
                from sqlalchemy import cast
                query = query.where(
                    cast(Tour.landmarks, JSONB).contains([landmark])
                )
        
        # Подсчет общего количества
        count_result = await db.execute(query)
        total = len(count_result.scalars().all())
        
        # Пагинация
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)
        
        # Выполняем запрос
        result = await db.execute(query)
        tours = result.scalars().all()
        
        return tours, total
    
    @staticmethod
    async def get_tour_by_id(db: AsyncSession, tour_id: int) -> Optional[Tour]:
        """Получение экскурсии по ID"""
        result = await db.execute(
            select(Tour).where(Tour.id == tour_id).options(selectinload(Tour.guide))
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_tour_by_share_code(db: AsyncSession, share_code: str) -> Optional[Tour]:
        """Получение экскурсии по share_code"""
        result = await db.execute(
            select(Tour).where(Tour.share_code == share_code).options(selectinload(Tour.guide))
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_similar_tours(
        db: AsyncSession,
        tour_id: int,
        limit: int = 6
    ) -> List[Tour]:
        """Получение похожих экскурсий"""
        from sqlalchemy import and_, or_, func
        
        # Получаем текущий тур
        current_tour = await TourService.get_tour_by_id(db, tour_id)
        
        if not current_tour:
            return []
        
        # Ищем туры с той же категорией ИЛИ той же локацией
        query = select(Tour).where(
            and_(
                Tour.active == True,
                Tour.is_public == True,
                Tour.id != tour_id,  # Исключаем текущий тур
                Tour.rating >= 4.5,  # Только высокорейтинговые
                or_(
                    Tour.category == current_tour.category,
                    Tour.location == current_tour.location
                )
            )
        ).options(selectinload(Tour.guide))
        
        # Сортируем по популярности (total_bookings)
        query = query.order_by(Tour.total_bookings.desc(), Tour.rating.desc())
        query = query.limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def create_tour(
        db: AsyncSession,
        guide_id: int,
        title: str,
        description: str,
        price: float,
        duration: int,
        location: str,
        category: str,
        photos: List[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> Tour:
        """Создание новой экскурсии"""
        # Генерируем уникальный короткий код
        share_code = uuid.uuid4().hex[:8]
        
        # Проверяем уникальность (крайне редкий случай коллизии)
        existing = await db.execute(select(Tour).where(Tour.share_code == share_code))
        while existing.scalar_one_or_none():
            share_code = uuid.uuid4().hex[:8]
            existing = await db.execute(select(Tour).where(Tour.share_code == share_code))
        
        # Парсим даты из строк в объекты date
        parsed_start_date = None
        parsed_end_date = None
        
        if start_date:
            try:
                parsed_start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            except ValueError:
                pass
        
        if end_date:
            try:
                parsed_end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            except ValueError:
                pass
        
        tour = Tour(
            guide_id=guide_id,
            share_code=share_code,
            title=title,
            description=description,
            price=price,
            duration=duration,
            location=location,
            category=category,
            photos=photos or [],
            start_date=parsed_start_date,
            end_date=parsed_end_date,
            rating=0.0,
            reviews_count=0,
            active=True,
        )
        
        db.add(tour)
        await db.commit()
        await db.refresh(tour)
        
        return tour
    
    @staticmethod
    async def update_tour(
        db: AsyncSession,
        tour_id: int,
        **updates
    ) -> Optional[Tour]:
        """Обновление экскурсии"""
        tour = await TourService.get_tour_by_id(db, tour_id)
        
        if not tour:
            return None
        
        # Обрабатываем даты отдельно
        if 'start_date' in updates and updates['start_date']:
            if isinstance(updates['start_date'], str):
                try:
                    updates['start_date'] = datetime.strptime(updates['start_date'], '%Y-%m-%d').date()
                except ValueError:
                    pass
        
        if 'end_date' in updates and updates['end_date']:
            if isinstance(updates['end_date'], str):
                try:
                    updates['end_date'] = datetime.strptime(updates['end_date'], '%Y-%m-%d').date()
                except ValueError:
                    pass
        
        for key, value in updates.items():
            if hasattr(tour, key) and value is not None:
                setattr(tour, key, value)
        
        tour.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(tour)
        
        return tour
    
    @staticmethod
    async def delete_tour(db: AsyncSession, tour_id: int) -> bool:
        """Мягкое удаление экскурсии (деактивация)"""
        tour = await TourService.get_tour_by_id(db, tour_id)
        
        if not tour:
            return False
        
        tour.active = False
        await db.commit()
        
        return True
