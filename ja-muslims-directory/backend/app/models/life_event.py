from sqlalchemy import Column, Integer, String, Date, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.base import Base

class EventType(enum.Enum):
    MARRIAGE = "marriage"
    DIVORCE = "divorce"
    BIRTH = "birth"
    DEATH = "death"
    CONVERSION = "conversion"
    HAJJ = "hajj"
    UMRAH = "umrah"
    EDUCATION = "education"
    EMPLOYMENT = "employment"
    OTHER = "other"

class LifeEvent(Base):
    __tablename__ = "life_events"
    
    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    event_type = Column(Enum(EventType), nullable=False)
    event_date = Column(Date, nullable=False)
    event_location = Column(String)
    description = Column(Text)
    
    related_member_id = Column(Integer, ForeignKey("members.id"))
    
    created_at = Column(DateTime, server_default=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    
    member = relationship("Member", foreign_keys=[member_id], back_populates="life_events")
    related_member = relationship("Member", foreign_keys=[related_member_id])