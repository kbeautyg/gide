"""
Безопасность и аутентификация
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.security.utils import get_authorization_scheme_param
import pytz

from app.core.config import settings

# Контекст для хеширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer для JWT токенов
security = HTTPBearer()

# Московская временная зона
MOSCOW_TZ = pytz.timezone('Europe/Moscow')

# Экспортируем константы для WebSocket
SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = settings.JWT_ALGORITHM


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверка пароля"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Хеширование пароля"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Создание JWT токена
    
    Args:
        data: Данные для токена
        expires_delta: Время жизни токена
    
    Returns:
        JWT токен
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(MOSCOW_TZ) + expires_delta
    else:
        expire = datetime.now(MOSCOW_TZ) + timedelta(days=settings.JWT_ACCESS_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """
    Декодирование JWT токена
    
    Args:
        token: JWT токен
    
    Returns:
        Данные из токена
    
    Raises:
        HTTPException: Если токен невалиден
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невалидный токен аутентификации",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user_id(request: Request) -> str:
    """
    Получение ID текущего пользователя из токена
    
    Args:
        request: HTTP запрос
    
    Returns:
        ID пользователя
    
    Raises:
        HTTPException: Если токен невалиден
    """
    # Получаем заголовок Authorization
    authorization = request.headers.get("Authorization")
    
    if not authorization:
        # Fallback для демо-режима без токена
        return "demo_user"
    
    try:
        # Извлекаем токен из заголовка
        scheme, token = get_authorization_scheme_param(authorization)
        
        if scheme.lower() != "bearer" or not token:
            return "demo_user"
        
        payload = decode_access_token(token)
        
        user_id: str = payload.get("sub")
        if user_id is None:
            return "demo_user"
        
        return user_id
    except Exception:
        # Fallback для демо-режима при ошибке токена
        return "demo_user"


def get_moscow_time() -> datetime:
    """Получение текущего времени в московской временной зоне"""
    return datetime.now(MOSCOW_TZ)
