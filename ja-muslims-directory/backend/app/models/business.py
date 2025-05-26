from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.base import Base

class BusinessCategory(enum.Enum):
    RESTAURANT = "restaurant"
    GROCERY = "grocery"
    CLOTHING = "clothing"
    ELECTRONICS = "electronics"
    AUTOMOTIVE = "automotive"
    HEALTHCARE = "healthcare"
    EDUCATION = "education"
    REAL_ESTATE = "real_estate"
    CONSTRUCTION = "construction"
    PROFESSIONAL_SERVICES = "professional_services"
    RETAIL = "retail"
    WHOLESALE = "wholesale"
    MANUFACTURING = "manufacturing"
    TRANSPORTATION = "transportation"
    HOSPITALITY = "hospitality"
    BEAUTY_SALON = "beauty_salon"
    HALAL_MEAT = "halal_meat"
    ISLAMIC_FINANCE = "islamic_finance"
    BOOKSTORE = "bookstore"
    OTHER = "other"

class Business(Base):
    __tablename__ = "businesses"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    owner_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    
    category = Column(Enum(BusinessCategory), nullable=False)
    description = Column(Text)
    
    phone_number = Column(String)
    email = Column(String)
    website = Column(String)
    
    address = Column(Text, nullable=False)
    city = Column(String)
    parish = Column(String)  # For Jamaica
    postal_code = Column(String)
    
    operating_hours = Column(Text)  # JSON string or formatted text
    year_established = Column(Integer)
    number_of_employees = Column(Integer)
    
    halal_certified = Column(Boolean, default=False)
    accepts_zakat = Column(Boolean, default=False)
    
    social_media = Column(Text)  # JSON string for various social media links
    
    is_active = Column(Boolean, default=True)
    notes = Column(Text)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    owner = relationship("Member", backref="businesses")
    restaurant = relationship("Restaurant", back_populates="business", uselist=False)