"""
API эндпоинты для категорий и коллекций
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.core.deps import get_db, get_current_user, require_admin
from app.models.user import User
from app.services.category_service import CategoryService, CollectionService
from app.schemas.category import (
    Category,
    CategoryCreate,
    CategoryUpdate,
    Collection,
    CollectionCreate,
    CollectionUpdate
)

router = APIRouter()


# ============= ПУБЛИЧНЫЕ ЭНДПОИНТЫ =============

@router.get("/categories", response_model=List[Category])
async def get_categories(
    type: Optional[str] = Query(None, description="Тип категории: landmark, theme, format, collection"),
    is_featured: Optional[bool] = Query(None, description="Только избранные"),
    with_counts: bool = Query(False, description="Включить подсчет туров"),
    db: AsyncSession = Depends(get_db)
):
    """
    Получить список категорий
    
    Типы категорий:
    - landmark: Достопримечательности
    - theme: Тематика (культура, природа, гастрономия и тд)
    - format: Формат (индивидуальные, групповые и тд)
    - collection: Коллекции
    """
    if with_counts:
        categories_data = await CategoryService.get_categories_with_counts(db, category_type=type)
        return categories_data
    else:
        categories = await CategoryService.get_categories(
            db,
            category_type=type,
            is_featured=is_featured
        )
        return categories


@router.get("/categories/{slug}", response_model=Category)
async def get_category(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """Получить категорию по slug"""
    category = await CategoryService.get_category_by_slug(db, slug)
    if not category:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    
    # Подсчитываем туры
    tours_count = await CategoryService._count_tours_for_category(db, category)
    
    # Добавляем в ответ
    category_dict = {
        "id": category.id,
        "name": category.name,
        "slug": category.slug,
        "description": category.description,
        "type": category.type,
        "icon": category.icon,
        "image_url": category.image_url,
        "filters": category.filters,
        "metadata": category.metadata,
        "seo_title": category.seo_title,
        "seo_description": category.seo_description,
        "display_order": category.display_order,
        "is_featured": category.is_featured,
        "is_active": category.is_active,
        "views_count": category.views_count,
        "clicks_count": category.clicks_count,
        "tours_count": tours_count,
        "created_at": category.created_at,
        "updated_at": category.updated_at
    }
    
    return category_dict


@router.get("/collections", response_model=List[Collection])
async def get_collections(
    is_featured: Optional[bool] = Query(None, description="Только избранные"),
    db: AsyncSession = Depends(get_db)
):
    """Получить список коллекций"""
    collections = await CollectionService.get_collections(
        db,
        is_featured=is_featured
    )
    return collections


@router.get("/collections/{slug}", response_model=Collection)
async def get_collection(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """Получить коллекцию по slug"""
    collection = await CollectionService.get_collection_by_slug(db, slug)
    if not collection:
        raise HTTPException(status_code=404, detail="Коллекция не найдена")
    return collection


@router.get("/collections/{slug}/tours")
async def get_collection_tours(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """Получить туры коллекции"""
    collection = await CollectionService.get_collection_by_slug(db, slug)
    if not collection:
        raise HTTPException(status_code=404, detail="Коллекция не найдена")
    
    tours = await CollectionService.get_collection_tours(db, collection)
    
    return {
        "collection": {
            "id": collection.id,
            "title": collection.title,
            "description": collection.description,
            "cover_image": collection.cover_image
        },
        "tours": tours,
        "total": len(tours)
    }


# ============= АДМИНСКИЕ ЭНДПОИНТЫ =============

@router.post("/admin/categories", response_model=Category)
async def create_category(
    category_data: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Создать новую категорию (только админ)"""
    # Проверяем уникальность slug
    existing = await CategoryService.get_category_by_slug(db, category_data.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Категория с таким slug уже существует")
    
    category = await CategoryService.create_category(
        db,
        name=category_data.name,
        slug=category_data.slug,
        category_type=category_data.type,
        description=category_data.description,
        icon=category_data.icon,
        image_url=category_data.image_url,
        filters=category_data.filters,
        metadata=category_data.metadata,
        seo_title=category_data.seo_title,
        seo_description=category_data.seo_description,
        display_order=category_data.display_order,
        is_featured=category_data.is_featured,
        is_active=category_data.is_active
    )
    
    return category


@router.put("/admin/categories/{category_id}", response_model=Category)
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Обновить категорию (только админ)"""
    # Проверяем slug на уникальность если он меняется
    if category_data.slug:
        existing = await CategoryService.get_category_by_slug(db, category_data.slug)
        if existing and existing.id != category_id:
            raise HTTPException(status_code=400, detail="Категория с таким slug уже существует")
    
    update_data = {k: v for k, v in category_data.dict().items() if v is not None}
    category = await CategoryService.update_category(db, category_id, **update_data)
    
    if not category:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    
    return category


@router.delete("/admin/categories/{category_id}")
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Удалить категорию (только админ)"""
    success = await CategoryService.delete_category(db, category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    
    return {"success": True, "message": "Категория удалена"}


@router.post("/admin/collections", response_model=Collection)
async def create_collection(
    collection_data: CollectionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Создать новую коллекцию (только админ)"""
    # Проверяем уникальность slug
    existing = await CollectionService.get_collection_by_slug(db, collection_data.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Коллекция с таким slug уже существует")
    
    collection = await CollectionService.create_collection(
        db,
        title=collection_data.title,
        slug=collection_data.slug,
        description=collection_data.description,
        cover_image=collection_data.cover_image,
        tour_ids=collection_data.tour_ids,
        is_automatic=collection_data.is_automatic,
        auto_filters=collection_data.auto_filters,
        auto_limit=collection_data.auto_limit,
        display_order=collection_data.display_order,
        is_featured=collection_data.is_featured,
        is_active=collection_data.is_active,
        seo_title=collection_data.seo_title,
        seo_description=collection_data.seo_description
    )
    
    return collection


@router.put("/admin/collections/{collection_id}", response_model=Collection)
async def update_collection(
    collection_id: int,
    collection_data: CollectionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Обновить коллекцию (только админ)"""
    if collection_data.slug:
        existing = await CollectionService.get_collection_by_slug(db, collection_data.slug)
        if existing and existing.id != collection_id:
            raise HTTPException(status_code=400, detail="Коллекция с таким slug уже существует")
    
    update_data = {k: v for k, v in collection_data.dict().items() if v is not None}
    collection = await CollectionService.update_collection(db, collection_id, **update_data)
    
    if not collection:
        raise HTTPException(status_code=404, detail="Коллекция не найдена")
    
    return collection


@router.delete("/admin/collections/{collection_id}")
async def delete_collection(
    collection_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Удалить коллекцию (только админ)"""
    success = await CollectionService.delete_collection(db, collection_id)
    if not success:
        raise HTTPException(status_code=404, detail="Коллекция не найдена")
    
    return {"success": True, "message": "Коллекция удалена"}


