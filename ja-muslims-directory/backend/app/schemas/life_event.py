from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from app.models.life_event import EventType

class LifeEventBase(BaseModel):
    member_id: int
    event_type: EventType
    event_date: date
    event_location: Optional[str] = None
    description: Optional[str] = None
    related_member_id: Optional[int] = None

class LifeEventCreate(LifeEventBase):
    pass

class LifeEventUpdate(LifeEventBase):
    member_id: Optional[int] = None
    event_type: Optional[EventType] = None
    event_date: Optional[date] = None

class LifeEventInDBBase(LifeEventBase):
    id: int
    created_at: datetime
    created_by: Optional[int] = None
    
    class Config:
        from_attributes = True

class LifeEvent(LifeEventInDBBase):
    pass