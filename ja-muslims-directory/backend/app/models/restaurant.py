from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class CuisineType(str, enum.Enum):
    JAMAICAN = "jamaican"
    MIDDLE_EASTERN = "middle_eastern"
    INDIAN = "indian"
    PAKISTANI = "pakistani"
    MEDITERRANEAN = "mediterranean"
    AFRICAN = "african"
    AMERICAN = "american"
    CHINESE = "chinese"
    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"
    SEAFOOD = "seafood"
    FUSION = "fusion"
    OTHER = "other"


class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    parish = Column(String, nullable=False)
    phone = Column(String)
    email = Column(String)
    website = Column(String)
    
    # Restaurant type
    is_halal_certified = Column(Boolean, default=False)
    has_halal_options = Column(Boolean, default=False)
    has_vegetarian_options = Column(Boolean, default=False)
    has_vegan_options = Column(Boolean, default=False)
    
    # Details
    cuisine_types = Column(String)  # Comma-separated list
    opening_hours = Column(Text)
    description = Column(Text)
    
    # Link to business if Muslim-owned
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=True)
    business = relationship("Business", back_populates="restaurant")
    
    # Menu files
    menu_files = relationship("RestaurantMenu", back_populates="restaurant", cascade="all, delete-orphan")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class RestaurantMenu(Base):
    __tablename__ = "restaurant_menus"
    
    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # 'pdf' or 'image'
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    restaurant = relationship("Restaurant", back_populates="menu_files")