"""
Очистка данных КОНКРЕТНОГО пользователя по номеру телефона
"""
import asyncio
import sys
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Async engine
DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def reset_user_data(phone: str):
    """Очистка данных конкретного пользователя по телефону"""
    
    # Очищаем телефон от + и пробелов
    clean_phone = phone.replace('+', '').replace(' ', '').replace('-', '')
    
    print(f"🧹 Очистка данных пользователя с телефоном: {phone} (очищен: {clean_phone})...")
    
    async with AsyncSessionLocal() as session:
        async with session.begin():
            # Находим пользователя по телефону
            result = await session.execute(sa.text("""
                SELECT id, phone, name, role 
                FROM users 
                WHERE phone LIKE :phone
            """), {'phone': f'%{clean_phone}%'})
            
            user = result.fetchone()
            
            if not user:
                print(f"   ❌ Пользователь с телефоном {phone} не найден!")
                return
            
            user_id = user[0]
            print(f"   ✓ Найден пользователь: id={user_id}, phone={user[1]}, name={user[2]}, role={user[3]}")
            
            if user_id == 1:
                print(f"   ⚠️  ВНИМАНИЕ: Это супер-админ (id=1)! Очистка отменена для безопасности.")
                print(f"   💡 Если действительно нужно очистить админа, измените код вручную.")
                return
            
            # 1. Очищаем связи в requests
            result = await session.execute(sa.text("""
                UPDATE requests 
                SET booking_id = NULL, 
                    generated_tour_id = NULL
                WHERE guide_id = :user_id
            """), {'user_id': user_id})
            print(f"   ✓ Очищены связи в заявках: {result.rowcount}")
            
            # 2. Очищаем связи в bookings
            result = await session.execute(sa.text("""
                UPDATE bookings 
                SET request_id = NULL
                WHERE tour_id IN (SELECT id FROM tours WHERE guide_id = :user_id)
            """), {'user_id': user_id})
            print(f"   ✓ Очищены связи в бронированиях: {result.rowcount}")
            
            # 3. Удаляем расписание
            result = await session.execute(sa.text("""
                DELETE FROM guide_schedules WHERE guide_id = :user_id
            """), {'user_id': user_id})
            print(f"   ✓ Удалено записей расписания: {result.rowcount}")
            
            # 4. Удаляем бронирования туров пользователя
            result = await session.execute(sa.text("""
                DELETE FROM bookings 
                WHERE tour_id IN (SELECT id FROM tours WHERE guide_id = :user_id)
            """), {'user_id': user_id})
            print(f"   ✓ Удалено бронирований: {result.rowcount}")
            
            # 5. Удаляем ВСЕ туры пользователя
            result = await session.execute(sa.text("""
                DELETE FROM tours WHERE guide_id = :user_id
            """), {'user_id': user_id})
            print(f"   ✓ Удалено туров: {result.rowcount}")
            
            # 6. Удаляем заявки пользователя
            result = await session.execute(sa.text("""
                DELETE FROM requests WHERE guide_id = :user_id
            """), {'user_id': user_id})
            print(f"   ✓ Удалено заявок: {result.rowcount}")
            
            # 7. Сбрасываем счётчики
            try:
                result = await session.execute(sa.text("""
                    UPDATE users 
                    SET total_earnings = 0, 
                        total_tours = 0, 
                        reviews_count = 0,
                        rating = 0.0
                    WHERE id = :user_id
                """), {'user_id': user_id})
                print(f"   ✓ Сброшены счётчики пользователя")
            except Exception as e:
                print(f"   ⚠️ Не удалось сбросить счётчики: {e}")
    
    print(f"✅ Данные пользователя {phone} полностью очищены!")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("❌ Использование: python reset_specific_user.py <phone>")
        print("Пример: python reset_specific_user.py +79177445182")
        print("Пример: python reset_specific_user.py 79177445182")
        sys.exit(1)
    
    phone = sys.argv[1]
    print(f"🔄 Очистка данных пользователя {phone}...")
    asyncio.run(reset_user_data(phone))
    print("✅ Готово!")

