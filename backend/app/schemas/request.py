"""
Схемы для заявок
"""
from pydantic import BaseModel
from typing import Optional
from datetime import date


class RequestBase(BaseModel):
    """Базовая схема заявки"""
    title: str
    description: str
    preferred_date: Optional[date] = None
    participants_count: int
    budget: Optional[float] = None
    location: Optional[str] = None


class RequestCreate(RequestBase):
    """Схема создания заявки"""
    pass


class RequestUpdate(BaseModel):
    """Схема обновления заявки"""
    title: Optional[str] = None
    description: Optional[str] = None
    preferred_date: Optional[date] = None
    participants_count: Optional[int] = None
    budget: Optional[float] = None
    location: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[str] = None


class Request(RequestBase):
    """Схема заявки"""
    id: str
    client_id: str
    status: str
    assigned_to: Optional[str] = None
    
    class Config:
        from_attributes = True


class RequestList(BaseModel):
    """Схема списка заявок"""
    requests: list[Request]
    total: int
    page: int
    per_page: int
