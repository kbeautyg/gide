"""
Схемы для статей журнала
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ArticleBase(BaseModel):
    """Базовая схема статьи"""
    title: str
    slug: str
    preview_text: Optional[str] = None
    content: str
    photo_url: Optional[str] = None
    read_time: int = 5
    country_tag: Optional[str] = None


class ArticleCreate(BaseModel):
    """Схема создания статьи (slug генерируется автоматически)"""
    title: str
    slug: Optional[str] = None  # Будет сгенерирован на сервере если не указан
    preview_text: Optional[str] = None
    content: str
    photo_url: Optional[str] = None
    read_time: int = 5
    country_tag: Optional[str] = None


class Article(ArticleBase):
    """Схема статьи"""
    id: int
    views_count: int = 0
    published_at: datetime
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ArticleList(BaseModel):
    """Схема списка статей"""
    articles: list[Article]
    total: int

