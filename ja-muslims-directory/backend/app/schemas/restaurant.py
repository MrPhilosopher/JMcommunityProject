from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.restaurant import CuisineType


class RestaurantMenuBase(BaseModel):
    file_name: str
    file_type: str


class RestaurantMenuCreate(RestaurantMenuBase):
    pass


class RestaurantMenu(RestaurantMenuBase):
    id: int
    restaurant_id: int
    file_path: str
    uploaded_at: datetime

    class Config:
        from_attributes = True


class RestaurantBase(BaseModel):
    name: str
    address: str
    parish: str
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    is_halal_certified: bool = False
    has_halal_options: bool = False
    has_vegetarian_options: bool = False
    has_vegan_options: bool = False
    cuisine_types: Optional[str] = None
    opening_hours: Optional[str] = None
    description: Optional[str] = None
    business_id: Optional[int] = None


class RestaurantCreate(RestaurantBase):
    pass


class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    parish: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    is_halal_certified: Optional[bool] = None
    has_halal_options: Optional[bool] = None
    has_vegetarian_options: Optional[bool] = None
    has_vegan_options: Optional[bool] = None
    cuisine_types: Optional[str] = None
    opening_hours: Optional[str] = None
    description: Optional[str] = None
    business_id: Optional[int] = None


class RestaurantInDB(RestaurantBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    menu_files: List[RestaurantMenu] = []

    class Config:
        from_attributes = True


class Restaurant(RestaurantInDB):
    pass


class RestaurantWithBusiness(Restaurant):
    business_name: Optional[str] = None
    owner_name: Optional[str] = None