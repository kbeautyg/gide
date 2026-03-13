import json
import glob

def inspect_prices():
    files = glob.glob("backend/data/*.json")
    for file_path in files:
        print(f"--- {file_path} ---")
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                # Handle concatenated JSONs (same logic as import script)
                try:
                    data, _ = json.JSONDecoder().raw_decode(content)
                except json.JSONDecodeError:
                    start = content.find('{')
                    if start != -1:
                        try:
                            data, _ = json.JSONDecoder().raw_decode(content[start:])
                        except:
                            print("Failed to parse")
                            continue
                    else:
                        print("No JSON found")
                        continue
                
                results = data.get("results", [])
                for i, item in enumerate(results[:5]):
                    price = item.get('price')
                    print(f"Tour: {item.get('title')[:30]}... | Price: {price}")
                    
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    inspect_prices()






