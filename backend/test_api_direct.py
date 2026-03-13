"""
Прямой тест API для проверки ошибок
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.db.session import async_session
from app.services.recommendation_service import RecommendationService


async def test_smart_recommendations():
    """Тест умных рекомендаций"""
    print("=" * 80)
    print("ТЕСТ: Smart Recommendations")
    print("=" * 80)
    
    async with async_session() as db:
        try:
            print("\n1️⃣ Вызываю get_smart_recommendations...")
            tours = await RecommendationService.get_smart_recommendations(
                db,
                tour_id=None,
                user_id=None,
                location=None,
                limit=6
            )
            print(f"✅ Получено {len(tours)} туров")
            print(f"   Тип: {type(tours)}")
            if tours:
                print(f"   Первый тур: {type(tours[0])}")
                print(f"   ID: {tours[0].id}")
                print(f"   Title: {tours[0].title}")
            
            print("\n2️⃣ Пытаюсь сериализовать...")
            for tour in tours:
                try:
                    tour_dict = {
                        "id": tour.id,
                        "title": tour.title,
                        "price": tour.price,
                    }
                    print(f"   ✅ Тур {tour.id} сериализуется")
                except Exception as e:
                    print(f"   ❌ Ошибка тура {tour.id}: {e}")
            
            print("\n✅ ВСЕ ОК!")
            
        except Exception as e:
            print(f"\n❌ ОШИБКА: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()


async def test_dynamic_navigation():
    """Тест динамической навигации"""
    print("\n" + "=" * 80)
    print("ТЕСТ: Dynamic Navigation")
    print("=" * 80)
    
    async with async_session() as db:
        try:
            print("\n1️⃣ Вызываю get_dynamic_categories_from_tours...")
            nav_data = await RecommendationService.get_dynamic_categories_from_tours(db)
            print(f"✅ Получено данных")
            print(f"   Тип: {type(nav_data)}")
            print(f"   Ключи: {list(nav_data.keys())}")
            for key, value in nav_data.items():
                print(f"   {key}: {len(value)} элементов")
            
            print("\n✅ ВСЕ ОК!")
            
        except Exception as e:
            print(f"\n❌ ОШИБКА: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_smart_recommendations())
    asyncio.run(test_dynamic_navigation())


