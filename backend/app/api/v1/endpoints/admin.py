
# === УПРАВЛЕНИЕ ЗАЯВКАМИ НА ГИДА ===
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.user import User, UserRole, GuideStatus
from app.services.user_service import UserService
from app.core.deps import require_admin
from app.schemas.user import UserResponse
from sqlalchemy import select

router = APIRouter()

@router.get("/guide-applications", response_model=List[UserResponse])
async def get_guide_applications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Получить список заявок на статус гида (pending)
    
    Доступно: Только ADMIN
    """
    query = select(User).where(User.guide_status == GuideStatus.PENDING)
    result = await db.execute(query)
    users = result.scalars().all()

    return [
        UserResponse(
            id=u.id,
            phone=u.phone,
            email=u.email,
            name=u.name,
            role=u.role.value,
            guide_status=getattr(u, "guide_status", "none").value if hasattr(u, "guide_status") and hasattr(getattr(u, "guide_status"), "value") else str(getattr(u, "guide_status", "none")),
            parent_id=u.parent_id,
            balance_rub=u.balance_rub,
            balance_usd=u.balance_usd,
            balance_thb=u.balance_thb,
        )
        for u in users
    ]


@router.post("/guide-applications/{user_id}/approve")
async def approve_guide_application(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Одобрить заявку на гида
    
    Меняет статус на APPROVED и роль на MANAGER
    """
    user = await UserService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
        
    user.guide_status = GuideStatus.APPROVED
    user.role = UserRole.MANAGER
    
    # Если у гида нет родителя, ставим текущего админа
    if not user.parent_id:
        user.parent_id = current_user.id
        
    await db.commit()
    await db.refresh(user)
    
    return {"message": f"Заявка пользователя {user.phone} одобрена. Теперь он гид.", "status": "approved"}


@router.post("/guide-applications/{user_id}/reject")
async def reject_guide_application(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Отклонить заявку на гида
    
    Меняет статус на REJECTED
    """
    user = await UserService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
        
    user.guide_status = GuideStatus.REJECTED
    # Роль остается прежней (обычно CLIENT)
        
    await db.commit()
    await db.refresh(user)
    
    return {"message": f"Заявка пользователя {user.phone} отклонена.", "status": "rejected"}
