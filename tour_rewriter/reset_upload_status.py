"""
Сброс статусов туров для повторной загрузки на Turex
"""
import os
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TOURS_DIR = os.path.join(BASE_DIR, "tours")

def reset_status():
    """Сбрасывает статус uploaded на processed для повторной загрузки"""
    count = 0
    
    for root, dirs, files in os.walk(TOURS_DIR):
        if "data.json" in files:
            data_file = os.path.join(root, "data.json")
            try:
                with open(data_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                
                # Если был uploaded - сбрасываем на processed
                if data.get("status") == "uploaded":
                    data["status"] = "processed"
                    data["turex_id"] = None  # Сбрасываем ID
                    
                    with open(data_file, "w", encoding="utf-8") as f:
                        json.dump(data, f, ensure_ascii=False, indent=2)
                    
                    count += 1
                    print(f"[OK] Reset: {os.path.basename(root)}")
                    
            except Exception as e:
                print(f"[ERR] {data_file}: {e}")
    
    print(f"\n[TOTAL] Reset {count} tours for re-upload")

if __name__ == "__main__":
    print("[START] Resetting tour statuses...")
    reset_status()
    print("[DONE] Now you can upload tours again.")

