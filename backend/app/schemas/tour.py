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
    
    class Config:
        from_attributes = True


class TourList(BaseModel):
    """Схема списка экскурсий"""
    tours: List[Tour]
    total: int
    page: int
    per_page: int
