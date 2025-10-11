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
    
    return {
        "destinations": destinations,
        "total": len(destinations)
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
    stmt = select(Tour.location).where(Tour.active == True)
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

