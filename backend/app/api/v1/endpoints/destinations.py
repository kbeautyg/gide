"""
API эндпоинты для направлений и достопримечательностей
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.deps import get_db
from app.models.destination import Destination
from app.models.landmark import Landmark
from app.schemas.destination import (
    Destination as DestinationSchema,
    DestinationCreate,
    Landmark as LandmarkSchema,
    LandmarkCreate,
)

router = APIRouter()


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

