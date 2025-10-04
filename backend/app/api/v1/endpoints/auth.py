from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.base import get_db
from app.models.user import User
from app.schemas.user import UserLogin, UserCreate, UserWithToken, User as UserSchema
from app.core.security import verify_password, get_password_hash, create_access_token

router = APIRouter()

@router.post("/login", response_model=UserWithToken)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """Вход в систему по телефону и паролю"""
    # Ищем пользователя
    result = await db.execute(
        select(User).where(User.phone == credentials.phone)
    )
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный телефон или пароль"
        )
    
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Пользователь заблокирован"
        )
    
    # Создаем токен
    access_token = create_access_token(data={"sub": str(user.id)})
    
    # Конвертируем роль из числа в строку
    role_map = {0: "admin", 1: "manager", 2: "client"}
    
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "phone": user.phone,
            "full_name": user.full_name,
            "role": role_map.get(user.role, "client"),
            "active": user.active,
            "parent_id": user.parent_id,
            "created_at": user.created_at,
        },
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/register", response_model=UserWithToken)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Регистрация нового пользователя"""
    # Проверяем, существует ли пользователь
    result = await db.execute(
        select(User).where(User.phone == user_data.phone)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким телефоном уже существует"
        )
    
    # Создаем email из телефона
    email = f"{user_data.phone.replace('+', '').replace(' ', '')}@fastchange.local"
    
    # Создаем пользователя
    role_map = {"admin": 0, "manager": 1, "client": 2}
    
    new_user = User(
        email=email,
        phone=user_data.phone,
        full_name=user_data.full_name,
        hashed_password=get_password_hash(user_data.password),
        role=role_map.get(user_data.role, 2),
        active=True
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Создаем токен
    access_token = create_access_token(data={"sub": str(new_user.id)})
    
    return {
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "phone": new_user.phone,
            "full_name": new_user.full_name,
            "role": user_data.role,
            "active": new_user.active,
            "parent_id": new_user.parent_id,
            "created_at": new_user.created_at,
        },
        "access_token": access_token,
        "token_type": "bearer"
    }
