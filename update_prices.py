import os
import json
import re
import sys
from pathlib import Path

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv(os.path.join('backend', '.env'))

from app.core.config import settings

def parse_price(price_str):
    """Parse price string and convert to RUB"""
    if not price_str:
        return None
        
    price_str = str(price_str).lower().strip()
    
    # Extract number (handle "750 USD", "€ 120", "5000 руб.", "от 50 $")
    numbers = re.findall(r'[\d\s]+', price_str)
    if not numbers:
        return None
        
    # Clean and convert to float
    amount_str = numbers[0].replace(' ', '').strip()
    if not amount_str:
        return None
    amount = float(amount_str)
    
    # Currency conversion rates (approximate)
    if 'usd' in price_str or '$' in price_str or 'дол' in price_str:
        return round(amount * 100)
    elif 'eur' in price_str or '€' in price_str or 'евр' in price_str:
        return round(amount * 105)
    elif 'thb' in price_str or 'бат' in price_str:
        return round(amount * 3)
    elif 'cny' in price_str or 'юан' in price_str:
        return round(amount * 14)
    elif 'aed' in price_str or 'дир' in price_str:
        return round(amount * 27)
    elif 'krw' in price_str or 'вон' in price_str:
        return round(amount * 0.07)
    elif 'jpy' in price_str or 'йен' in price_str or 'иен' in price_str:
        return round(amount * 0.65)
    elif 'idr' in price_str or 'рупи' in price_str:
        return round(amount * 0.006)
    elif 'inr' in price_str:
        return round(amount * 1.2)
    elif 'rub' in price_str or 'руб' in price_str or '₽' in price_str:
        return round(amount)
    
    # Default: if small number, assume USD/EUR; if big, assume RUB
    if amount < 1000:
        return round(amount * 100)
    return round(amount)

def normalize_title(title):
    """Normalize title for comparison"""
    if not title:
        return ""
    # Remove "Экскурсия по" prefix and extra spaces
    title = re.sub(r'^Экскурсия по\s+', '', title, flags=re.IGNORECASE)
    title = re.sub(r'\s+', ' ', title).strip().lower()
    return title

def main():
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    root_dir = Path("tour_rewriter/tours")
    
    # Step 1: Build a mapping of rewritten titles to original prices
    print("Step 1: Reading JSON files and building price map...")
    title_to_price = {}
    
    for country_dir in root_dir.iterdir():
        if not country_dir.is_dir(): continue
        
        for city_dir in country_dir.iterdir():
            if not city_dir.is_dir(): continue
            
            for tour_dir in city_dir.iterdir():
                if not tour_dir.is_dir(): continue
                
                json_path = tour_dir / "data.json"
                if not json_path.exists(): continue
                
                try:
                    with open(json_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    rewritten_title = data.get('rewritten', {}).get('title', '')
                    original_price_str = data.get('original', {}).get('original_price', '')
                    
                    if rewritten_title and original_price_str:
                        price_rub = parse_price(original_price_str)
                        if price_rub:
                            normalized = normalize_title(rewritten_title)
                            title_to_price[normalized] = {
                                'price': price_rub,
                                'original_str': original_price_str,
                                'full_title': rewritten_title
                            }
                except Exception as e:
                    print(f"Error reading {json_path}: {e}")
    
    print(f"Found {len(title_to_price)} tours with prices in JSON files")
    
    # Step 2: Get all tours from DB
    print("\nStep 2: Fetching tours from database...")
    result = db.execute(text("SELECT id, title, price FROM tours"))
    db_tours = list(result)
    print(f"Found {len(db_tours)} tours in database")
    
    # Step 3: Match and update
    print("\nStep 3: Matching and updating prices...")
    updated_count = 0
    not_found_count = 0
    
    for tour in db_tours:
        tour_id = tour.id
        tour_title = tour.title
        current_price = tour.price
        
        normalized_db_title = normalize_title(tour_title)
        
        # Try to find match
        matched_price_info = None
        
        # Exact match first
        if normalized_db_title in title_to_price:
            matched_price_info = title_to_price[normalized_db_title]
        else:
            # Fuzzy match - check if DB title contains or is contained in JSON title
            for json_title, price_info in title_to_price.items():
                if normalized_db_title in json_title or json_title in normalized_db_title:
                    matched_price_info = price_info
                    break
        
        if matched_price_info:
            new_price = matched_price_info['price']
            if new_price != current_price:
                db.execute(
                    text("UPDATE tours SET price = :price WHERE id = :id"),
                    {"price": new_price, "id": tour_id}
                )
                updated_count += 1
                print(f"[OK] Updated ID {tour_id}: {current_price} -> {new_price} RUB ({matched_price_info['original_str']})")
        else:
            not_found_count += 1
            # print(f"✗ No match for ID {tour_id}: {tour_title[:50]}...")
    
    db.commit()
    db.close()
    
    print(f"\n{'='*50}")
    print(f"Done!")
    print(f"Updated: {updated_count}")
    print(f"Not matched: {not_found_count}")
    print(f"Total in DB: {len(db_tours)}")

if __name__ == "__main__":
    main()
