from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, members, life_events, analytics, businesses, restaurants

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(members.router, prefix="/members", tags=["members"])
api_router.include_router(life_events.router, prefix="/life-events", tags=["life-events"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(businesses.router, prefix="/businesses", tags=["businesses"])
api_router.include_router(restaurants.router, prefix="/restaurants", tags=["restaurants"])