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
        # Базовый запрос с eager loading связанного гида
        query = select(Tour).where(Tour.active == True).options(selectinload(Tour.guide))

        # Фильтр публикации
        if include_private and guide_id is not None:
            # Для приватного списка показываем все экскурсии гида
            query = query.where(Tour.guide_id == guide_id)
        else:
            # Для публичного списка показываем только опубликованные экскурсии
            query = query.where(Tour.is_public == True)
        
        # Применяем фильтры
        if location:
            query = query.where(Tour.location.ilike(f"%{location}%"))
        
        if category:
            query = query.where(Tour.category.ilike(f"%{category}%"))
        
        if min_price is not None:
            query = query.where(Tour.price >= min_price)
        
        if max_price is not None:
            query = query.where(Tour.price <= max_price)
        
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
        
        for key, value in updates.items():
            if hasattr(tour, key):
                setattr(tour, key, value)
        
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
