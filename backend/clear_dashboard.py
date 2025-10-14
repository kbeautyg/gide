"""
ПОЛНАЯ ОЧИСТКА ЛИЧНОГО КАБИНЕТА
Удаляет: заявки, заказы (бронирования), туры с request_id, расписание
Оставляет: публичные туры БЕЗ request_id для главной страницы
"""
import asyncio
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Async engine
DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def clear_dashboard():
    """Полная очистка личного кабинета"""
    
    print("🧹 ПОЛНАЯ ОЧИСТКА ЛИЧНОГО КАБИНЕТА...")
    print("=" * 60)
    
    async with AsyncSessionLocal() as session:
        async with session.begin():
            
            # 1. ОЧИСТКА СВЯЗЕЙ
            print("\n📋 Шаг 1: Очистка связей...")
            
            result = await session.execute(sa.text("""
                UPDATE requests 
                SET booking_id = NULL, 
                    generated_tour_id = NULL, 
                    guide_id = NULL,
                    assigned_date = NULL
            """))
            print(f"   ✓ Очищены связи requests: {result.rowcount}")
            
            result = await session.execute(sa.text("""
                UPDATE bookings 
                SET request_id = NULL
            """))
            print(f"   ✓ Очищены связи bookings: {result.rowcount}")
            
            # 2. УДАЛЕНИЕ РАСПИСАНИЯ
            print("\n📅 Шаг 2: Удаление расписания...")
            result = await session.execute(sa.text("DELETE FROM guide_schedules"))
            print(f"   ✓ Удалено записей расписания: {result.rowcount}")
            
            # 3. УДАЛЕНИЕ ЗАКАЗОВ (БРОНИРОВАНИЙ)
            print("\n🛒 Шаг 3: Удаление заказов (бронирований)...")
            result = await session.execute(sa.text("DELETE FROM bookings"))
            print(f"   ✓ Удалено заказов: {result.rowcount}")
            
            # 4. УДАЛЕНИЕ ТУРОВ СОЗДАННЫХ ИЗ ЗАЯВОК (с request_id)
            print("\n🎫 Шаг 4: Удаление туров из заявок...")
            result = await session.execute(sa.text("""
                DELETE FROM tours WHERE request_id IS NOT NULL
            """))
            print(f"   ✓ Удалено туров из заявок: {result.rowcount}")
            
            # 5. УДАЛЕНИЕ ВСЕХ ЗАЯВОК
            print("\n📬 Шаг 5: Удаление заявок...")
            result = await session.execute(sa.text("DELETE FROM requests"))
            print(f"   ✓ Удалено заявок: {result.rowcount}")
            
            # 6. ПОДСЧЁТ ОСТАВШИХСЯ ПУБЛИЧНЫХ ТУРОВ
            print("\n✨ Шаг 6: Проверка оставшихся туров...")
            result = await session.execute(sa.text("""
                SELECT COUNT(*) FROM tours WHERE request_id IS NULL
            """))
            remaining_tours = result.scalar()
            print(f"   ℹ️  Публичных туров на главной: {remaining_tours}")
            
            # 7. СБРОС СЧЁТЧИКОВ
            print("\n🔄 Шаг 7: Сброс счётчиков...")
            try:
                result = await session.execute(sa.text("""
                    UPDATE users 
                    SET balance_rub = 0,
                        balance_usd = 0,
                        balance_thb = 0
                """))
                print(f"   ✓ Сброшены балансы: {result.rowcount} пользователей")
            except Exception as e:
                print(f"   ⚠️ Не удалось сбросить балансы: {e}")
    
    print("\n" + "=" * 60)
    print("✅ ЛИЧНЫЙ КАБИНЕТ ПОЛНОСТЬЮ ОЧИЩЕН!")
    print("\nУдалено:")
    print("  ✓ Все заявки")
    print("  ✓ Все заказы (бронирования)")
    print("  ✓ Все туры из заявок (с request_id)")
    print("  ✓ Всё расписание")
    print("  ✓ Все балансы")
    print("\nОставлено:")
    print(f"  ✓ {remaining_tours} публичных туров на главной странице")
    print("=" * 60)


if __name__ == "__main__":
    print("🚀 ЗАПУСК ПОЛНОЙ ОЧИСТКИ ЛИЧНОГО КАБИНЕТА...")
    asyncio.run(clear_dashboard())
    print("✅ ГОТОВО!")

