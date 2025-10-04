"""
Главный роутер API v1
"""
from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, tours, bookings

api_router = APIRouter()

# Подключение эндпоинтов
api_router.include_router(auth.router, prefix="/auth", tags=["Аутентификация"])
api_router.include_router(users.router, prefix="/users", tags=["Пользователи"])
api_router.include_router(tours.router, prefix="/tours", tags=["Экскурсии"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["Бронирования"])
