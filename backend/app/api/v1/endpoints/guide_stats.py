"""
Эндпоинты для статистики гида
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.tour import Tour
from app.models.booking import Booking, PaymentStatus, BookingStatus

router = APIRouter()


@router.get("/dashboard")
async def get_guide_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Получение статистики для дашборда гида
    """
    if current_user.role not in ['guide', 'manager', 'super_manager', 'admin', 'super_admin']:
        raise HTTPException(status_code=403, detail="Доступ запрещен")
    
    # Активные экскурсии
    active_tours_query = select(func.count(Tour.id)).where(
        and_(Tour.guide_id == current_user.id, Tour.active == True)
    )
    active_tours_result = await db.execute(active_tours_query)
    active_tours = active_tours_result.scalar() or 0
    
    # Заказы за текущий месяц
    now = datetime.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    monthly_bookings_query = select(func.count(Booking.id)).join(Tour).where(
        and_(
            Tour.guide_id == current_user.id,
            Booking.created_at >= month_start
        )
    )
    monthly_bookings_result = await db.execute(monthly_bookings_query)
    monthly_bookings = monthly_bookings_result.scalar() or 0
    
    # Доход за текущий месяц (только оплаченные заказы)
    monthly_income_query = select(func.sum(Booking.total_price)).join(Tour).where(
        and_(
            Tour.guide_id == current_user.id,
            Booking.created_at >= month_start,
            Booking.payment_status == PaymentStatus.PAID
        )
    )
    monthly_income_result = await db.execute(monthly_income_query)
    monthly_income = monthly_income_result.scalar() or 0.0
    
    # График доходов за последние 30 дней
    thirty_days_ago = now - timedelta(days=30)
    
    revenue_data = []
    for i in range(30):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        day_income_query = select(func.sum(Booking.total_price)).join(Tour).where(
            and_(
                Tour.guide_id == current_user.id,
                Booking.created_at >= day_start,
                Booking.created_at < day_end,
                Booking.payment_status == PaymentStatus.PAID
            )
        )
        day_income_result = await db.execute(day_income_query)
        day_income = day_income_result.scalar() or 0.0
        
        revenue_data.append({
            'date': day_start.strftime('%Y-%m-%d'),
            'income': float(day_income)
        })
    
    # Последние заказы (последние 5)
    recent_bookings_query = select(Booking).join(Tour).where(
        Tour.guide_id == current_user.id
    ).order_by(Booking.created_at.desc()).limit(5)
    
    recent_bookings_result = await db.execute(recent_bookings_query)
    recent_bookings = recent_bookings_result.scalars().all()
    
    recent_bookings_data = []
    for booking in recent_bookings:
        recent_bookings_data.append({
            'id': booking.id,
            'client_name': booking.client_name,
            'client_phone': booking.client_phone,
            'total_price': booking.total_price,
            'payment_status': booking.payment_status.value,
            'created_at': booking.created_at.isoformat(),
            'tour_title': booking.tour.title if booking.tour else 'Экскурсия'
        })
    
    return {
        'active_tours': active_tours,
        'monthly_bookings': monthly_bookings,
        'monthly_income': monthly_income,
        'revenue_chart': revenue_data,
        'recent_bookings': recent_bookings_data
    }


@router.post("/tours/{tour_id}/payment")
async def mark_tour_payment(
    tour_id: int,
    payment_data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Отметить экскурсию как оплаченную (для гида)
    """
    if current_user.role not in ['guide', 'manager', 'super_manager', 'admin', 'super_admin']:
        raise HTTPException(status_code=403, detail="Доступ запрещен")
    
    # Проверяем что экскурсия принадлежит гиду
    tour_query = select(Tour).where(
        and_(Tour.id == tour_id, Tour.guide_id == current_user.id)
    )
    tour_result = await db.execute(tour_query)
    tour = tour_result.scalar_one_or_none()
    
    if not tour:
        raise HTTPException(status_code=404, detail="Экскурсия не найдена")
    
    # Создаем бронирование с оплатой
    booking = Booking(
        tour_id=tour_id,
        client_id=current_user.id,  # Временно, потом можно создать отдельного клиента
        client_name=payment_data.get('client_name', 'Клиент'),
        client_phone=payment_data.get('client_phone', ''),
        client_email=payment_data.get('client_email', ''),
        date=datetime.now().date(),
        participants_count=payment_data.get('participants_count', 1),
        total_price=tour.price * payment_data.get('participants_count', 1),
        status=BookingStatus.CONFIRMED,
        payment_status=PaymentStatus.PAID
    )
    
    db.add(booking)
    await db.commit()
    await db.refresh(booking)
    
    # Обновляем баланс гида
    current_user.balance_rub += booking.total_price
    await db.commit()
    
    return {
        'success': True,
        'booking_id': booking.id,
        'total_price': booking.total_price,
        'message': 'Оплата зафиксирована'
    }
