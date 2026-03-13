import asyncio
import os
import subprocess
import sys
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.tour import Tour

async def run_import_once():
    """
    Запускает импорт туров один раз при старте, если туров с Tripster еще нет
    или они требуют обновления (проверка по версии/дате).
    
    В данном случае просто запускаем обновление, так как это идемпотентная операция.
    """
    try:
        print("🔄 Auto-running Tripster import script on deployment...")
        
        # Путь к скрипту относительно корня проекта (где лежит Procfile)
        script_path = "backend/scripts/import_tripster_tours.py"
        normalize_path = "backend/scripts/normalize_locations.py"
        clean_path = "backend/scripts/clean_tour_texts.py"
        
        # 1. Run Import
        process = subprocess.Popen(
            [sys.executable, script_path],
            env={**os.environ, "PYTHONPATH": "backend"}
        )
        process.wait()
        
        if process.returncode == 0:
            print("✅ Auto-import completed successfully.")
        else:
            print(f"❌ Auto-import failed with code {process.returncode}")

        # 2. Run Normalization
        print("🔄 Running data normalization...")
        process_norm = subprocess.Popen(
            [sys.executable, normalize_path],
            env={**os.environ, "PYTHONPATH": "backend"}
        )
        process_norm.wait()
        
        if process_norm.returncode == 0:
            print("✅ Normalization completed successfully.")
        else:
            print(f"❌ Normalization failed with code {process_norm.returncode}")

        # 3. Run Text Cleaning (remove prices/payment info)
        print("🧹 Running text cleanup...")
        process_clean = subprocess.Popen(
            [sys.executable, clean_path],
            env={**os.environ, "PYTHONPATH": "backend"}
        )
        process_clean.wait()
        
        if process_clean.returncode == 0:
            print("✅ Text cleanup completed successfully.")
        else:
            print(f"❌ Text cleanup failed with code {process_clean.returncode}")
            
    except Exception as e:
        print(f"❌ Error running auto-import: {e}")

if __name__ == "__main__":
    # Простая проверка, чтобы не запускать при каждом локальном старте, если не нужно
    # Но на Railway это будет запускаться как post-deploy команда
    asyncio.run(run_import_once())

