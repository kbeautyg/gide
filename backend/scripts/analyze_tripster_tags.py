import json
import glob
import os

def analyze_tags():
    files = glob.glob("backend/data/*.json")
    all_tags = set()
    all_movement = set()
    all_formats = set()
    
    print("Analyzing Tripster data tags...")
    
    for file_path in files:
        country_name = os.path.basename(file_path).replace(".json", "").capitalize()
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            try:
                data, _ = json.JSONDecoder().raw_decode(content)
            except json.JSONDecodeError:
                start = content.find('{')
                if start != -1:
                    try:
                        data, _ = json.JSONDecoder().raw_decode(content[start:])
                    except:
                        continue
                else:
                    continue
            results = data.get("results", [])
            
            print(f"\n{country_name}: {len(results)} tours")
            
            tags_sample = []
            
            for item in results:
                # Tags
                if 'tags' in item:
                    for t in item['tags']:
                        all_tags.add(t.get('name'))
                        if len(tags_sample) < 5:
                            tags_sample.append(t.get('name'))
                
                # Movement
                if 'movement_type' in item:
                    all_movement.add(item['movement_type'])
                
                # Format (Tripster often puts this in 'format' or 'type')
                if 'format' in item:
                    all_formats.add(item['format'])

            print(f"  Sample tags: {', '.join(set(tags_sample))}")

    print("\n=== SUMMARY ===")
    print(f"Unique Tags: {len(all_tags)}")
    print(f"Movement Types: {all_movement}")
    print(f"Formats: {all_formats}")
    print("\nTop 20 Tags:")
    # Count frequency
    from collections import Counter
    tag_counter = Counter()
    for file_path in files:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            try:
                data, _ = json.JSONDecoder().raw_decode(content)
            except json.JSONDecodeError:
                start = content.find('{')
                if start != -1:
                    try:
                        data, _ = json.JSONDecoder().raw_decode(content[start:])
                    except:
                        continue
                else:
                    continue
            for item in data.get("results", []):
                if 'tags' in item:
                    for t in item['tags']:
                        tag_counter[t.get('name')] += 1
    
    for tag, count in tag_counter.most_common(20):
        print(f"{tag}: {count}")

if __name__ == "__main__":
    analyze_tags()

