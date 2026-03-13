import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

sys.path.append(os.path.join(os.getcwd(), 'backend'))
load_dotenv(os.path.join('backend', '.env'))

from app.core.config import settings

def main():
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT id, title, price, location FROM tours LIMIT 20"))
        print("Tours in DB:")
        for row in result:
            print(f"ID: {row.id}, Price: {row.price}, Title: {row.title}")

if __name__ == "__main__":
    main()








