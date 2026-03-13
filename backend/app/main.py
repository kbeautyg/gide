"""
ThaiGuide Pro 3.0 - Главный файл приложения
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import pytz
from datetime import datetime
import asyncio

from app.core.config import settings
from app.api.v1.router import api_router
from app.core.deps import get_current_user_ws
from app.services.websocket_service import manager
from app.models.user import User

# Установка московского времени глобально
import os
os.environ['TZ'] = 'Europe/Moscow'

app = FastAPI(
    title="Inturex Pro API",
    description="Платформа для туризма в Таиланде с системой управления финансами",
    version="3.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Статические файлы для загруженных изображений
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
os.makedirs(os.path.join(STATIC_DIR, "uploads"), exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Корневой эндпоинт"""
    moscow_tz = pytz.timezone('Europe/Moscow')
    current_time = datetime.now(moscow_tz)
    
    return JSONResponse({
        "message": "🏝️ Inturex Pro 3.0 API",
        "version": "3.0.0",
        "status": "running",
        "timezone": "Europe/Moscow (UTC+3)",
        "current_time": current_time.isoformat(),
        "docs": "/api/docs"
    })


@app.get("/health")
async def health_check():
    """Проверка здоровья приложения"""
    moscow_tz = pytz.timezone('Europe/Moscow')
    current_time = datetime.now(moscow_tz)
    
    return JSONResponse({
        "status": "healthy",
        "timestamp": current_time.isoformat(),
        "timezone": "Europe/Moscow"
    })


@app.get("/db-status")
async def db_status():
    """Диагностика состояния БД"""
    from sqlalchemy import text
    from app.db.session import async_session
    
    result = {
        "db_host": settings.DATABASE_URL.split("@")[1].split("/")[0] if "@" in settings.DATABASE_URL else "unknown",
        "tours_count": 0,
        "tours_active": 0,
        "tours_public": 0,
        "tours_active_public": 0,
        "articles_count": 0,
        "sample_locations": [],
        "status": "unknown"
    }
    
    try:
        async with async_session() as session:
            # Всего туров
            tours_result = await session.execute(text("SELECT COUNT(*) FROM tours"))
            result["tours_count"] = tours_result.scalar()
            
            # Активных туров
            active_result = await session.execute(text("SELECT COUNT(*) FROM tours WHERE active = TRUE"))
            result["tours_active"] = active_result.scalar()
            
            # Публичных туров
            public_result = await session.execute(text("SELECT COUNT(*) FROM tours WHERE is_public = TRUE"))
            result["tours_public"] = public_result.scalar()
            
            # Активных И публичных
            both_result = await session.execute(text("SELECT COUNT(*) FROM tours WHERE active = TRUE AND is_public = TRUE"))
            result["tours_active_public"] = both_result.scalar()
            
            # Примеры locations
            loc_result = await session.execute(text("SELECT DISTINCT location FROM tours LIMIT 10"))
            result["sample_locations"] = [row[0] for row in loc_result.fetchall()]
            
            # Статьи
            try:
                articles_result = await session.execute(text("SELECT COUNT(*) FROM articles"))
                result["articles_count"] = articles_result.scalar()
            except:
                result["articles_count"] = "table not exists"
            
            result["status"] = "connected"
    except Exception as e:
        result["status"] = f"error: {str(e)}"
    
    return JSONResponse(result)


@app.post("/fix-tours")
async def fix_tours():
    """Принудительно устанавливает is_public=TRUE и active=TRUE для всех туров"""
    from sqlalchemy import text
    from app.db.session import async_session
    
    try:
        async with async_session() as session:
            # Обновляем is_public
            result1 = await session.execute(text("UPDATE tours SET is_public = TRUE WHERE is_public = FALSE OR is_public IS NULL"))
            updated_public = result1.rowcount
            
            # Обновляем active
            result2 = await session.execute(text("UPDATE tours SET active = TRUE WHERE active = FALSE OR active IS NULL"))
            updated_active = result2.rowcount
            
            await session.commit()
            
            # Проверяем результат
            check = await session.execute(text("SELECT COUNT(*) FROM tours WHERE is_public = TRUE AND active = TRUE"))
            final_count = check.scalar()
            
            return JSONResponse({
                "success": True,
                "updated_public": updated_public,
                "updated_active": updated_active,
                "total_visible": final_count
            })
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)})


@app.post("/fix-locations")
async def fix_locations():
    """Исправляет города которые записаны как страны"""
    from sqlalchemy import text
    from app.db.session import async_session
    
    try:
        async with async_session() as session:
            # Находим туры с неправильными location
            result = await session.execute(text("""
                SELECT id, location FROM tours 
                WHERE location NOT LIKE '%, %' 
                   OR location LIKE '%, Чэнду%'
                   OR location LIKE '%, Чжанцзяцзе%'
                   OR (location LIKE '%Чэнду%' AND location NOT LIKE '%Китай%')
                   OR (location LIKE '%Чжанцзяцзе%' AND location NOT LIKE '%Китай%')
            """))
            bad_tours = result.fetchall()
            
            fixes = []
            for tour_id, location in bad_tours:
                if 'Чэнду' in location:
                    await session.execute(text(f"UPDATE tours SET location = 'Чэнду, Китай' WHERE id = {tour_id}"))
                    fixes.append(f"{tour_id}: {location} -> Чэнду, Китай")
                elif 'Чжанцзяцзе' in location:
                    await session.execute(text(f"UPDATE tours SET location = 'Чжанцзяцзе, Китай' WHERE id = {tour_id}"))
                    fixes.append(f"{tour_id}: {location} -> Чжанцзяцзе, Китай")
            
            await session.commit()
            
            return JSONResponse({
                "success": True,
                "fixed": len(fixes),
                "details": fixes
            })
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)})


# Подключение API роутов
app.include_router(api_router, prefix="/api/v1")


# WebSocket для реального времени обновлений
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = None):
    """
    WebSocket endpoint для real-time обновлений
    
    Подключение: ws://localhost:8081/ws?token=<JWT_TOKEN>
    """
    try:
        # Получаем пользователя из токена
        user = await get_current_user_ws(token)
        if not user:
            await websocket.close(code=1008, reason="Unauthorized")
            return
        
        # Подключаем пользователя
        await manager.connect(websocket, user.id)
        
        try:
            # Отправляем приветственное сообщение
            await manager.send_personal_message({
                "type": "connected",
                "user_id": user.id,
                "message": "Connected to Inturex Pro WebSocket"
            }, user.id)
            
            # Держим соединение открытым и слушаем ping/pong
            while True:
                try:
                    data = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                    # Клиент может отправлять ping
                    if data == "ping":
                        await websocket.send_text("pong")
                except asyncio.TimeoutError:
                    # Отправляем ping сами
                    try:
                        await websocket.send_text("ping")
                    except:
                        break
                        
        except WebSocketDisconnect:
            await manager.disconnect(websocket, user.id)
        except Exception as e:
            print(f"WebSocket error for user {user.id}: {e}")
            await manager.disconnect(websocket, user.id)
            
    except Exception as e:
        print(f"WebSocket connection error: {e}")
        try:
            await websocket.close(code=1011, reason="Internal error")
        except:
            pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8081,
        reload=True,
        log_level="info"
    )
