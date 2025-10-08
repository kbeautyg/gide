"""
API эндпоинты для направлений и достопримечательностей
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
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
def get_destinations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Получить список всех направлений"""
    destinations = db.query(Destination).offset(skip).limit(limit).all()
    return destinations


@router.get("/{slug}", response_model=DestinationSchema)
def get_destination(slug: str, db: Session = Depends(get_db)):
    """Получить направление по slug"""
    destination = db.query(Destination).filter(Destination.slug == slug).first()
    if not destination:
        raise HTTPException(status_code=404, detail="Направление не найдено")
    return destination


@router.get("/{destination_id}/landmarks", response_model=List[LandmarkSchema])
def get_landmarks(destination_id: int, db: Session = Depends(get_db)):
    """Получить достопримечательности направления"""
    landmarks = db.query(Landmark).filter(Landmark.destination_id == destination_id).all()
    return landmarks

