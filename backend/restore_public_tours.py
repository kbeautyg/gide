"""
ПРОСТОЕ восстановление публичных туров
Запускается на Railway для восстановления каталога
"""
import asyncio
import os

# Устанавливаем переменную окружения для принудительного создания
os.environ['FORCE_CREATE_TOURS'] = 'true'

async def restore():
    """Восстановить публичные туры"""
    print("🚀 ВОССТАНОВЛЕНИЕ ПУБЛИЧНЫХ ТУРОВ...")
    print("=" * 60)
    
    # Запускаем init_production_data который проверяет и создаёт туры
    from init_production_data import init_data
    await init_data()
    
    print("\n" + "=" * 60)
    print("✅ ТУРЫ ВОССТАНОВЛЕНЫ!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(restore())

