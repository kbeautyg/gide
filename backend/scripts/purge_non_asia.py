"""
Скрипт для удаления неазиатского контента из БД
Только для экскурсий по Азии
"""
import asyncio
from sqlalchemy import select, delete
from app.db.session import SessionLocal
from app.models.tour import Tour
from app.models.booking import Booking

# Список азиатских стран (включая Турцию и Грузию как трансконтинентальные)
ASIAN_COUNTRIES = [
    'Таиланд', 'Грузия', 'Турция', 'ОАЭ', 'Вьетнам', 'Япония', 'Корея', 
    'Китай', 'Индия', 'Индонезия', 'Малайзия', 'Сингапур', 'Филиппины',
    'Камбоджа', 'Лаос', 'Мьянма', 'Бруней', 'Таджикистан', 'Узбекистан',
    'Казахстан', 'Киргизия', 'Армения', 'Азербайджан', 'Монголия', 'Непал',
    'Бангладеш', 'Пакистан', 'Шри-Ланка', 'Мальдивы', 'Бутан', 'Афганистан',
    'Южная Корея', 'Северная Корея', 'Мьянма (Бирма)', 'Тайвань', 'Гонконг',
    'Макао', 'Тимор-Лешти', 'Восточный Тимор'
]

# Города, которые однозначно в Азии
ASIAN_CITIES = [
    'Тбилиси', 'Батуми', 'Стамбул', 'Анкара', 'Бангкок', 'Пхукет', 'Паттайя',
    'Дубай', 'Абу-Даби', 'Ханой', 'Хошимин', 'Токио', 'Киото', 'Сеул',
    'Пекин', 'Шанхай', 'Дели', 'Мумбаи', 'Джакарта', 'Бали', 'Куала-Лумпур',
    'Сингапур', 'Манила', 'Пномпень', 'Вьентьян', 'Янгон', 'Бандар-Сери-Бегаван',
    'Ташкент', 'Самарканд', 'Алматы', 'Астана', 'Бишкек', 'Ереван', 'Баку',
    'Улан-Батор', 'Катманду', 'Дакка', 'Исламабад', 'Карачи', 'Коломбо',
    'Мале', 'Тхимпху', 'Кабул', 'Краби', 'Чиангмай', 'Ко Самуи', 'Канди',
    'Гоа', 'Джайпур', 'Агра', 'Варанаси', 'Убуд', 'Семиньяк', 'Нуса Дуа',
    'Лангкави', 'Пенанг', 'Боракай', 'Себу', 'Сием Реап', 'Луанг Прабанг',
    'Нячанг', 'Далат', 'Хойан', 'Осака', 'Хиросима', 'Нара', 'Пусан',
    'Чеджу', 'Сиань', 'Гуанчжоу', 'Ченду', 'Тайбэй', 'Хайнань', 'Санья'
]


async def purge_non_asia():
    """Удалить все туры, не относящиеся к Азии"""
    print("🔍 Начинаю анализ базы данных...")
    
    async with SessionLocal() as session:
        # Получаем все туры
        result = await session.execute(select(Tour))
        all_tours = result.scalars().all()
        
        print(f"📊 Всего туров в БД: {len(all_tours)}")
        
        tours_to_delete = []
        tours_to_keep = []
        
        for tour in all_tours:
            location = tour.location or ""
            
            # Проверяем, содержит ли location азиатские ключевые слова
            is_asian = False
            
            # Проверка по городам
            for city in ASIAN_CITIES:
                if city.lower() in location.lower():
                    is_asian = True
                    break
            
            # Проверка по странам
            if not is_asian:
                for country in ASIAN_COUNTRIES:
                    if country.lower() in location.lower():
                        is_asian = True
                        break
            
            if is_asian:
                tours_to_keep.append(tour)
            else:
                tours_to_delete.append(tour)
        
        print(f"\n✅ Азиатские туры (оставить): {len(tours_to_keep)}")
        print(f"❌ Неазиатские туры (удалить): {len(tours_to_delete)}")
        
        if tours_to_delete:
            print("\n🗑️  Туры, которые будут удалены:")
            for tour in tours_to_delete[:10]:  # Показываем первые 10
                print(f"   - {tour.title} ({tour.location})")
            if len(tours_to_delete) > 10:
                print(f"   ... и ещё {len(tours_to_delete) - 10}")
            
            # Подтверждение
            print("\n⚠️  ВНИМАНИЕ: Это действие необратимо!")
            confirm = input("Продолжить удаление? (да/нет): ")
            
            if confirm.lower() in ['да', 'yes', 'y']:
                # Удаляем связанные бронирования
                tour_ids = [tour.id for tour in tours_to_delete]
                
                # Удаляем бронирования
                await session.execute(
                    delete(Booking).where(Booking.tour_id.in_(tour_ids))
                )
                
                # Удаляем туры
                await session.execute(
                    delete(Tour).where(Tour.id.in_(tour_ids))
                )
                
                await session.commit()
                
                print(f"\n✅ Успешно удалено {len(tours_to_delete)} неазиатских туров")
            else:
                print("\n❌ Операция отменена")
        else:
            print("\n✅ Все туры уже азиатские, ничего удалять не нужно!")


if __name__ == "__main__":
    asyncio.run(purge_non_asia())

