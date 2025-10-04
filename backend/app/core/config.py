from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # App
    APP_NAME: str = "FastChange 3.0"
    DEBUG: bool = True
    TIMEZONE: str = "Europe/Moscow"
    
    # Database
    DATABASE_URL: str
    
    # Supabase
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 дней
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
