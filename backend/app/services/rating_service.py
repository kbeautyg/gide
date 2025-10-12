"""
Сервис для работы с рейтингами
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.tour import Tour
from app.models.review import Review


async def recalculate_tour_rating(db: AsyncSession, tour_id: int) -> None:
    """
    Пересчитывает рейтинг тура на основе всех его отзывов
    
    Args:
        db: Сессия базы данных
        tour_id: ID тура для пересчета
    """
    # Получаем тур
    tour_result = await db.execute(select(Tour).where(Tour.id == tour_id))
    tour = tour_result.scalar_one_or_none()
    
    if not tour:
        return
    
    # Получаем все отзывы для этого тура
    reviews_result = await db.execute(
        select(Review).where(Review.tour_id == tour_id)
    )
    reviews = reviews_result.scalars().all()
    
    if reviews:
        # Считаем средний рейтинг
        avg_rating = sum([r.rating for r in reviews]) / len(reviews)
        tour.rating = round(avg_rating, 2)
        tour.reviews_count = len(reviews)
    else:
        # Нет отзывов - сбрасываем рейтинг
        tour.rating = 0.0
        tour.reviews_count = 0
    
    # Сохраняем без дополнительного коммита (вызывающая функция сделает commit)

