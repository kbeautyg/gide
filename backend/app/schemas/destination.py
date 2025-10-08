"""
Схемы для направлений
"""
from pydantic import BaseModel
from typing import Optional, List


class DestinationBase(BaseModel):
    """Базовая схема направления"""
    name: str
    country: str
    slug: str
    photo_url: Optional[str] = None
    description: Optional[str] = None
    seo_text: Optional[str] = None


class DestinationCreate(DestinationBase):
    """Схема создания направления"""
    pass


class Destination(DestinationBase):
    """Схема направления"""
    id: int
    tours_count: int = 0
    
    class Config:
        from_attributes = True


class LandmarkBase(BaseModel):
    """Базовая схема достопримечательности"""
    destination_id: int
    name: str
    photo_url: Optional[str] = None
    description: Optional[str] = None


class LandmarkCreate(LandmarkBase):
    """Схема создания достопримечательности"""
    pass


class Landmark(LandmarkBase):
    """Схема достопримечательности"""
    id: int
    tours_count: int = 0
    
    class Config:
        from_attributes = True

