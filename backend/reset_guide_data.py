"""
Очистка данных ГИДА - удаление туров, заявок, расписания, бронирований
НЕ трогает: супер-админа, других пользователей
Используется при RESET_DB=true для очистки только данных гида
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


async def reset_guide_data():
    """Очистка данных гидов - туры, заявки, расписание, бронирования"""
    
    print("🧹 Очистка данных гидов...")
    
    async with AsyncSessionLocal() as session:
        async with session.begin():
            # Получаем ID всех пользователей КРОМЕ:
            # - id=1 (супер-админ)
            # - системного гида с телефоном "00000000000" (создатель публичных туров)
            result = await session.execute(sa.text("""
                SELECT id FROM users 
                WHERE id > 1 
                AND phone != '00000000000'
            """))
            guide_ids = [row[0] for row in result.fetchall()]
            
            if not guide_ids:
                print("   ℹ️  Нет гидов для очистки (только админ и системный гид)")
                return
            
            guide_ids_str = ','.join(map(str, guide_ids))
            print(f"   🎯 Найдено гидов для очистки: {len(guide_ids)}")
            
            # 1. Очищаем связи в requests
            result = await session.execute(sa.text(f"""
                UPDATE requests 
                SET booking_id = NULL, 
                    generated_tour_id = NULL
                WHERE guide_id IN ({guide_ids_str})
            """))
            print(f"   ✓ Очищены связи в заявках гидов: {result.rowcount}")
            
            # 2. Очищаем связи в bookings (для туров гидов)
            result = await session.execute(sa.text(f"""
                UPDATE bookings 
                SET request_id = NULL
                WHERE tour_id IN (SELECT id FROM tours WHERE guide_id IN ({guide_ids_str}))
            """))
            print(f"   ✓ Очищены связи в бронированиях гидов: {result.rowcount}")
            
            # 3. Удаляем расписание гидов
            result = await session.execute(sa.text(f"DELETE FROM guide_schedules WHERE guide_id IN ({guide_ids_str})"))
            print(f"   ✓ Удалено записей расписания: {result.rowcount}")
            
            # 4. Удаляем бронирования туров гидов
            result = await session.execute(sa.text(f"""
                DELETE FROM bookings 
                WHERE tour_id IN (SELECT id FROM tours WHERE guide_id IN ({guide_ids_str}))
            """))
            print(f"   ✓ Удалено бронирований гидов: {result.rowcount}")
            
            # 5. Удаляем туры гидов (И с request_id И без него)
            result = await session.execute(sa.text(f"DELETE FROM tours WHERE guide_id IN ({guide_ids_str})"))
            print(f"   ✓ Удалено всех туров гидов: {result.rowcount}")
            
            # 6. Удаляем заявки гидов
            result = await session.execute(sa.text(f"DELETE FROM requests WHERE guide_id IN ({guide_ids_str})"))
            print(f"   ✓ Удалено заявок гидов: {result.rowcount}")
            
            # 7. Сбрасываем счётчики у гидов
            try:
                result = await session.execute(sa.text(f"""
                    UPDATE users 
                    SET total_earnings = 0, 
                        total_tours = 0, 
                        reviews_count = 0,
                        rating = 0.0
                    WHERE id IN ({guide_ids_str})
                """))
                print(f"   ✓ Сброшены счётчики у {result.rowcount} гидов")
            except Exception as e:
                print(f"   ⚠️ Не удалось сбросить счётчики: {e}")
    
    print("✅ Данные всех гидов очищены! Публичные туры админа сохранены.")


if __name__ == "__main__":
    print("🔄 Очистка данных гидов...")
    asyncio.run(reset_guide_data())
    print("✅ Готово!")

