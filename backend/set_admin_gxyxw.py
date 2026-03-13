import asyncio
import os
import sys

# Добавляем текущую директорию в путь, чтобы импортировать app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import select, or_
from app.db.session import async_session
from app.models.user import User, UserRole

async def set_admin():
    target_username = "gxyxw"
    target_username_at = "@gxyxw"
    
    print(f"🔍 Поиск пользователя {target_username_at} для назначения админом...")
    
    async with async_session() as session:
        # Поиск пользователя по username или name
        # Также проверяем, не сохранил ли он username в поле email (бывает и такое)
        query = select(User).where(
            or_(
                User.username == target_username,
                User.username == target_username_at,
                User.name == target_username,
                User.name == target_username_at,
                User.email == target_username, # На случай если ввели в email
                User.email == target_username_at
            )
        )
        result = await session.execute(query)
        user = result.scalars().first()
        
        if user:
            print(f"✅ Пользователь найден: {user.phone} (ID: {user.id}, Name: {user.name})")
            
            updated = False
            if user.role != UserRole.ADMIN:
                user.role = UserRole.ADMIN
                updated = True
                print(f"👑 Роль обновлена на ADMIN")
            else:
                print(f"ℹ️ Пользователь уже имеет роль ADMIN")
                
            if updated:
                await session.commit()
                print("💾 Изменения сохранены в БД")
        else:
            print(f"⚠️ Пользователь '{target_username_at}' не найден в полях username, name или email.")
            print("   Убедитесь, что пользователь зарегистрирован и указал это имя.")

if __name__ == "__main__":
    asyncio.run(set_admin())
