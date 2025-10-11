"""
ThaiGuide Pro 3.0 - Главный файл приложения
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pytz
from datetime import datetime
import asyncio

from app.core.config import settings
from app.api.v1.router import api_router

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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8081,
        reload=True,
        log_level="info"
    )
