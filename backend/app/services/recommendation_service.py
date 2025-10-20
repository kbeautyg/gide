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
        db: AsyncSession
    ) -> Dict[str, List[Dict]]:
        """
        Автоматически создает динамические категории из реальных данных туров
        Анализирует landmarks, tags, themes для создания навигации
        """
        
        # Получаем все активные туры
        result = await db.execute(
            select(Tour).where(
                Tour.active == True,
                Tour.is_public == True
            )
        )
        tours = result.scalars().all()
        
        # Собираем статистику
        landmarks_counter = Counter()
        tags_counter = Counter()
        themes_counter = Counter()
        categories_counter = Counter()
        locations_counter = Counter()
        
        for tour in tours:
            categories_counter[tour.category] += 1
            locations_counter[tour.location] += 1
            
            for landmark in (tour.landmarks or []):
                landmarks_counter[landmark] += 1
            
            for tag in (tour.tags or []):
                tags_counter[tag] += 1
            
            for theme in (tour.themes or []):
                themes_counter[theme] += 1
        
        # Формируем результат
        return {
            "landmarks": [
                {"name": name, "count": count, "type": "landmark"}
                for name, count in landmarks_counter.most_common(20)
            ],
            "tags": [
                {"name": name, "count": count, "type": "tag"}
                for name, count in tags_counter.most_common(15)
            ],
            "themes": [
                {"name": name, "count": count, "type": "theme"}
                for name, count in themes_counter.most_common(12)
            ],
            "categories": [
                {"name": name, "count": count, "type": "category"}
                for name, count in categories_counter.most_common(10)
            ],
            "locations": [
                {"name": name, "count": count, "type": "location"}
                for name, count in locations_counter.most_common(15)
            ]
        }


