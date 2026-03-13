"""
Удаление туров-заглушек (701, 702, 703) из БД
Эти туры были созданы скриптами посева данных и мозолят глаз в кабинете туриста.
"""
import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv('DATABASE_URL', '').replace('postgresql://', 'postgresql+asyncpg://')

async def cleanup():
    if not DATABASE_URL:
        print("⚠️ DATABASE_URL не задан")
        return
    
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Проверяем какие из этих туров существуют
        result = await session.execute(
            text("SELECT id, title FROM tours WHERE id IN (701, 702, 703)")
        )
        stubs = result.fetchall()
        
        if not stubs:
            print("✅ Туры-заглушки 701, 702, 703 не найдены (уже удалены)")
            return
        
        for stub in stubs:
            print(f"  🗑️ Удаляю тур #{stub[0]}: {stub[1]}")
        
        # Удаляем связанные бронирования
        await session.execute(
            text("DELETE FROM bookings WHERE tour_id IN (701, 702, 703)")
        )
        
        # Удаляем связанные отзывы
        try:
            await session.execute(
                text("DELETE FROM reviews WHERE tour_id IN (701, 702, 703)")
            )
        except Exception:
            pass
        
        # Удаляем сами туры
        result = await session.execute(
            text("DELETE FROM tours WHERE id IN (701, 702, 703)")
        )
        await session.commit()
        print(f"✅ Удалено {result.rowcount} туров-заглушек")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(cleanup())
