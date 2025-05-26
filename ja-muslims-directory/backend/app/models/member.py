from sqlalchemy import Column, Integer, String, Date, DateTime, Float, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.base import Base

class Gender(enum.Enum):
    male = "male"
    female = "female"

class MaritalStatus(enum.Enum):
    SINGLE = "single"
    MARRIED = "married"
    DIVORCED = "divorced"
    WIDOWED = "widowed"

class Member(Base):
    __tablename__ = "members"
    
    id = Column(Integer, primary_key=True, index=True)
    muslim_name = Column(String, nullable=False)
    legal_name = Column(String, nullable=False)
    gender = Column(Enum(Gender), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    date_of_conversion = Column(Date)
    marital_status = Column(Enum(MaritalStatus))
    
    present_address = Column(Text)
    permanent_address = Column(Text)
    phone_number = Column(String)
    email = Column(String)
    
    workplace = Column(String)
    occupation = Column(String)
    salary = Column(Float)
    salary_period = Column(String)  # 'monthly' or 'yearly'
    
    spouse_id = Column(Integer, ForeignKey("members.id"))
    father_name = Column(String)
    mother_name = Column(String)
    
    burial_location = Column(String)
    date_of_death = Column(Date)
    
    notes = Column(Text)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    
    spouse = relationship("Member", remote_side=[id])
    life_events = relationship("LifeEvent", foreign_keys="LifeEvent.member_id", back_populates="member")