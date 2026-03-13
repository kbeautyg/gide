"""
Эндпоинты для чата
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func, and_, or_
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.booking import Booking, BookingStatus
from app.models.tour import Tour
from app.models.message import Message

router = APIRouter()

# --- Pydantic Models ---

class MessageCreate(BaseModel):
    content: str

class MessageSchema(BaseModel):
    id: int
    content: str
    sender_id: int
    created_at: datetime
    is_read: bool
    
    class Config:
        from_attributes = True

class ChatParticipant(BaseModel):
    id: int
    name: str
    avatar: Optional[str] = None
    role: str

class ChatSummary(BaseModel):
    booking_id: int
    tour_title: str
    participant: ChatParticipant
    last_message: Optional[str]
    last_message_time: Optional[datetime]
    unread_count: int
    status: str # booking status

class TourFolder(BaseModel):
    tour_id: int
    tour_title: str
    tour_photo: Optional[str] = None
    chats: List[ChatSummary]

# --- Endpoints ---

@router.get("/grouped", response_model=List[TourFolder])
async def get_grouped_chats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Получить чаты, сгруппированные по турам (папкам).
    Только для подтвержденных туров (или всех активных).
    """
    if current_user.role in ['guide', 'manager', 'admin', 'super_admin']:
        # 1. Находим туры: для админа — ВСЕ, для гида — только его
        if current_user.role in ['admin', 'super_admin']:
            tours_result = await db.execute(select(Tour))
        else:
            tours_result = await db.execute(
                select(Tour).where(Tour.guide_id == current_user.id)
            )
        tours = tours_result.scalars().all()
        
        result_folders = []
        
        for tour in tours:
            # 2. Находим бронирования для каждого тура
            # Только те, где статус не cancelled
            bookings_result = await db.execute(
                select(Booking)
                .where(
                    Booking.tour_id == tour.id,
                    Booking.status != BookingStatus.CANCELLED 
                )
                .order_by(desc(Booking.created_at))
            )
            bookings = bookings_result.scalars().all()
            
            chats = []
            for booking in bookings:
                try:
                    # Получаем последнее сообщение и кол-во непрочитанных
                    last_msg_result = await db.execute(
                        select(Message)
                        .where(Message.booking_id == booking.id)
                        .order_by(desc(Message.created_at))
                        .limit(1)
                    )
                    last_msg = last_msg_result.scalar_one_or_none()
                    
                    unread_count = await db.execute(
                        select(func.count(Message.id))
                        .where(
                            Message.booking_id == booking.id,
                            Message.is_read == False,
                            Message.sender_id != current_user.id
                        )
                    )
                    unread = unread_count.scalar() or 0

                    # Инфо о клиенте
                    client_res = await db.execute(select(User).where(User.id == booking.client_id))
                    client = client_res.scalar_one_or_none()
                    
                    # Если клиента нет (системный), берем данные из booking
                    client_name = (client.name if client and client.name else None) or getattr(booking, 'client_name', None) or "Клиент"
                    
                    chats.append(ChatSummary(
                        booking_id=booking.id,
                        tour_title=tour.title,
                        participant=ChatParticipant(
                            id=booking.client_id,
                            name=client_name,
                            role='client'
                        ),
                        last_message=last_msg.content if last_msg else "Чат открыт",
                        last_message_time=last_msg.created_at if last_msg else booking.created_at,
                        unread_count=unread,
                        status=booking.status.value
                    ))
                except Exception as e:
                    print(f"⚠️ Ошибка при обработке чата бронирования {booking.id}: {e}")
                    continue
            
            if chats:
                result_folders.append(TourFolder(
                    tour_id=tour.id,
                    tour_title=tour.title,
                    tour_photo=tour.photos[0] if tour.photos else None,
                    chats=chats
                ))
        
        return result_folders

    else:
        # Для клиента: просто список туров, где он участвует (тоже можно сгруппировать, но скорее просто список)
        # Для унификации вернем как "папки", где папка = Тур
        bookings_result = await db.execute(
            select(Booking)
            .where(Booking.client_id == current_user.id)
            .order_by(desc(Booking.created_at))
        )
        bookings = bookings_result.scalars().all()
        
        result_folders = []
        for booking in bookings:
            try:
                # Подгружаем тур
                tour_res = await db.execute(select(Tour).where(Tour.id == booking.tour_id))
                tour = tour_res.scalar_one_or_none()
                if not tour:
                    continue

                # Получаем гида
                guide_res = await db.execute(select(User).where(User.id == tour.guide_id))
                guide = guide_res.scalar_one_or_none()
                if not guide:
                    continue

                # Последнее сообщение
                last_msg_result = await db.execute(
                    select(Message)
                    .where(Message.booking_id == booking.id)
                    .order_by(desc(Message.created_at))
                    .limit(1)
                )
                last_msg = last_msg_result.scalar_one_or_none()
                
                unread_count = await db.execute(
                    select(func.count(Message.id))
                    .where(
                        Message.booking_id == booking.id,
                        Message.is_read == False,
                        Message.sender_id != current_user.id
                    )
                )
                unread = unread_count.scalar() or 0
                
                chat_summary = ChatSummary(
                    booking_id=booking.id,
                    tour_title=tour.title,
                    participant=ChatParticipant(
                        id=guide.id,
                        name=guide.name or "Гид",
                        role='guide'
                    ),
                    last_message=last_msg.content if last_msg else "Чат открыт",
                    last_message_time=last_msg.created_at if last_msg else booking.created_at,
                    unread_count=unread,
                    status=booking.status.value
                )
                
                result_folders.append(TourFolder(
                    tour_id=tour.id,
                    tour_title=tour.title,
                    tour_photo=tour.photos[0] if tour.photos else None,
                    chats=[chat_summary]
                ))
            except Exception as e:
                print(f"⚠️ Ошибка при обработке бронирования {booking.id}: {e}")
                continue
            
        return result_folders

@router.get("/{booking_id}/messages", response_model=List[MessageSchema])
async def get_messages(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Проверка доступа
    booking_res = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = booking_res.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    # Подгружаем тур для проверки гида
    tour_res = await db.execute(select(Tour).where(Tour.id == booking.tour_id))
    tour = tour_res.scalar_one()
    
    if current_user.id != booking.client_id and current_user.id != tour.guide_id and current_user.role not in ['admin', 'super_admin']:
        raise HTTPException(status_code=403, detail="Access denied")
        
    messages_res = await db.execute(
        select(Message)
        .where(Message.booking_id == booking_id)
        .order_by(Message.created_at)
    )
    messages = messages_res.scalars().all()
    
    # Mark as read (simple version)
    for msg in messages:
        if msg.sender_id != current_user.id and not msg.is_read:
            msg.is_read = True
            db.add(msg)
    await db.commit()
    
    return messages

@router.post("/{booking_id}/messages", response_model=MessageSchema)
async def send_message(
    booking_id: int,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Проверка доступа
    booking_res = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = booking_res.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    tour_res = await db.execute(select(Tour).where(Tour.id == booking.tour_id))
    tour = tour_res.scalar_one()
    
    if current_user.id != booking.client_id and current_user.id != tour.guide_id and current_user.role not in ['admin', 'super_admin']:
        raise HTTPException(status_code=403, detail="Access denied")
        
    new_msg = Message(
        booking_id=booking_id,
        sender_id=current_user.id,
        content=message_data.content,
        created_at=datetime.utcnow(),
        is_read=False
    )
    
    db.add(new_msg)
    await db.commit()
    await db.refresh(new_msg)
    
    return new_msg
