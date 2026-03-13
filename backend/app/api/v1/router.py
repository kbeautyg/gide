from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, users, tours, destinations, 
    custom_tours, categories, reviews,
    bookings, admin, requests, articles,
    seo, user_profile, chats, notifications
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(tours.router, prefix="/tours", tags=["tours"])
api_router.include_router(destinations.router, prefix="/destinations", tags=["destinations"])
api_router.include_router(custom_tours.router, prefix="/custom-tours", tags=["custom-tours"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(requests.router, prefix="/requests", tags=["requests"])
api_router.include_router(articles.router, prefix="/articles", tags=["articles"])
api_router.include_router(seo.router, prefix="/seo", tags=["seo"])
api_router.include_router(user_profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(chats.router, prefix="/chats", tags=["chats"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])