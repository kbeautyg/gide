"""
API эндпоинты для направлений и достопримечательностей
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from collections import Counter

from app.core.deps import get_db
from app.models.destination import Destination
from app.models.landmark import Landmark
from app.models.tour import Tour
from app.schemas.destination import (
    Destination as DestinationSchema,
    DestinationCreate,
    Landmark as LandmarkSchema,
    LandmarkCreate,
)

router = APIRouter()


@router.get("/with-counts")
async def get_destinations_with_counts(db: AsyncSession = Depends(get_db)):
    """
    Получить список направлений с реальным подсчетом количества туров
    Группировка по городам из поля Tour.location
    """
    # Получить все активные туры с группировкой по location
    stmt = select(
        Tour.location,
        func.count(Tour.id).label('tours_count')
    ).where(
        Tour.active == True
    ).group_by(Tour.location)
    
    result = await db.execute(stmt)
    location_counts = result.all()
    
    # Преобразуем в список словарей
    destinations = []
    for location, count in location_counts:
        # Парсинг "Город, Страна"
        parts = location.split(', ')
        if len(parts) == 2:
            city, country = parts
            destinations.append({
                "city": city.strip(),
                "country": country.strip(),
                "location": location,
                "tours_count": count
            })
    
    # Сортируем по количеству туров (больше -> меньше)
    destinations.sort(key=lambda x: x['tours_count'], reverse=True)
    
    # Подсчитываем уникальные страны
    unique_countries = set(dest['country'] for dest in destinations)
    
    return {
        "destinations": destinations,
        "total": len(destinations),
        "countries_count": len(unique_countries)
    }


@router.get("/landmarks-with-counts")
async def get_landmarks_with_counts(
    location: Optional[str] = Query(None, description="Город для фильтрации"),
    db: AsyncSession = Depends(get_db)
):
    """
    Получить список достопримечательностей с реальным подсчетом туров
    Извлекает landmarks из JSON поля Tour.landmarks и считает количество туров
    """
    # Получаем все активные туры для указанного города
    query = select(Tour.landmarks).where(Tour.active == True)
    
    if location:
        # Фильтруем по городу (поиск в строке location)
        query = query.where(Tour.location.ilike(f'%{location}%'))
    
    result = await db.execute(query)
    all_landmarks_lists = result.scalars().all()
    
    # Собираем все landmarks и считаем их количество
    landmarks_counter = Counter()
    for landmarks_list in all_landmarks_lists:
        if landmarks_list:  # Если список не пустой
            for landmark in landmarks_list:
                landmarks_counter[landmark] += 1
    
    # Формируем результат
    landmarks_data = [
        {
            "name": landmark,
            "tours_count": count
        }
        for landmark, count in landmarks_counter.most_common()  # Сортируем по популярности
    ]
    
    return {
        "landmarks": landmarks_data,
        "total": len(landmarks_data),
        "location": location
    }


@router.get("/countries-with-counts")
async def get_countries_with_counts(db: AsyncSession = Depends(get_db)):
    """
    Получить список стран с реальным подсчетом количества туров
    Парсит страну из поля Tour.location ("Город, Страна")
    """
    # Получить все активные туры
    stmt = select(Tour.location).where(
        Tour.active == True
    )
    result = await db.execute(stmt)
    locations = result.scalars().all()
    
    # Парсим страны и считаем туры
    countries_counter = Counter()
    for location in locations:
        parts = location.split(', ')
        if len(parts) == 2:
            country = parts[1].strip()
            countries_counter[country] += 1
    
    # Формируем результат
    countries_data = [
        {
            "country": country,
            "tours_count": count
        }
        for country, count in countries_counter.most_common()
    ]
    
    return {
        "countries": countries_data,
        "total": len(countries_data)
    }


@router.get("/countries-stats")
async def get_countries_stats(db: AsyncSession = Depends(get_db)):
    """
    Статистика по странам для карточек с изображениями и описаниями
    Динамически берёт ВСЕ страны из БД, не из хардкода
    """
    # Получить все активные туры
    stmt = select(Tour.location).where(
        Tour.active == True
    )
    result = await db.execute(stmt)
    locations = result.scalars().all()
    
    # Парсим страны и считаем туры
    countries_counter = Counter()
    for location in locations:
        parts = location.split(', ')
        if len(parts) == 2:
            country = parts[1].strip()
            countries_counter[country] += 1
    
    # Данные для известных стран (fallback для изображений и описаний)
    # Используем локальные изображения из static/countries
    
    # ВОЗВРАЩАЕМ ОТНОСИТЕЛЬНЫЕ ПУТИ!
    # Фронтенд сам подставит нужный домен через getImageUrl()
    
    COUNTRY_META = {
        'Таиланд': {
            'flag': '🇹🇭',
            'image': '/static/countries/thailand.jpg',
            'description': 'Золотые храмы, белоснежные пляжи, уличная еда и тропические острова',
            'highlights': ['Бангкок', 'Пхукет', 'Паттайя'],
        },
        'ОАЭ': {
            'flag': '🇦🇪',
            'image': '/static/countries/uae.jpg',
            'description': 'Футуристические небоскребы, бескрайние пустыни и восточная роскошь',
            'highlights': ['Дубай', 'Абу-Даби', 'Шарджа'],
        },
        'Турция': {
            'flag': '🇹🇷',
            'image': '/static/countries/turkey.jpg',
            'description': 'Каппадокия, Стамбул, море и античные руины',
            'highlights': ['Стамбул', 'Каппадокия', 'Анталья'],
        },
        'Япония': {
            'flag': '🇯🇵',
            'image': '/static/countries/japan.jpg',
            'description': 'Древние храмы, современные технологии, суши и цветущая сакура',
            'highlights': ['Токио', 'Киото', 'Осака'],
        },
        'Южная Корея': {
            'flag': '🇰🇷',
            'image': '/static/countries/south_korea.jpg',
            'description': 'K-pop культура, дворцы, уличная еда и неоновые улицы Сеула',
            'highlights': ['Сеул', 'Пусан', 'Чеджу'],
        },
        'Индонезия': {
            'flag': '🇮🇩',
            'image': '/static/countries/indonesia.jpg',
            'description': 'Рисовые террасы Бали, вулканы, серфинг и древние храмы',
            'highlights': ['Бали', 'Ява', 'Ломбок'],
        },
        'Вьетнам': {
            'flag': '🇻🇳',
            'image': '/static/countries/vietnam.jpg',
            'description': 'Бухта Халонг, традиционная кухня, древние города и рисовые поля',
            'highlights': ['Ханой', 'Хошимин', 'Дананг'],
        },
        'Сингапур': {
            'flag': '🇸🇬',
            'image': '/static/countries/singapore.jpg',
            'description': 'Город-сад с небоскребами, мультикультурность и уличная еда',
            'highlights': ['Марина Бэй', 'Сентоза', 'Чайнатаун'],
        },
        'Китай': {
            'flag': '🇨🇳',
            'image': '/static/countries/china.jpg',
            'description': 'Великая стена, Терракотовая армия, мегаполисы и древняя культура',
            'highlights': ['Пекин', 'Шанхай', 'Гонконг'],
        },
        'Индия': {
            'flag': '🇮🇳',
            'image': '/static/countries/india.jpg',
            'description': 'Тадж-Махал, йога, специи, духовные практики и красочные фестивали',
            'highlights': ['Дели', 'Мумбаи', 'Гоа'],
        },
        'Малайзия': {
            'flag': '🇲🇾',
            'image': '/static/countries/malaysia.jpg',
            'description': 'Башни Петронас, джунгли, острова и уличная еда',
            'highlights': ['Куала-Лумпур', 'Пенанг', 'Лангкави'],
        },
        'Шри-Ланка': {
            'flag': '🇱🇰',
            'image': '/static/countries/srilanka.jpg',
            'description': 'Чайные плантации, древние храмы, слоны и тропические пляжи',
            'highlights': ['Коломбо', 'Канди', 'Галле'],
        },
        'Камбоджа': {
            'flag': '🇰🇭',
            'image': '/static/countries/cambodia.jpg',
            'description': 'Ангкор-Ват, древние храмы кхмеров и тропическая природа',
            'highlights': ['Сием Рип', 'Пномпень', 'Сиануквиль'],
        },
        'Мьянма': {
            'flag': '🇲🇲',
            'image': '/static/countries/myanmar.jpg',
            'description': 'Золотые пагоды, древние храмы Багана и нетронутая природа',
            'highlights': ['Янгон', 'Баган', 'Мандалай'],
        },
        'Филиппины': {
            'flag': '🇵🇭',
            'image': '/static/countries/philippines.jpg',
            'description': 'Райские острова, белоснежные пляжи и подводный мир',
            'highlights': ['Манила', 'Боракай', 'Палаван'],
        },
        'Непал': {
            'flag': '🇳🇵',
            'image': '/static/countries/nepal.jpg',
            'description': 'Гималаи, Эверест, буддийские монастыри и треккинг',
            'highlights': ['Катманду', 'Покхара', 'Эверест'],
        },
    }
    
    # Fallback изображение для неизвестных стран
    DEFAULT_META = {
        'flag': '🌏',
        'image': '/static/countries/default_country.jpg',
        'description': 'Откройте для себя уникальные экскурсии и достопримечательности',
        'highlights': [],
    }
    
    # Формируем результат с метаданными
    countries_data = []
    for country, count in countries_counter.most_common():
        meta = COUNTRY_META.get(country, DEFAULT_META)
        countries_data.append({
            "country": country,
            "tours_count": count,
            "flag": meta['flag'],
            "image": meta['image'],
            "description": meta['description'],
            "highlights": meta['highlights'],
        })
    
    return {
        "countries": countries_data,
        "total": len(countries_data)
    }


@router.get("/cities-by-country")
async def get_cities_by_country(
    country: str = Query(..., description="Название страны"),
    db: AsyncSession = Depends(get_db)
):
    """
    Получить города конкретной страны с подсчетом туров
    """
    # Получить все активные туры этой страны
    stmt = select(
        Tour.location,
        func.count(Tour.id).label('tours_count')
    ).where(
        Tour.active == True,
        Tour.location.ilike(f"%{country}%")
    ).group_by(Tour.location)
    
    result = await db.execute(stmt)
    location_counts = result.all()
    
    # Парсим города
    cities = []
    total_tours = 0
    for location, count in location_counts:
        parts = location.split(', ')
        if len(parts) == 2:
            city, loc_country = parts
            # Проверяем, что это именно наша страна
            if loc_country.strip().lower() == country.strip().lower():
                cities.append({
                    "city": city.strip(),
                    "country": country,
                    "tours_count": count
                })
                total_tours += count
    
    # Сортируем по количеству туров
    cities.sort(key=lambda x: x['tours_count'], reverse=True)
    
    return {
        "cities": cities,
        "total": len(cities),
        "total_tours": total_tours,
        "country": country
    }


@router.get("/", response_model=List[DestinationSchema])
async def get_destinations(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """Получить список всех направлений"""
    stmt = select(Destination).offset(skip).limit(limit)
    result = await db.execute(stmt)
    destinations = result.scalars().all()
    return destinations


@router.get("/{slug}", response_model=DestinationSchema)
async def get_destination(slug: str, db: AsyncSession = Depends(get_db)):
    """Получить направление по slug"""
    stmt = select(Destination).where(Destination.slug == slug)
    result = await db.execute(stmt)
    destination = result.scalar_one_or_none()
    if not destination:
        raise HTTPException(status_code=404, detail="Направление не найдено")
    return destination


@router.get("/{destination_id}/landmarks", response_model=List[LandmarkSchema])
async def get_landmarks(destination_id: int, db: AsyncSession = Depends(get_db)):
    """Получить достопримечательности направления"""
    stmt = select(Landmark).where(Landmark.destination_id == destination_id)
    result = await db.execute(stmt)
    landmarks = result.scalars().all()
    return landmarks

