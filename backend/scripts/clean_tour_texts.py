"""
Скрипт для очистки существующих туров в базе от упоминаний цен и условий оплаты.
Запускается один раз для исправления уже импортированных данных.
"""
import asyncio
import re
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.tour import Tour


def remove_prices_from_text(text):
    if not text:
        return ""
    
    # 1. Specific stop phrases that kill the whole paragraph/line
    stop_phrases = [
        "после внесения", "предоплат", "оплатить наличными", "стоимость тура", 
        "доплата", "входной билет", "цены на билет", "дополнительные расходы",
        "при размещении", "за 1 человека", "оплачивается отдельно", "в стоимость включено",
        "не включено в стоимость", "при проживании в отеле", "2-местном размещении",
        "остальную сумму", "в день начала тура", "в долларах или евро",
        "звёздочном отеле", "звездочном отеле", "5 звёзд", "4 звезды", "3 звезды",
        "стоимость за человека", "стоимость экскурсии"
    ]

    lines = text.split('\n')
    final_lines = []
    
    for line in lines:
        lower_line = line.lower()
        
        # If line contains any stop phrase, skip it entirely
        if any(phrase in lower_line for phrase in stop_phrases):
            continue
            
        # Also skip if it looks like a price list item (e.g. "Обед: 500 бат")
        # Regex detects lines with currency words AND numbers
        if re.search(r'(?:стоимость|цена|билет|вход|расходы|питание|обед|ужин|депозит|сбор).*\d+', lower_line):
            if re.search(r'\d+', line): # Double check it has numbers
                continue
                
        final_lines.append(line)
    
    cleaned_text = "\n".join(final_lines).strip()
    
    # 2. Clean any remaining loose prices (e.g. in middle of sentences)
    price_pattern = r'(?:\(|^|\s)(\d+(?:[\s\.,]\d+)?)\s*(?:RUB|USD|EUR|THB|CNY|AED|JPY|IDR|MYR|VND|GEL|TRY|SGD|KRW|бат|евро|доллар|руб|юан|йен|лир|дирхам|ринггит|вон|[\$€₽¥฿])(?:\)|$|[\s\.,])'
    
    cleaned_text = re.sub(price_pattern, ' ', cleaned_text, flags=re.IGNORECASE)
    
    # 3. Remove double newlines and extra spaces
    cleaned_text = re.sub(r'\n{3,}', '\n\n', cleaned_text)
    cleaned_text = re.sub(r' {2,}', ' ', cleaned_text)
    
    return cleaned_text.strip()


def clean_list_items(items):
    if not items:
        return items
    
    cleaned = []
    for item in items:
        cleaned_item = remove_prices_from_text(item)
        if cleaned_item and len(cleaned_item) > 3:  # Skip empty or too short items
            cleaned.append(cleaned_item)
    return cleaned


async def clean_all_tours():
    db_url = settings.DATABASE_URL
    # Handle SSL for asyncpg
    if "postgresql://" in db_url:
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://")
    # Remove sslmode if present (asyncpg handles it differently)
    if "?sslmode" in db_url:
        db_url = db_url.split("?")[0]
    
    engine = create_async_engine(db_url, echo=False, connect_args={"ssl": False})
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Get all Tripster tours
        stmt = select(Tour).where(Tour.source == 'tripster')
        result = await session.execute(stmt)
        tours = result.scalars().all()
        
        print(f"Found {len(tours)} Tripster tours to clean.")
        
        updated_count = 0
        for tour in tours:
            changed = False
            
            # Clean description
            if tour.description:
                new_desc = remove_prices_from_text(tour.description)
                if new_desc != tour.description:
                    tour.description = new_desc
                    changed = True
            
            # Clean what_to_expect
            if tour.what_to_expect:
                new_wte = remove_prices_from_text(tour.what_to_expect)
                if new_wte != tour.what_to_expect:
                    tour.what_to_expect = new_wte
                    changed = True
            
            # Clean organizational_details
            if tour.organizational_details:
                new_org = remove_prices_from_text(tour.organizational_details)
                if new_org != tour.organizational_details:
                    tour.organizational_details = new_org
                    changed = True
            
            # Clean included list
            if tour.included:
                new_inc = clean_list_items(tour.included)
                if new_inc != tour.included:
                    tour.included = new_inc
                    changed = True
            
            # Clean not_included list
            if tour.not_included:
                new_not_inc = clean_list_items(tour.not_included)
                if new_not_inc != tour.not_included:
                    tour.not_included = new_not_inc
                    changed = True
            
            if changed:
                updated_count += 1
                if updated_count <= 5:
                    print(f"  Cleaned: {tour.title[:50]}...")
        
        await session.commit()
        print(f"Done! Updated {updated_count} tours.")


if __name__ == "__main__":
    asyncio.run(clean_all_tours())

