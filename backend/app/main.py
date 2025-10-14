"""
ThaiGuide Pro 3.0 - Главный файл приложения
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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
    title="ThaiGuide Pro API",
    description="Платформа для туризма в Таиланде с системой управления финансами",
    version="3.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

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
        "message": "🏝️ ThaiGuide Pro 3.0 API",
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
                "message": "Connected to ThaiGuide Pro WebSocket"
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
