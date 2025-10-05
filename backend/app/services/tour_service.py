"""
Сервис для работы с экскурсиями
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import uuid

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
    ) -> tuple[List[Tour], int]:
        """
        Получение списка экскурсий с фильтрами
        
        Returns:
            tuple: (список экскурсий, общее количество)
        """
        # Базовый запрос
        query = select(Tour).where(Tour.active == True)
        
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
        total = len(count_result.all())
        
        # Пагинация
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)
        
        # Выполняем запрос
        result = await db.execute(query)
        tours = result.scalars().all()
        
        return tours, total
    
    @staticmethod
    async def get_tour_by_id(db: AsyncSession, tour_id: str) -> Optional[Tour]:
        """Получение экскурсии по ID"""
        result = await db.execute(
            select(Tour).where(Tour.id == tour_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create_tour(
        db: AsyncSession,
        guide_id: str,
        title: str,
        description: str,
        price: float,
        duration: int,
        location: str,
        category: str,
        photos: List[str] = None,
    ) -> Tour:
        """Создание новой экскурсии"""
        tour = Tour(
            id=str(uuid.uuid4()),
            guide_id=guide_id,
            title=title,
            description=description,
            price=price,
            duration=duration,
            location=location,
            category=category,
            photos=photos or [],
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
        tour_id: str,
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
    async def delete_tour(db: AsyncSession, tour_id: str) -> bool:
        """Мягкое удаление экскурсии (деактивация)"""
        tour = await TourService.get_tour_by_id(db, tour_id)
        
        if not tour:
            return False
        
        tour.active = False
        await db.commit()
        
        return True
