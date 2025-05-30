from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime
from app.models.member import Gender, MaritalStatus

class MemberBase(BaseModel):
    muslim_name: str
    legal_name: str
    gender: Gender
    date_of_birth: date
    date_of_conversion: Optional[date] = None
    marital_status: Optional[MaritalStatus] = None
    present_address: Optional[str] = None
    permanent_address: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    workplace: Optional[str] = None
    occupation: Optional[str] = None
    salary: Optional[float] = None
    salary_period: Optional[str] = None
    spouse_id: Optional[int] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    burial_location: Optional[str] = None
    date_of_death: Optional[date] = None
    notes: Optional[str] = None
    masjid_id: Optional[int] = None

class MemberCreate(MemberBase):
    pass

class MemberUpdate(BaseModel):
    muslim_name: Optional[str] = None
    legal_name: Optional[str] = None
    gender: Optional[Gender] = None
    date_of_birth: Optional[date] = None
    date_of_conversion: Optional[date] = None
    marital_status: Optional[MaritalStatus] = None
    present_address: Optional[str] = None
    permanent_address: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    workplace: Optional[str] = None
    occupation: Optional[str] = None
    salary: Optional[float] = None
    salary_period: Optional[str] = None
    spouse_id: Optional[int] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    burial_location: Optional[str] = None
    date_of_death: Optional[date] = None
    notes: Optional[str] = None
    masjid_id: Optional[int] = None

class MemberInDBBase(MemberBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: Optional[int] = None
    
    class Config:
        from_attributes = True

class Member(MemberInDBBase):
    pass

class MemberWithRelations(Member):
    life_events: list = []