"""
Эндпоинты аутентификации
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.core.security import create_access_token, get_password_hash, verify_password

router = APIRouter()


class LoginRequest(BaseModel):
    """Запрос на вход"""
    phone: str = Field(..., description="Номер телефона")
    password: str = Field(..., description="Пароль")


class RegisterRequest(BaseModel):
    """Запрос на регистрацию"""
    phone: str = Field(..., description="Номер телефона")
    email: str | None = Field(None, description="Email")
    password: str = Field(..., description="Пароль")
    name: str | None = Field(None, description="Имя")


class TokenResponse(BaseModel):
    """Ответ с токеном"""
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """
    Вход в систему
    
    TODO: Подключить реальную БД
    """
    # Временная заглушка
    # В реальности здесь будет проверка в БД
    
    # Создаем токен
    access_token = create_access_token(
        data={"sub": "temp_user_id", "role": "manager"}
    )
    
    return TokenResponse(
        access_token=access_token,
        user_id="temp_user_id",
        role="manager"
    )


@router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest):
    """
    Регистрация нового пользователя
    
    TODO: Подключить реальную БД
    """
    # Временная заглушка
    # В реальности здесь будет создание пользователя в БД
    
    # Хешируем пароль
    hashed_password = get_password_hash(request.password)
    
    # Создаем токен
    access_token = create_access_token(
        data={"sub": "new_user_id", "role": "client"}
    )
    
    return TokenResponse(
        access_token=access_token,
        user_id="new_user_id",
        role="client"
    )


@router.post("/logout")
async def logout():
    """
    Выход из системы
    
    JWT токены stateless, поэтому просто возвращаем успех
    """
    return {"message": "Успешный выход"}
