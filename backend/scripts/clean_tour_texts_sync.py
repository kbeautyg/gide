"""
Синхронный скрипт для очистки существующих туров в базе от упоминаний цен и условий оплаты.
Использует psycopg2 напрямую для лучшей совместимости с Railway.
"""
import re
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import psycopg2
from psycopg2.extras import RealDictCursor


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
        "стоимость за человека", "стоимость экскурсии", "обратите внимание: стоимость"
    ]

    lines = text.split('\n')
    final_lines = []
    
    for line in lines:
        lower_line = line.lower()
        
        # If line contains any stop phrase, skip it entirely
        if any(phrase in lower_line for phrase in stop_phrases):
            continue
            
        # Also skip if it looks like a price list item (e.g. "Обед: 500 бат")
        if re.search(r'(?:стоимость|цена|билет|вход|расходы|питание|обед|ужин|депозит|сбор).*\d+', lower_line):
            if re.search(r'\d+', line):
                continue
                
        final_lines.append(line)
    
    cleaned_text = "\n".join(final_lines).strip()
    
    # 2. Clean any remaining loose prices
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
        if cleaned_item and len(cleaned_item) > 3:
            cleaned.append(cleaned_item)
    return cleaned


def main():
    # Get DATABASE_URL from environment
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        print("ERROR: DATABASE_URL not set")
        return
    
    print(f"Connecting to database...")
    
    try:
        # Try without SSL first (Railway internal connection)
        try:
            conn = psycopg2.connect(db_url, sslmode='disable')
        except:
            # Fallback to prefer SSL
            conn = psycopg2.connect(db_url, sslmode='prefer')
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get all Tripster tours
        cur.execute("SELECT id, title, description, what_to_expect, organizational_details, included, not_included FROM tours WHERE source = 'tripster'")
        tours = cur.fetchall()
        
        print(f"Found {len(tours)} Tripster tours to clean.")
        
        updated_count = 0
        for tour in tours:
            updates = {}
            
            # Clean description
            if tour['description']:
                new_desc = remove_prices_from_text(tour['description'])
                if new_desc != tour['description']:
                    updates['description'] = new_desc
            
            # Clean what_to_expect
            if tour['what_to_expect']:
                new_wte = remove_prices_from_text(tour['what_to_expect'])
                if new_wte != tour['what_to_expect']:
                    updates['what_to_expect'] = new_wte
            
            # Clean organizational_details
            if tour['organizational_details']:
                new_org = remove_prices_from_text(tour['organizational_details'])
                if new_org != tour['organizational_details']:
                    updates['organizational_details'] = new_org
            
            # Clean included list
            if tour['included']:
                new_inc = clean_list_items(tour['included'])
                if new_inc != tour['included']:
                    updates['included'] = new_inc
            
            # Clean not_included list
            if tour['not_included']:
                new_not_inc = clean_list_items(tour['not_included'])
                if new_not_inc != tour['not_included']:
                    updates['not_included'] = new_not_inc
            
            if updates:
                # Build UPDATE query
                set_clauses = []
                values = []
                for key, value in updates.items():
                    if isinstance(value, list):
                        set_clauses.append(f"{key} = %s::text[]")
                    else:
                        set_clauses.append(f"{key} = %s")
                    values.append(value)
                
                values.append(tour['id'])
                
                query = f"UPDATE tours SET {', '.join(set_clauses)} WHERE id = %s"
                cur.execute(query, values)
                
                updated_count += 1
                if updated_count <= 10:
                    print(f"  Cleaned: {tour['title'][:50]}...")
        
        conn.commit()
        cur.close()
        conn.close()
        
        print(f"Done! Updated {updated_count} tours.")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()

