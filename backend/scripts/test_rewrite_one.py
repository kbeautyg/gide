"""
Тестовый скрипт для рерайта одного тура через ChatGPT.
Позволяет проверить работу промпта перед массовым запуском.

Использование:
$env:OPENAI_API_KEY='sk-...'
python backend/scripts/test_rewrite_one.py
"""

import asyncio
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import openai

OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')

REWRITE_PROMPT = """Ты — профессиональный копирайтер туристического агентства. Твоя задача — переписать описание экскурсии, сделав его уникальным, привлекательным и информативным.

ВАЖНЫЕ ПРАВИЛА:
1. НЕ упоминай цены, стоимость, доллары, евро, рубли, баты и любые денежные суммы
2. НЕ упоминай условия оплаты, предоплаты, наличные
3. НЕ упоминай звёздность отелей (3 звезды, 4 звезды, 5 звёзд)
4. НЕ копируй текст дословно — сделай полный рерайт
5. Пиши живым, эмоциональным языком, но без излишней восторженности
6. Сохрани все факты, локации и достопримечательности
7. Если есть псевдо-заголовки (Питание., Транспорт., Дети.), объедини их с текстом в единый абзац

ВХОДНЫЕ ДАННЫЕ ЭКСКУРСИИ:
{tour_data}

Верни ответ СТРОГО в формате JSON (без markdown, без ```json):
{{
    "title": "Название экскурсии (можно немного улучшить, но сохранить суть)",
    "description": "Полное описание экскурсии (2-4 абзаца, живой текст)",
    "what_to_expect": "Что вас ожидает (краткое, 1-2 предложения, интригующее)",
    "organizational_details": "Организационные детали (без цен! только практическая информация: что взять, как одеться, уровень сложности)",
    "included": ["Что включено - пункт 1", "Что включено - пункт 2", "..."],
    "not_included": ["Что не включено - пункт 1", "Что не включено - пункт 2", "..."],
    "meeting_point": "Место встречи (если известно, иначе null)",
    "tags": ["тег1", "тег2", "тег3"],
    "themes": ["тема1", "тема2"],
    "landmarks": ["достопримечательность1", "достопримечательность2"],
    "reviews": [
        {{"name": "Имя", "rating": 5, "text": "Текст отзыва (если нет отзывов, придумай 3-5 реалистичных)"}},
        ...
    ]
}}

ВАЖНО: Ответ должен быть валидным JSON без лишних символов!"""


async def test_one_tour():
    if not OPENAI_API_KEY:
        print("ERROR: Set OPENAI_API_KEY first!")
        print("$env:OPENAI_API_KEY='sk-...'")
        return
    
    # Тестовые данные (взяты из реального Tripster тура)
    test_tour = {
        "title": "Путешествие из Дели в Джайпур: увидеть Индию за 5 дней",
        "tagline": "Увидеть Дворец Ветров, поторговаться на местных рынках и насладиться национальными танцами",
        "annotation": "Предлагаем лучшую программу, чтобы всего за 5 дней увидеть главные места Индии и влюбиться в её яркие краски. Маршрут уже составлен: из столицы отправимся в город любви, а оттуда — в «розовый город» (Дели, Агра и Джайпур). Вас ждут как классические достопримечательности — Тадж-Махал, Агра Форт и Хава-Махал, так и необычные локации.",
        "additional_info": "Питание. В стоимость тура входят завтраки. Остальное питание оплачивается отдельно.\n\nТранспорт. До отдалённых точек маршрута будем добираться на общественном транспорте/самолёте.\n\nДети. Только 18+.\n\nСвязь и интернет. Можно приобрести сим-карту по прилёте.\n\nВиза. Вы можете оформить электронную визу. Стоимость рассчитывается индивидуально в зависимости от курса доллара.\n\nУровень сложности. Лёгкий. Спокойный темп, пешие прогулки до 15 км.",
        "comfort_level_info": "",
        "price_included": "<ul><li>Проживание</li><li>Завтраки</li><li>Трансфер</li><li>Услуги гида</li></ul>",
        "price_not_included": "<ul><li>Билеты до Дели</li><li>Обеды и ужины</li><li>Входные билеты</li><li>Обратите внимание: стоимость тура указана при размещении в 3-звёздочном отеле, при проживании в отеле 4 звезды — 699 $, в отеле 5 звёзд — 899 $</li></ul>",
        "location": "Дели, Индия",
        "country": "Индия",
        "city": "Дели",
        "duration_hours": 96,
        "max_persons": 20,
        "rating": 5.0,
        "review_count": 0,
        "movement_type": "car"
    }
    
    print("=" * 60)
    print("TEST: Rewriting one tour via ChatGPT")
    print("=" * 60)
    print(f"\nOriginal title: {test_tour['title']}")
    print(f"Location: {test_tour['location']}")
    print(f"Duration: {test_tour['duration_hours']} hours")
    print("\nSending to ChatGPT...")
    
    client = openai.AsyncOpenAI(api_key=OPENAI_API_KEY)
    
    prompt = REWRITE_PROMPT.format(tour_data=json.dumps(test_tour, ensure_ascii=False, indent=2))
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Ты профессиональный копирайтер. Отвечай только валидным JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        content = response.choices[0].message.content.strip()
        
        # Убираем markdown обёртки
        if content.startswith('```json'):
            content = content[7:]
        if content.startswith('```'):
            content = content[3:]
        if content.endswith('```'):
            content = content[:-3]
        content = content.strip()
        
        print("\n" + "=" * 60)
        print("RAW RESPONSE:")
        print("=" * 60)
        print(content[:1000] + "..." if len(content) > 1000 else content)
        
        # Парсим JSON
        result = json.loads(content)
        
        print("\n" + "=" * 60)
        print("PARSED RESULT:")
        print("=" * 60)
        print(f"\nTitle: {result.get('title')}")
        print(f"\nDescription:\n{result.get('description')[:500]}...")
        print(f"\nWhat to expect: {result.get('what_to_expect')}")
        print(f"\nOrganizational details:\n{result.get('organizational_details')[:300]}...")
        print(f"\nIncluded: {result.get('included')}")
        print(f"\nNot included: {result.get('not_included')}")
        print(f"\nTags: {result.get('tags')}")
        print(f"\nThemes: {result.get('themes')}")
        print(f"\nLandmarks: {result.get('landmarks')}")
        print(f"\nReviews count: {len(result.get('reviews', []))}")
        
        if result.get('reviews'):
            print("\nSample review:")
            print(f"  {result['reviews'][0]}")
        
        print("\n" + "=" * 60)
        print("SUCCESS! The rewrite looks good.")
        print("=" * 60)
        
        # Сохраняем результат в файл для проверки
        with open("backend/scripts/test_rewrite_result.json", "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print("\nResult saved to: backend/scripts/test_rewrite_result.json")
        
    except json.JSONDecodeError as e:
        print(f"\n❌ JSON parse error: {e}")
        print(f"Raw content:\n{content}")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_one_tour())



