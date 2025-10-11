"""
API эндпоинты для отзывов
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, select
from typing import List, Optional

from app.db.session import get_db
from app.models.review import Review
from app.schemas.review import Review as ReviewSchema, ReviewCreate

router = APIRouter()


@router.get("/{tour_id}", response_model=List[ReviewSchema])
async def get_tour_reviews(
    tour_id: int,
    rating: Optional[float] = None,
    sort_by: str = "date",  # date, rating
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """Получить отзывы для экскурсии"""
    stmt = select(Review).where(Review.tour_id == tour_id)
    
    # Фильтр по рейтингу
    if rating:
        stmt = stmt.where(Review.rating >= rating)
    
    # Сортировка
    if sort_by == "rating":
        stmt = stmt.order_by(desc(Review.rating))
    else:
        stmt = stmt.order_by(desc(Review.created_at))
    
    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    reviews = result.scalars().all()
    return reviews


@router.post("/", response_model=ReviewSchema)
async def create_review(
    review: ReviewCreate,
    db: AsyncSession = Depends(get_db)
):
    """Создать отзыв"""
    db_review = Review(**review.dict())
    db.add(db_review)
    await db.commit()
    await db.refresh(db_review)
    
    # Обновляем рейтинг тура
    from app.models.tour import Tour
    from sqlalchemy import func
    
    tour_result = await db.execute(select(Tour).where(Tour.id == review.tour_id))
    tour = tour_result.scalar_one_or_none()
    
    if tour:
        reviews_result = await db.execute(select(Review).where(Review.tour_id == review.tour_id))
        all_reviews = reviews_result.scalars().all()
        
        if all_reviews:
            avg_rating = sum([r.rating for r in all_reviews]) / len(all_reviews)
            tour.rating = round(avg_rating, 2)
            tour.reviews_count = len(all_reviews)
            await db.commit()
    
    return db_review

