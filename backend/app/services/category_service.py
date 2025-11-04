"""
Сервис для работы с категориями и коллекциями
"""
from typing import List, Optional, Dict, Any
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category, Collection
from app.models.tour import Tour


class CategoryService:
    """Сервис для управления категориями"""
    
    @staticmethod
    async def get_categories(
        db: AsyncSession,
        category_type: Optional[str] = None,
        is_featured: Optional[bool] = None,
        is_active: bool = True,
        skip: int = 0,
        limit: int = 100,
        include_children: bool = False,
        parent_id: Optional[int] = None
    ) -> List[Category]:
        """Получение списка категорий"""
        query = select(Category).where(Category.is_active == is_active)
        
        if category_type:
            query = query.where(Category.type == category_type)
        
        if is_featured is not None:
            query = query.where(Category.is_featured == is_featured)
        
        # Фильтр по parent_id - если None, возвращаем только родительские категории
        if parent_id is not None:
            query = query.where(Category.parent_id == parent_id)
        elif include_children is False:
            # По умолчанию возвращаем только родительские категории (без подкатегорий)
            query = query.where(Category.parent_id.is_(None))
        
        query = query.order_by(Category.display_order, Category.name)
        query = query.offset(skip).limit(limit)
        
        result = await db.execute(query)
        categories = result.scalars().all()
        
        # Если запрошены подкатегории, загружаем их
        if include_children:
            for category in categories:
                children_query = select(Category).where(
                    Category.parent_id == category.id,
                    Category.is_active == True
                ).order_by(Category.display_order, Category.name)
                children_result = await db.execute(children_query)
                # Используем setattr для установки children
                setattr(category, 'children', children_result.scalars().all())
        
        return categories
    
    @staticmethod
    async def get_category_by_id(db: AsyncSession, category_id: int) -> Optional[Category]:
        """Получение категории по ID"""
        result = await db.execute(
            select(Category).where(Category.id == category_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_category_by_slug(db: AsyncSession, slug: str) -> Optional[Category]:
        """Получение категории по slug"""
        result = await db.execute(
            select(Category).where(Category.slug == slug)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create_category(
        db: AsyncSession,
        name: str,
        slug: str,
        category_type: str,
        **kwargs
    ) -> Category:
        """Создание новой категории"""
        category = Category(
            name=name,
            slug=slug,
            type=category_type,
            **kwargs
        )
        db.add(category)
        await db.commit()
        await db.refresh(category)
        return category
    
    @staticmethod
    async def update_category(
        db: AsyncSession,
        category_id: int,
        **kwargs
    ) -> Optional[Category]:
        """Обновление категории"""
        category = await CategoryService.get_category_by_id(db, category_id)
        if not category:
            return None
        
        for key, value in kwargs.items():
            if hasattr(category, key) and value is not None:
                setattr(category, key, value)
        
        await db.commit()
        await db.refresh(category)
        return category
    
    @staticmethod
    async def delete_category(db: AsyncSession, category_id: int) -> bool:
        """Удаление категории"""
        category = await CategoryService.get_category_by_id(db, category_id)
        if not category:
            return False
        
        await db.delete(category)
        await db.commit()
        return True
    
    @staticmethod
    async def get_categories_with_counts(
        db: AsyncSession,
        category_type: Optional[str] = None,
        include_children: bool = False
    ) -> List[Dict[str, Any]]:
        """Получение категорий с подсчетом количества туров"""
        categories = await CategoryService.get_categories(
            db, 
            category_type=category_type,
            is_active=True,
            include_children=include_children
        )
        
        result = []
        for category in categories:
            # Подсчет туров для категории на основе фильтров
            tours_count = await CategoryService._count_tours_for_category(db, category)
            
            category_dict = {
                "id": category.id,
                "name": category.name,
                "slug": category.slug,
                "type": category.type,
                "parent_id": category.parent_id,
                "icon": category.icon,
                "image_url": category.image_url,
                "description": category.description,
                "is_featured": category.is_featured,
                "tours_count": tours_count,
                "display_order": category.display_order
            }
            
            # Добавляем подкатегории если они загружены
            if include_children and hasattr(category, 'children'):
                children_data = []
                for child in category.children:
                    child_tours_count = await CategoryService._count_tours_for_category(db, child)
                    children_data.append({
                        "id": child.id,
                        "name": child.name,
                        "slug": child.slug,
                        "type": child.type,
                        "parent_id": child.parent_id,
                        "icon": child.icon,
                        "image_url": child.image_url,
                        "description": child.description,
                        "is_featured": child.is_featured,
                        "tours_count": child_tours_count,
                        "display_order": child.display_order
                    })
                category_dict["children"] = children_data
            
            result.append(category_dict)
        
        return result
    
    @staticmethod
    async def _count_tours_for_category(db: AsyncSession, category: Category) -> int:
        """Подсчет туров для категории на основе фильтров"""
        query = select(func.count(Tour.id)).where(
            Tour.active == True,
            Tour.is_public == True
        )
        
        # Применяем фильтры из категории
        filters = category.filters or {}
        
        if 'location' in filters:
            query = query.where(Tour.location.ilike(f"%{filters['location']}%"))
        
        if 'category' in filters:
            query = query.where(Tour.category == filters['category'])
        
        if 'min_rating' in filters:
            query = query.where(Tour.rating >= filters['min_rating'])
        
        if 'landmarks' in filters:
            # Поиск в JSON массиве landmarks
            for landmark in filters['landmarks']:
                query = query.where(Tour.landmarks.contains([landmark]))
        
        if 'tags' in filters:
            for tag in filters['tags']:
                query = query.where(Tour.tags.contains([tag]))
        
        result = await db.execute(query)
        return result.scalar() or 0


class CollectionService:
    """Сервис для управления коллекциями"""
    
    @staticmethod
    async def get_collections(
        db: AsyncSession,
        is_featured: Optional[bool] = None,
        is_active: bool = True,
        skip: int = 0,
        limit: int = 100
    ) -> List[Collection]:
        """Получение списка коллекций"""
        query = select(Collection).where(Collection.is_active == is_active)
        
        if is_featured is not None:
            query = query.where(Collection.is_featured == is_featured)
        
        query = query.order_by(Collection.display_order, Collection.title)
        query = query.offset(skip).limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def get_collection_by_id(db: AsyncSession, collection_id: int) -> Optional[Collection]:
        """Получение коллекции по ID"""
        result = await db.execute(
            select(Collection).where(Collection.id == collection_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_collection_by_slug(db: AsyncSession, slug: str) -> Optional[Collection]:
        """Получение коллекции по slug"""
        result = await db.execute(
            select(Collection).where(Collection.slug == slug)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_collection_tours(
        db: AsyncSession,
        collection: Collection
    ) -> List[Tour]:
        """Получение туров для коллекции"""
        if collection.is_automatic:
            # Автоматическая коллекция - применяем фильтры
            return await CollectionService._get_auto_collection_tours(db, collection)
        else:
            # Ручная коллекция - возвращаем туры по ID
            if not collection.tour_ids:
                return []
            
            result = await db.execute(
                select(Tour).where(
                    Tour.id.in_(collection.tour_ids),
                    Tour.active == True,
                    Tour.is_public == True
                )
            )
            return result.scalars().all()
    
    @staticmethod
    async def _get_auto_collection_tours(
        db: AsyncSession,
        collection: Collection
    ) -> List[Tour]:
        """Получение туров для автоматической коллекции"""
        query = select(Tour).where(
            Tour.active == True,
            Tour.is_public == True
        )
        
        filters = collection.auto_filters or {}
        
        if 'location' in filters:
            query = query.where(Tour.location.ilike(f"%{filters['location']}%"))
        
        if 'category' in filters:
            query = query.where(Tour.category == filters['category'])
        
        if 'min_rating' in filters:
            query = query.where(Tour.rating >= filters['min_rating'])
        
        if 'max_price' in filters:
            query = query.where(Tour.price <= filters['max_price'])
        
        if 'min_price' in filters:
            query = query.where(Tour.price >= filters['min_price'])
        
        # Сортировка
        sort_by = filters.get('sort_by', 'rating')
        if sort_by == 'rating':
            query = query.order_by(Tour.rating.desc())
        elif sort_by == 'price_asc':
            query = query.order_by(Tour.price.asc())
        elif sort_by == 'price_desc':
            query = query.order_by(Tour.price.desc())
        elif sort_by == 'popularity':
            query = query.order_by(Tour.total_bookings.desc())
        
        # Лимит
        limit = collection.auto_limit or 20
        query = query.limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def create_collection(
        db: AsyncSession,
        title: str,
        slug: str,
        **kwargs
    ) -> Collection:
        """Создание новой коллекции"""
        collection = Collection(
            title=title,
            slug=slug,
            **kwargs
        )
        db.add(collection)
        await db.commit()
        await db.refresh(collection)
        return collection
    
    @staticmethod
    async def update_collection(
        db: AsyncSession,
        collection_id: int,
        **kwargs
    ) -> Optional[Collection]:
        """Обновление коллекции"""
        collection = await CollectionService.get_collection_by_id(db, collection_id)
        if not collection:
            return None
        
        for key, value in kwargs.items():
            if hasattr(collection, key) and value is not None:
                setattr(collection, key, value)
        
        await db.commit()
        await db.refresh(collection)
        return collection
    
    @staticmethod
    async def delete_collection(db: AsyncSession, collection_id: int) -> bool:
        """Удаление коллекции"""
        collection = await CollectionService.get_collection_by_id(db, collection_id)
        if not collection:
            return False
        
        await db.delete(collection)
        await db.commit()
        return True


