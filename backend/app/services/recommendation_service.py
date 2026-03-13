"""
Сервис умных рекомендаций на основе ML-подобных алгоритмов
"""
from typing import List, Optional, Dict, Set
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from collections import Counter
import math

from app.models.tour import Tour
from app.models.booking import Booking
from app.models.review import Review


class RecommendationService:
    """Сервис для создания умных рекомендаций"""
    
    @staticmethod
    async def get_smart_recommendations(
        db: AsyncSession,
        tour_id: Optional[int] = None,
        user_id: Optional[int] = None,
        location: Optional[str] = None,
        limit: int = 6
    ) -> List[Tour]:
        """
        Умные рекомендации на основе:
        - Похожести контента (категория, локация, landmarks)
        - Поведения пользователя (просмотры, бронирования)
        - Популярности (рейтинг, количество бронирований)
        - Совместной фильтрации (пользователи, которые заказывали этот тур, также заказывали...)
        """
        
        if tour_id:
            return await RecommendationService._get_similar_tours(db, tour_id, limit)
        elif user_id:
            return await RecommendationService._get_personalized_tours(db, user_id, limit)
        elif location:
            return await RecommendationService._get_trending_in_location(db, location, limit)
        else:
            return await RecommendationService._get_trending_tours(db, limit)
    
    @staticmethod
    async def _get_similar_tours(
        db: AsyncSession,
        tour_id: int,
        limit: int = 6
    ) -> List[Tour]:
        """Похожие туры на основе контентной схожести"""
        
        # Получаем исходный тур
        result = await db.execute(select(Tour).where(Tour.id == tour_id))
        current_tour = result.scalar_one_or_none()
        
        if not current_tour:
            return []
        
        # Получаем все активные туры
        result = await db.execute(
            select(Tour).where(
                Tour.active == True,
                Tour.is_public == True,
                Tour.id != tour_id
            )
        )
        all_tours = result.scalars().all()
        
        # Рассчитываем схожесть для каждого тура
        scored_tours = []
        for tour in all_tours:
            similarity_score = await RecommendationService._calculate_similarity(
                current_tour, tour
            )
            scored_tours.append((tour, similarity_score))
        
        # Сортируем по схожести
        scored_tours.sort(key=lambda x: x[1], reverse=True)
        
        # Возвращаем топ N
        return [tour for tour, score in scored_tours[:limit]]
    
    @staticmethod
    async def _calculate_similarity(tour1: Tour, tour2: Tour) -> float:
        """
        Рассчитываем схожесть между двумя турами
        Используем взвешенную сумму различных факторов
        """
        score = 0.0
        
        # 1. Категория (вес 25%)
        if tour1.category == tour2.category:
            score += 0.25
        
        # 2. Локация (вес 20%)
        if tour1.location == tour2.location:
            score += 0.20
        elif tour1.location.split(',')[0].strip() == tour2.location.split(',')[0].strip():
            # Тот же город
            score += 0.10
        
        # 3. Landmarks (вес 20%)
        landmarks1 = set(tour1.landmarks or [])
        landmarks2 = set(tour2.landmarks or [])
        if landmarks1 and landmarks2:
            jaccard_landmarks = len(landmarks1 & landmarks2) / len(landmarks1 | landmarks2)
            score += 0.20 * jaccard_landmarks
        
        # 4. Tags (вес 15%)
        tags1 = set(tour1.tags or [])
        tags2 = set(tour2.tags or [])
        if tags1 and tags2:
            jaccard_tags = len(tags1 & tags2) / len(tags1 | tags2)
            score += 0.15 * jaccard_tags
        
        # 5. Themes (вес 10%)
        themes1 = set(tour1.themes or [])
        themes2 = set(tour2.themes or [])
        if themes1 and themes2:
            jaccard_themes = len(themes1 & themes2) / len(themes1 | themes2)
            score += 0.10 * jaccard_themes
        
        # 6. Ценовой диапазон (вес 10%)
        price_diff = abs(tour1.price - tour2.price) / max(tour1.price, tour2.price)
        score += 0.10 * (1 - price_diff)
        
        # Бонус за высокий рейтинг
        if tour2.rating >= 4.8:
            score *= 1.2
        elif tour2.rating >= 4.5:
            score *= 1.1
        
        return score
    
    @staticmethod
    async def _get_personalized_tours(
        db: AsyncSession,
        user_id: int,
        limit: int = 6
    ) -> List[Tour]:
        """Персонализированные рекомендации на основе истории пользователя"""
        
        # Получаем туры, которые пользователь уже заказывал
        booked_result = await db.execute(
            select(Booking.tour_id).where(
                Booking.user_id == user_id,
                Booking.payment_status == 'paid'
            )
        )
        booked_tour_ids = [row[0] for row in booked_result.all()]
        
        if not booked_tour_ids:
            # Если нет истории, возвращаем популярные
            return await RecommendationService._get_trending_tours(db, limit)
        
        # Получаем информацию о забронированных турах
        booked_tours_result = await db.execute(
            select(Tour).where(Tour.id.in_(booked_tour_ids))
        )
        booked_tours = booked_tours_result.scalars().all()
        
        # Собираем предпочтения пользователя
        preferred_categories = Counter()
        preferred_locations = Counter()
        preferred_landmarks = Counter()
        preferred_tags = Counter()
        
        for tour in booked_tours:
            preferred_categories[tour.category] += 1
            preferred_locations[tour.location] += 1
            for landmark in (tour.landmarks or []):
                preferred_landmarks[landmark] += 1
            for tag in (tour.tags or []):
                preferred_tags[tag] += 1
        
        # Ищем туры, соответствующие предпочтениям
        result = await db.execute(
            select(Tour).where(
                Tour.active == True,
                Tour.is_public == True,
                Tour.id.notin_(booked_tour_ids)
            )
        )
        all_tours = result.scalars().all()
        
        # Рассчитываем релевантность для каждого тура
        scored_tours = []
        for tour in all_tours:
            relevance_score = 0.0
            
            # Категория
            relevance_score += preferred_categories.get(tour.category, 0) * 0.3
            
            # Локация
            relevance_score += preferred_locations.get(tour.location, 0) * 0.25
            
            # Landmarks
            for landmark in (tour.landmarks or []):
                relevance_score += preferred_landmarks.get(landmark, 0) * 0.15
            
            # Tags
            for tag in (tour.tags or []):
                relevance_score += preferred_tags.get(tag, 0) * 0.15
            
            # Рейтинг тура
            relevance_score += tour.rating * 0.15
            
            scored_tours.append((tour, relevance_score))
        
        # Сортируем по релевантности
        scored_tours.sort(key=lambda x: x[1], reverse=True)
        
        return [tour for tour, score in scored_tours[:limit]]
    
    @staticmethod
    async def _get_trending_in_location(
        db: AsyncSession,
        location: str,
        limit: int = 6
    ) -> List[Tour]:
        """Популярные туры в локации"""
        result = await db.execute(
            select(Tour).where(
                Tour.active == True,
                Tour.is_public == True,
                Tour.location.ilike(f"%{location}%")
            ).order_by(
                Tour.rating.desc(),
                Tour.total_bookings.desc(),
                Tour.reviews_count.desc()
            ).limit(limit)
        )
        return result.scalars().all()
    
    @staticmethod
    async def _get_trending_tours(
        db: AsyncSession,
        limit: int = 6
    ) -> List[Tour]:
        """Популярные туры (глобально)"""
        result = await db.execute(
            select(Tour).where(
                Tour.active == True,
                Tour.is_public == True,
                Tour.rating >= 4.5
            ).order_by(
                Tour.total_bookings.desc(),
                Tour.rating.desc(),
                Tour.reviews_count.desc()
            ).limit(limit)
        )
        return result.scalars().all()
    
    @staticmethod
    async def get_collaborative_recommendations(
        db: AsyncSession,
        tour_id: int,
        limit: int = 6
    ) -> List[Tour]:
        """
        Рекомендации на основе совместной фильтрации
        "Пользователи, которые заказывали этот тур, также заказывали..."
        """
        
        # Находим пользователей, заказавших этот тур
        users_result = await db.execute(
            select(Booking.user_id).where(
                Booking.tour_id == tour_id,
                Booking.payment_status == 'paid'
            ).distinct()
        )
        user_ids = [row[0] for row in users_result.all()]
        
        if not user_ids:
            return []
        
        # Находим другие туры, которые заказывали эти пользователи
        other_tours_result = await db.execute(
            select(
                Booking.tour_id,
                func.count(Booking.id).label('co_bookings')
            ).where(
                Booking.user_id.in_(user_ids),
                Booking.tour_id != tour_id,
                Booking.payment_status == 'paid'
            ).group_by(Booking.tour_id)
            .order_by(func.count(Booking.id).desc())
            .limit(limit)
        )
        
        tour_ids_with_counts = other_tours_result.all()
        tour_ids = [row[0] for row in tour_ids_with_counts]
        
        if not tour_ids:
            return []
        
        # Получаем информацию о турах
        tours_result = await db.execute(
            select(Tour).where(
                Tour.id.in_(tour_ids),
                Tour.active == True,
                Tour.is_public == True
            )
        )
        tours = tours_result.scalars().all()
        
        # Сортируем по количеству совместных бронирований
        tours_dict = {tour.id: tour for tour in tours}
        sorted_tours = []
        for tour_id, count in tour_ids_with_counts:
            if tour_id in tours_dict:
                sorted_tours.append(tours_dict[tour_id])
        
        return sorted_tours
    
    @staticmethod
    async def get_dynamic_categories_from_tours(
        db: AsyncSession,
        location: Optional[str] = None,
        themes: Optional[str] = None,
        landmarks: Optional[str] = None,
        tags: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        duration_min: Optional[int] = None,
        duration_max: Optional[int] = None,
        min_rating: Optional[float] = None,
        guests: Optional[int] = None,
        date_start: Optional[str] = None,
        date_end: Optional[str] = None,
        format: Optional[str] = None,
        transportation: Optional[str] = None,
        strict_filter: bool = False,
    ) -> Dict[str, List[Dict]]:
        """
        Автоматически создает динамические категории из реальных данных туров
        Анализирует landmarks, tags, themes для создания навигации
        Поддерживает фильтры для динамического подсчета
        """
        from sqlalchemy import and_, or_, cast
        from sqlalchemy.dialects.postgresql import JSONB
        
        # Базовый запрос с фильтрами
        query = select(Tour).where(
            Tour.active == True,
            Tour.is_public == True
        )
        
        # Применяем фильтры
        if location:
            query = query.where(Tour.location.ilike(f"%{location}%"))
        
        if themes:
            themes_list = [t.strip() for t in themes.split(',')]
            for theme in themes_list:
                query = query.where(
                    and_(
                        Tour.themes.isnot(None),
                        cast(Tour.themes, JSONB).contains([theme])
                    )
                )
        
        if landmarks:
            landmarks_list = [l.strip() for l in landmarks.split(',')]
            for landmark in landmarks_list:
                query = query.where(
                    and_(
                        Tour.landmarks.isnot(None),
                        cast(Tour.landmarks, JSONB).contains([landmark])
                    )
                )
        
        if tags:
            tags_list = [t.strip() for t in tags.split(',')]
            for tag in tags_list:
                query = query.where(
                    and_(
                        Tour.tags.isnot(None),
                        cast(Tour.tags, JSONB).contains([tag])
                    )
                )
        
        if min_price is not None:
            query = query.where(Tour.price >= min_price)
        
        if max_price is not None:
            query = query.where(Tour.price <= max_price)
        
        if duration_min is not None:
            query = query.where(Tour.duration_hours >= duration_min)
        
        if duration_max is not None:
            query = query.where(Tour.duration_hours <= duration_max)
        
        if min_rating is not None:
            query = query.where(Tour.rating >= min_rating)
        
        if guests is not None:
            query = query.where(Tour.max_group_size >= guests)
        
        if date_start:
            from datetime import datetime
            try:
                date_start_obj = datetime.strptime(date_start, '%Y-%m-%d').date()
                query = query.where(
                    or_(
                        and_(Tour.start_date.is_(None), Tour.end_date.is_(None)),
                        and_(Tour.start_date.isnot(None), Tour.start_date <= date_start_obj),
                        and_(Tour.end_date.isnot(None), Tour.end_date >= date_start_obj)
                    )
                )
            except ValueError:
                pass
        
        if date_end:
            from datetime import datetime
            try:
                date_end_obj = datetime.strptime(date_end, '%Y-%m-%d').date()
                query = query.where(
                    or_(
                        and_(Tour.start_date.is_(None), Tour.end_date.is_(None)),
                        and_(Tour.start_date.isnot(None), Tour.start_date <= date_end_obj),
                        and_(Tour.end_date.isnot(None), Tour.end_date >= date_end_obj)
                    )
                )
            except ValueError:
                pass
        
        if format:
            format_list = [f.strip() for f in format.split(',')]
            format_conditions = [
                and_(
                    Tour.formats.isnot(None),
                    cast(Tour.formats, JSONB).contains([fmt])
                )
                for fmt in format_list
            ]
            if format_conditions:
                query = query.where(or_(*format_conditions))
        
        if transportation:
            transportation_list = [t.strip() for t in transportation.split(',')]
            transportation_conditions = [
                and_(
                    Tour.tags.isnot(None),
                    cast(Tour.tags, JSONB).contains([trans])
                )
                for trans in transportation_list
            ]
            if transportation_conditions:
                query = query.where(or_(*transportation_conditions))
        
        # Выполняем ОДИН запрос для получения всех подходящих туров
        result = await db.execute(query)
        tours = result.scalars().all()
        
        # Считаем статистику в памяти (это намного быстрее чем 100+ SQL запросов)
        themes_counter = Counter()
        landmarks_counter = Counter()
        tags_counter = Counter()
        categories_counter = Counter()
        locations_counter = Counter()
        
        for tour in tours:
            categories_counter[tour.category] += 1
            locations_counter[tour.location] += 1
            
            if tour.themes:
                for theme in tour.themes:
                    themes_counter[theme] += 1
            
            if tour.landmarks:
                for landmark in tour.landmarks:
                    landmarks_counter[landmark] += 1
                    
            if tour.tags:
                for tag in tour.tags:
                    tags_counter[tag] += 1
        
        # Формируем списки
        themes_list = [
            {"name": name, "count": count, "type": "theme"}
            for name, count in themes_counter.most_common(12)
        ]
        
        landmarks_list = [
            {"name": name, "count": count, "type": "landmark"}
            for name, count in landmarks_counter.most_common(20)
        ]
        
        # Формируем результат
        return {
            "landmarks": landmarks_list,
            "tags": [
                {"name": name, "count": count, "type": "tag"}
                for name, count in tags_counter.most_common(15)
            ],
            "themes": themes_list,
            "categories": [
                {"name": name, "count": count, "type": "category"}
                for name, count in categories_counter.most_common(10)
            ],
            "locations": [
                {"name": name, "count": count, "type": "location"}
                for name, count in locations_counter.most_common(15)
            ]
        }
