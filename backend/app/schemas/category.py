"""
Схемы для категорий и коллекций
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any
from datetime import datetime


class CategoryBase(BaseModel):
    """Базовая схема категории"""
    name: str = Field(..., description="Название категории")
    slug: str = Field(..., description="Slug для URL")
    description: Optional[str] = None
    type: str = Field(..., description="Тип: landmark, theme, format, collection")
    parent_id: Optional[int] = Field(None, description="ID родительской категории (для подкатегорий)")
    icon: Optional[str] = None
    image_url: Optional[str] = None
    filters: Dict[str, Any] = Field(default_factory=dict)
    extra_data: Dict[str, Any] = Field(default_factory=dict)
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    display_order: int = 0
    is_featured: bool = False
    is_active: bool = True


class CategoryCreate(CategoryBase):
    """Схема создания категории"""
    pass


class CategoryUpdate(BaseModel):
    """Схема обновления категории"""
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    parent_id: Optional[int] = None
    icon: Optional[str] = None
    image_url: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None
    extra_data: Optional[Dict[str, Any]] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    display_order: Optional[int] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None


class Category(CategoryBase):
    """Полная схема категории"""
    id: int
    views_count: int = 0
    clicks_count: int = 0
    tours_count: Optional[int] = None  # Добавляется динамически
    children: Optional[List['Category']] = None  # Подкатегории
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CollectionBase(BaseModel):
    """Базовая схема коллекции"""
    title: str = Field(..., description="Название коллекции")
    slug: str = Field(..., description="Slug для URL")
    description: Optional[str] = None
    cover_image: Optional[str] = None
    tour_ids: List[int] = Field(default_factory=list)
    is_automatic: bool = False
    auto_filters: Dict[str, Any] = Field(default_factory=dict)
    auto_limit: Optional[int] = None
    display_order: int = 0
    is_featured: bool = False
    is_active: bool = True
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None


class CollectionCreate(CollectionBase):
    """Схема создания коллекции"""
    pass


class CollectionUpdate(BaseModel):
    """Схема обновления коллекции"""
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None
    tour_ids: Optional[List[int]] = None
    is_automatic: Optional[bool] = None
    auto_filters: Optional[Dict[str, Any]] = None
    auto_limit: Optional[int] = None
    display_order: Optional[int] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None


class Collection(CollectionBase):
    """Полная схема коллекции"""
    id: int
    views_count: int = 0
    clicks_count: int = 0
    tours_count: Optional[int] = None  # Количество туров
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


