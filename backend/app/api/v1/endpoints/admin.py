"""
Эндпоинты для админов и супер-админа
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.user_service import UserService
from app.models.user import User, UserRole
from app.core.deps import require_admin, require_super_admin, get_current_user, check_hierarchy

router = APIRouter()


class CreateUserRequest(BaseModel):
    """Запрос на создание пользователя"""
    phone: str = Field(..., description="Номер телефона")
    email: Optional[str] = Field(None, description="Email")
    password: str = Field(..., description="Пароль")
    name: Optional[str] = Field(None, description="Имя")
    role: str = Field(..., description="Роль (admin, super_manager, manager, guide)")


class UserResponse(BaseModel):
    """Ответ с данными пользователя"""
    id: int
    phone: str
    email: Optional[str]
    name: Optional[str]
    role: str
    parent_id: Optional[int]
    balance_rub: float
    balance_usd: float
    balance_thb: float


class ChangeParentRequest(BaseModel):
    """Запрос на смену родителя (переназначение менеджера)"""
    user_id: int = Field(..., description="ID пользователя для переназначения")
    new_parent_id: int = Field(..., description="ID нового родителя")


@router.post("/users", response_model=UserResponse)
async def create_user(
    request: CreateUserRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Создание нового пользователя
    
    Доступно: Админ, Супер-админ
    
    Админ может создавать: супер-менеджеров и менеджеров
    Супер-админ может создавать: админов, супер-менеджеров, менеджеров
    """
    # Проверяем права на создание этой роли
    role = UserRole(request.role)
    
    if current_user.role == UserRole.ADMIN and role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Админ не может создавать других админов"
        )
    
    if current_user.role != UserRole.SUPER_ADMIN and role == UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только супер-админ может создавать супер-админов"
        )
    
    # Очищаем телефон от всех символов кроме цифр
    phone_clean = ''.join(filter(str.isdigit, request.phone))
    print(f"📞 Создание пользователя: {request.phone} -> очищено: {phone_clean}")
    
    # Проверяем существует ли пользователь
    existing_user = await UserService.get_user_by_phone(db, phone_clean)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким телефоном уже существует"
        )
    
    # Создаем пользователя с parent_id = current_user.id
    # (привязываем к тому кто создал)
    # Преобразуем пустые строки в None для необязательных полей
    user = await UserService.create_user(
        db=db,
        phone=phone_clean,
        password=request.password,
        email=request.email if request.email and request.email.strip() else None,
        name=request.name if request.name and request.name.strip() else None,
        role=role,
        parent_id=current_user.id if role != UserRole.SUPER_ADMIN else None,
    )
    
    return UserResponse(
        id=user.id,
        phone=user.phone,
        email=user.email,
        name=user.name,
        role=user.role.value,
        parent_id=user.parent_id,
        balance_rub=user.balance_rub,
        balance_usd=user.balance_usd,
        balance_thb=user.balance_thb,
    )


@router.get("/users/my-team", response_model=List[UserResponse])
async def get_my_team(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Получение списка подчиненных пользователей (моя когорта)
    
    Доступно: Админ, Супер-менеджер
    """
    # Получаем всех подчиненных
    team = await UserService.get_user_hierarchy(db, current_user.id)
    
    return [
        UserResponse(
            id=u.id,
            phone=u.phone,
            email=u.email,
            name=u.name,
            role=u.role.value,
            parent_id=u.parent_id,
            balance_rub=u.balance_rub,
            balance_usd=u.balance_usd,
            balance_thb=u.balance_thb,
        )
        for u in team
    ]


@router.post("/users/change-parent")
async def change_user_parent(
    request: ChangeParentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """
    Переназначение менеджера между админами
    
    Доступно: Только супер-админ
    
    Пример: перенести flower@nadi.com с Kiril на Farukh
    """
    # Получаем пользователя и нового родителя
    user = await UserService.get_user_by_id(db, request.user_id)
    new_parent = await UserService.get_user_by_id(db, request.new_parent_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    
    if not new_parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Новый родитель не найден"
        )
    
    # Переназначаем
    updated_user = await UserService.change_user_parent(
        db=db,
        user_id=request.user_id,
        new_parent_id=request.new_parent_id
    )
    
    return {
        "message": f"Пользователь {user.phone} переназначен к {new_parent.phone}",
        "user_id": updated_user.id,
        "new_parent_id": updated_user.parent_id
    }
