"""
Схемы для заявок
"""
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class RequestBase(BaseModel):
    """Базовая схема заявки"""
    title: str
    description: str
    preferred_date: Optional[date] = None
    participants_count: int
    budget: Optional[float] = None
    location: Optional[str] = None
    duration_hours: int  # 1-8 часов


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
    duration_hours: Optional[int] = None
    status: Optional[str] = None
    assigned_to: Optional[int] = None
    guide_id: Optional[int] = None
    assigned_date: Optional[date] = None


class Request(RequestBase):
    """Схема заявки"""
    id: int
    client_id: int
    status: str
    assigned_to: Optional[int] = None
    guide_id: Optional[int] = None
    assigned_date: Optional[date] = None
    telegram_username: Optional[str] = None
    booking_id: Optional[int] = None
    generated_tour_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class RequestTake(BaseModel):
    """Схема для взятия заявки гидом"""
    assigned_date: date  # Дата назначения


class RequestReschedule(BaseModel):
    """Схема для переноса заявки"""
    new_date: date  # Новая дата


class RequestList(BaseModel):
    """Схема списка заявок"""
    requests: list[Request]
    total: int
    page: int
    per_page: int


class RequestAvailableList(BaseModel):
    """Схема списка доступных заявок"""
    requests: list[Request]
    total: int
