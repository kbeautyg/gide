"""
API эндпоинты для отзывов
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional

from app.core.deps import get_db
from app.models.review import Review
from app.schemas.review import Review as ReviewSchema, ReviewCreate

router = APIRouter()


@router.get("/{tour_id}", response_model=List[ReviewSchema])
def get_tour_reviews(
    tour_id: int,
    rating: Optional[float] = None,
    sort_by: str = "date",  # date, rating
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Получить отзывы для экскурсии"""
    query = db.query(Review).filter(Review.tour_id == tour_id)
    
    # Фильтр по рейтингу
    if rating:
        query = query.filter(Review.rating >= rating)
    
    # Сортировка
    if sort_by == "rating":
        query = query.order_by(desc(Review.rating))
    else:
        query = query.order_by(desc(Review.created_at))
    
    reviews = query.offset(skip).limit(limit).all()
    return reviews


@router.post("/", response_model=ReviewSchema)
def create_review(
    review: ReviewCreate,
    db: Session = Depends(get_db)
):
    """Создать отзыв"""
    db_review = Review(**review.dict())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    # Обновляем рейтинг тура
    from app.models.tour import Tour
    tour = db.query(Tour).filter(Tour.id == review.tour_id).first()
    if tour:
        all_reviews = db.query(Review).filter(Review.tour_id == review.tour_id).all()
        avg_rating = sum([r.rating for r in all_reviews]) / len(all_reviews)
        tour.rating = round(avg_rating, 2)
        tour.reviews_count = len(all_reviews)
        db.commit()
    
    return db_review

