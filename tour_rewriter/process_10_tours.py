"""
Скрипт для обработки 10 туров через ChatGPT и загрузки на Turex
"""

import requests
import json
import time

BASE_URL = "http://localhost:5000"
TUREX_URL = "https://gide-production.up.railway.app"

API_KEY = "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"
MODEL = "gpt-5.1"

# Turex credentials (phone, not email!)
TUREX_PHONE = "79177445182"  # Admin phone
TUREX_PASSWORD = "admin123"

def main():
    print("=" * 60)
    print("Processing 10 Tours and Uploading to Turex")
    print("=" * 60)
    
    # 1. Set API key
    print("\n[1/5] Setting API key...")
    resp = requests.post(f"{BASE_URL}/api/set-api-key", json={
        "api_key": API_KEY,
        "model": MODEL
    })
    print(f"  Result: {resp.json()}")
    
    # 2. Load tours
    print("\n[2/5] Loading tours...")
    resp = requests.post(f"{BASE_URL}/api/load-tours")
    data = resp.json()
    print(f"  Loaded: {data.get('total', 0)} tours")
    
    # 3. Login to Turex
    print("\n[3/5] Logging into Turex...")
    resp = requests.post(f"{BASE_URL}/api/turex-login", json={
        "phone": TUREX_PHONE,
        "password": TUREX_PASSWORD
    })
    login_result = resp.json()
    print(f"  Result: {login_result}")
    
    if not login_result.get("success"):
        print("  ERROR: Failed to login to Turex!")
        return
    
    # 4. Process 10 tours
    print("\n[4/5] Processing 10 tours through ChatGPT...")
    
    processed = []
    for i in range(10):
        print(f"\n  Processing tour #{i}...")
        
        # Get tour data
        resp = requests.get(f"{BASE_URL}/api/get-tour/{i}")
        tour_data = resp.json()
        print(f"    Title: {tour_data.get('title', 'Unknown')[:50]}...")
        
        # Process through ChatGPT
        resp = requests.post(f"{BASE_URL}/api/process-single/{i}")
        result = resp.json()
        
        if result.get("success"):
            print(f"    ChatGPT: OK")
            processed.append(i)
        else:
            print(f"    ChatGPT: ERROR - {result.get('error', 'Unknown')[:100]}")
        
        # Small delay between API calls
        time.sleep(2)
    
    print(f"\n  Processed: {len(processed)}/10 tours")
    
    # 5. Upload to Turex
    print("\n[5/5] Uploading to Turex...")
    
    uploaded = 0
    for i in processed:
        print(f"\n  Uploading tour #{i}...")
        resp = requests.post(f"{BASE_URL}/api/upload-to-turex/{i}")
        result = resp.json()
        
        if result.get("success"):
            print(f"    Turex: {result.get('action', 'OK')} - ID: {result.get('tour_id')}")
            uploaded += 1
        else:
            print(f"    Turex: ERROR - {result.get('error', 'Unknown')[:100]}")
    
    print("\n" + "=" * 60)
    print(f"DONE! Processed: {len(processed)}/10, Uploaded: {uploaded}/10")
    print("=" * 60)


if __name__ == "__main__":
    main()

