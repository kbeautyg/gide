"""
Главный роутер API v1
"""
from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, tours, bookings, admin, requests, user_profile

api_router = APIRouter()

# Подключение эндпоинтов
api_router.include_router(auth.router, prefix="/auth", tags=["Аутентификация"])
api_router.include_router(users.router, prefix="/users", tags=["Пользователи"])
api_router.include_router(user_profile.router, prefix="/profile", tags=["Профили"])
api_router.include_router(tours.router, prefix="/tours", tags=["Экскурсии"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["Бронирования"])
api_router.include_router(admin.router, prefix="/admin", tags=["Администрирование"])
api_router.include_router(requests.router, prefix="/requests", tags=["Заявки"])
