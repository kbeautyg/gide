"""
Скрипт для удаления ВСЕХ туров с Inturex
Запуск: python delete_all_tours.py
"""

import requests
import time

TUREX_API_URL = "https://gide-production.up.railway.app"
TUREX_PHONE = "79177445182"
TUREX_PASSWORD = "admin123"

def login():
    """Логин в Inturex"""
    response = requests.post(
        f"{TUREX_API_URL}/api/v1/auth/login",
        json={"phone": TUREX_PHONE, "password": TUREX_PASSWORD},
        headers={"Content-Type": "application/json"}
    )
    if response.status_code == 200:
        data = response.json()
        return data.get("access_token")
    else:
        print(f"Login failed: {response.status_code} - {response.text}")
        return None

def get_all_tours(token):
    """Получает список всех туров"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    all_tours = []
    page = 1
    
    while True:
        response = requests.get(
            f"{TUREX_API_URL}/api/v1/tours?page={page}&page_size=100",
            headers=headers
        )
        
        if response.status_code != 200:
            print(f"Error getting tours: {response.status_code}")
            break
            
        data = response.json()
        tours = data.get("tours", [])
        
        if not tours:
            break
            
        all_tours.extend(tours)
        print(f"Loaded page {page}, total tours: {len(all_tours)}")
        
        if len(tours) < 100:
            break
            
        page += 1
    
    return all_tours

def delete_tour(token, tour_id):
    """Удаляет тур по ID"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    for attempt in range(3):
        try:
            response = requests.delete(
                f"{TUREX_API_URL}/api/v1/admin/tours/{tour_id}",
                headers=headers,
                timeout=30
            )
            return response.status_code == 200
        except Exception as e:
            if attempt < 2:
                time.sleep(2)
            else:
                print(f"    Timeout error for {tour_id}")
                return False
    return False

def main():
    print("=" * 60)
    print("УДАЛЕНИЕ ВСЕХ ТУРОВ С TUREX")
    print("=" * 60)
    
    # Логин
    print("\n[1/3] Логин в Inturex...")
    token = login()
    if not token:
        print("Ошибка логина!")
        return
    print("[OK] Успешный логин")
    
    # Получаем все туры
    print("\n[2/3] Загрузка списка туров...")
    tours = get_all_tours(token)
    print(f"[OK] Найдено {len(tours)} туров")
    
    if not tours:
        print("Нет туров для удаления")
        return
    
    # Автоматическое подтверждение (без интерактивного ввода)
    print(f"\nУдаляем ВСЕ {len(tours)} туров...")
    
    # Удаление
    print(f"\n[3/3] Удаление {len(tours)} туров...")
    deleted = 0
    errors = 0
    
    for i, tour in enumerate(tours):
        tour_id = tour.get("id")
        title = tour.get("title", "Unknown")[:50]
        
        if delete_tour(token, tour_id):
            deleted += 1
            print(f"  [{i+1}/{len(tours)}] [OK] Deleted: {tour_id}")
        else:
            errors += 1
            print(f"  [{i+1}/{len(tours)}] [ERROR] Failed: {tour_id}")
        
        # Небольшая пауза чтобы не перегрузить API
        if (i + 1) % 10 == 0:
            time.sleep(0.5)
    
    print("\n" + "=" * 60)
    print(f"ГОТОВО!")
    print(f"Удалено: {deleted}")
    print(f"Ошибок: {errors}")
    print("=" * 60)

if __name__ == "__main__":
    main()

