"""
Конфигурация приложения
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Настройки приложения"""
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://supabase_admin:kkgw0gaylup95bsdlkjtlh90j1rj7kuaatzy22jgyv5tgogghvo9cmf7zpmwrxkx@yamabiko.proxy.rlwy.net:36914/postgres"
    )
    
    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv(
        "SUPABASE_KEY",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NDYxMzMyMDAsImV4cCI6MTkwMzg5OTYwMH0.LRUaNwqp5qFamFjI81ibwPZn75UtMK-odWFkRMAYyt0"
    )
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # App
    APP_BACKEND_URL: str = os.getenv("APP_BACKEND_URL", "http://localhost:8081")
    SECRET_KEY_BASE: str = os.getenv(
        "SECRET_KEY_BASE",
        "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2"
    )
    MASTER_KEY: str = os.getenv("MASTER_KEY", "AILA8ha8shddd73hOHDH7H3IDHI7DH37HDI@#@#@#@DUSHDUSAHDKSA")
    
    # JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", SECRET_KEY_BASE)
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    
    # Admin credentials
    SUPER_ADMIN_PHONE: str = os.getenv("SUPER_ADMIN_PHONE", "+79177445182")
    GUIDE_PHONE: str = os.getenv("GUIDE_PHONE", "+79932890755")
    
    # External APIs
    RAPIRA_API_URL: str = os.getenv("RAPIRA_API_URL", "https://api.rapira.net/open/market/rates")
    TELEGRAM_BOT_TOKEN: str = os.getenv(
        "TELEGRAM_BOT_TOKEN",
        "8409730364:AAF1NGhtiQaKkh_5QLi9DjFhgBUnVOosvUA"
    )
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
    ]
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Timezone
    TIMEZONE: str = "Europe/Moscow"
    
    # Комиссии
    SERVICE_COMMISSION: float = 2.8  # 2.8%
    EXCHANGER_COMMISSION: float = 0.2  # 0.2%
    TOTAL_COMMISSION: float = 3.0  # 3%
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
