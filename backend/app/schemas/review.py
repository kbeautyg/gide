"""
Схемы для отзывов
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReviewBase(BaseModel):
    """Базовая схема отзыва"""
    tour_id: int
    user_name: str
    user_photo: Optional[str] = None
    rating: float
    text: str
    experience_count: int = 1


class ReviewCreate(ReviewBase):
    """Схема создания отзыва"""
    pass


class Review(ReviewBase):
    """Схема отзыва"""
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

