"""
Эндпоинты аутентификации
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.db.session import get_db
from app.services.user_service import UserService
from app.models.user import UserRole

router = APIRouter()


class LoginRequest(BaseModel):
    """Запрос на вход"""
    phone: str = Field(..., description="Номер телефона")
    password: str = Field(..., description="Пароль")


class RegisterRequest(BaseModel):
    """Запрос на регистрацию"""
    phone: str = Field(..., description="Номер телефона")
    email: Optional[str] = Field(None, description="Email")
    password: str = Field(..., description="Пароль")
    name: Optional[str] = Field(None, description="Имя")


class TokenResponse(BaseModel):
    """Ответ с токеном"""
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str
    guide_status: Optional[str] = "none"


@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Вход в систему
    """
    # Очищаем телефон от всех символов кроме цифр
    phone_clean = ''.join(filter(str.isdigit, request.phone))
    print(f"🔐 Попытка входа: {request.phone} -> очищено: {phone_clean}")

    # Аутентификация пользователя
    user = await UserService.authenticate_user(db, phone_clean, request.password)

    if not user:
        print(f"❌ Аутентификация не удалась для {phone_clean}")
        # Проверяем, существует ли пользователь с таким телефоном вообще
        test_user = await UserService.get_user_by_phone(db, phone_clean)
        if test_user:
            print(f"⚠️ Пользователь найден, но пароль неверный. ID: {test_user.id}")
        else:
            print(f"⚠️ Пользователь с телефоном {phone_clean} не найден в БД")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный телефон или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    print(f"✅ Аутентификация успешна: {user.phone} (ID: {user.id}, Роль: {user.role.value})")

    # Создаем JWT токен
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value}
    )

    guide_status = "none"
    if hasattr(user, "guide_status") and user.guide_status is not None:
        guide_status = user.guide_status.value if hasattr(user.guide_status, "value") else str(user.guide_status)

    return TokenResponse(
        access_token=access_token,
        user_id=str(user.id),
        role=user.role.value,
        guide_status=guide_status
    )


@router.post("/register", response_model=TokenResponse)
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Регистрация нового пользователя (клиента/туриста)
    """
    # Очищаем телефон от всех символов кроме цифр
    phone_clean = ''.join(filter(str.isdigit, request.phone))

    # Проверяем существует ли пользователь
    existing_user = await UserService.get_user_by_phone(db, phone_clean)

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким телефоном уже существует"
        )

    # Создаем нового пользователя (по умолчанию - клиент)
    user = await UserService.create_user(
        db=db,
        phone=phone_clean,
        password=request.password,
        email=request.email,
        name=request.name,
        role=UserRole.CLIENT,
    )

    print(f"✅ Регистрация успешна: {user.phone} (ID: {user.id})")

    # Создаем JWT токен
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value}
    )

    guide_status = "none"
    if hasattr(user, "guide_status") and user.guide_status is not None:
        guide_status = user.guide_status.value if hasattr(user.guide_status, "value") else str(user.guide_status)

    return TokenResponse(
        access_token=access_token,
        user_id=str(user.id),
        role=user.role.value,
        guide_status=guide_status
    )


@router.post("/logout")
async def logout():
    """
    Выход из системы
    
    JWT токены stateless, поэтому просто возвращаем успех
    """
    return {"message": "Успешный выход"}
