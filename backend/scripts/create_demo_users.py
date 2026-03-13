import asyncio
import sys
import os
import random
from datetime import datetime, timedelta, date

# Добавляем корневую директорию проекта в sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.future import select
from app.db.session import async_session
from app.models.user import User, UserRole
from app.models.tour import Tour
from app.models.booking import Booking, BookingStatus, PaymentStatus
from app.core.security import get_password_hash

async def create_demo_users():
    print(">>> Starting demo users creation...")
    
    async with async_session() as db:
        # 1. Создание Администратора
        admin_phone = "79000000000"
        admin = await db.execute(select(User).where(User.phone == admin_phone))
        admin = admin.scalar_one_or_none()
        
        if not admin:
            admin = User(
                phone=admin_phone,
                email="admin@thaiguide.com",
                name="Super Admin",
                hashed_password=get_password_hash("password"),
                role=UserRole.ADMIN,
                balance_rub=100000.0
            )
            db.add(admin)
            print(f"CREATED Admin: {admin_phone} / password")
        else:
            print(f"INFO: Admin already exists: {admin_phone}")

        # 2. Создание Гида (Менеджера)
        guide_phone = "79111111111"
        guide = await db.execute(select(User).where(User.phone == guide_phone))
        guide = guide.scalar_one_or_none()
        
        if not guide:
            guide = User(
                phone=guide_phone,
                email="guide@thaiguide.com",
                name="Alex Guide",
                hashed_password=get_password_hash("password"),
                role=UserRole.MANAGER,
                balance_rub=15000.0,
                parent_id=admin.id if admin else None
            )
            db.add(guide)
            await db.flush() # Получаем ID
            print(f"CREATED Guide: {guide_phone} / password")
            
            # Создаем туры для гида
            tours_data = [
                {
                    "title": "Секретные пляжи Пхукета",
                    "description": "Покажу вам места, о которых не знают туристы. Чистейшая вода и белый песок.",
                    "price": 2500.0,
                    "duration": 6,
                    "location": "Phuket",
                    "category": "Beaches",
                    "is_public": True,
                    "active": True
                },
                {
                    "title": "Храмы Бангкока на рассвете",
                    "description": "Уникальная возможность увидеть пробуждение города и медитацию монахов.",
                    "price": 3500.0,
                    "duration": 4,
                    "location": "Bangkok",
                    "category": "Culture",
                    "is_public": True,
                    "active": True
                },
                {
                    "title": "Гастрономический тур по ночному рынку",
                    "description": "Попробуем самых вкусных скорпионов и самый сладкий манго.",
                    "price": 1500.0,
                    "duration": 3,
                    "location": "Phuket",
                    "category": "Food",
                    "is_public": True,
                    "active": True
                }
            ]
            
            for tour_data in tours_data:
                tour = Tour(
                    guide_id=guide.id,
                    **tour_data
                )
                db.add(tour)
            print(f"   ADDED {len(tours_data)} tours for guide")
            
        else:
            print(f"INFO: Guide already exists: {guide_phone}")

        # 3. Создание Клиента
        client_phone = "79222222222"
        client = await db.execute(select(User).where(User.phone == client_phone))
        client = client.scalar_one_or_none()
        
        if not client:
            client = User(
                phone=client_phone,
                email="tourist@thaiguide.com",
                name="Ivan Tourist",
                hashed_password=get_password_hash("password"),
                role=UserRole.CLIENT
            )
            db.add(client)
            await db.flush() # Получаем ID
            print(f"CREATED Client: {client_phone} / password")
            
            # Создаем бронирования если есть гид и туры
            if guide:
                # Находим туры гида
                tours_result = await db.execute(select(Tour).where(Tour.guide_id == guide.id))
                guide_tours = tours_result.scalars().all()
                
                if guide_tours:
                    # Прошедшее бронирование
                    booking1 = Booking(
                        tour_id=guide_tours[0].id,
                        client_id=client.id,
                        date=date.today() - timedelta(days=5),
                        participants_count=2,
                        total_price=guide_tours[0].price * 2,
                        status=BookingStatus.COMPLETED,
                        payment_status=PaymentStatus.PAID,
                        client_name=client.name,
                        client_phone=client.phone,
                        client_email=client.email
                    )
                    db.add(booking1)
                    
                    # Будущее бронирование
                    booking2 = Booking(
                        tour_id=guide_tours[1].id if len(guide_tours) > 1 else guide_tours[0].id,
                        client_id=client.id,
                        date=date.today() + timedelta(days=10),
                        participants_count=3,
                        total_price=(guide_tours[1].price if len(guide_tours) > 1 else guide_tours[0].price) * 3,
                        status=BookingStatus.CONFIRMED,
                        payment_status=PaymentStatus.PAID,
                        client_name=client.name,
                        client_phone=client.phone,
                        client_email=client.email
                    )
                    db.add(booking2)
                    
                    # Новая заявка (неоплаченная)
                    booking3 = Booking(
                        tour_id=guide_tours[-1].id,
                        client_id=client.id,
                        date=date.today() + timedelta(days=20),
                        participants_count=1,
                        total_price=guide_tours[-1].price,
                        status=BookingStatus.PENDING,
                        payment_status=PaymentStatus.AWAITING_PAYMENT,
                        client_name=client.name,
                        client_phone=client.phone,
                        client_email=client.email
                    )
                    db.add(booking3)
                    
                    print("   ADDED 3 test bookings")

        else:
            print(f"INFO: Client already exists: {client_phone}")

        await db.commit()
        print("Done! Demo data created successfully.")

if __name__ == "__main__":
    asyncio.run(create_demo_users())

