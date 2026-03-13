import json

def inspect_item():
    with open("backend/data/thailand.json", "r", encoding="utf-8") as f:
        content = f.read()
        data, _ = json.JSONDecoder().raw_decode(content)
        item = data.get("results")[0]
        print("Item keys:", item.keys())
        print("\nTagline:", item.get('tagline'))
        print("\nType:", item.get('type'))
        print("\nFormat:", item.get('format'))
        print("\nMovement Type:", item.get('movement_type'))
        # Check for hidden tags or categories
        # 'geo' might have tags?
        print("\nGeo:", item.get('geo'))

if __name__ == "__main__":
    inspect_item()






