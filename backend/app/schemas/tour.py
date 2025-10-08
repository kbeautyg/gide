"""
Схемы для экскурсий
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import date


class TourBase(BaseModel):
    """Базовая схема экскурсии"""
    title: str
    description: str
    price: float
    duration: int
    location: str
    category: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    photos: Optional[List[str]] = []
    
    # Контентные блоки (Tripster-стиль)
    what_to_expect: Optional[str] = None
    organizational_details: Optional[str] = None
    included: Optional[List[str]] = []
    not_included: Optional[List[str]] = []
    meeting_point: Optional[str] = None
    languages: Optional[List[str]] = ["русский"]
    max_group_size: Optional[int] = None
    min_age: Optional[int] = None
    difficulty_level: Optional[str] = None
    
    # Теги и категоризация
    landmarks: Optional[List[str]] = []
    tags: Optional[List[str]] = []
    themes: Optional[List[str]] = []
    formats: Optional[List[str]] = []
    
    # SEO
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    long_description: Optional[str] = None
    
    # Промо
    has_discount: Optional[bool] = False
    is_new: Optional[bool] = False
    discount_percentage: Optional[int] = None
    original_price: Optional[float] = None


class TourCreate(TourBase):
    """Схема создания экскурсии"""
    pass


class TourUpdate(BaseModel):
    """Схема обновления экскурсии"""
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration: Optional[int] = None
    location: Optional[str] = None
    category: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    photos: Optional[List[str]] = None
    active: Optional[bool] = None


class Tour(TourBase):
    """Схема экскурсии"""
    id: str
    guide_id: str
    rating: float
    reviews_count: int
    active: bool
    total_bookings: int = 0
    views_count: int = 0
    
    class Config:
        from_attributes = True


class TourList(BaseModel):
    """Схема списка экскурсий"""
    tours: List[Tour]
    total: int
    page: int
    per_page: int
