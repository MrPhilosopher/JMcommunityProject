from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.business import BusinessCategory

class BusinessBase(BaseModel):
    name: str
    owner_id: int
    category: BusinessCategory
    description: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    address: str
    city: Optional[str] = None
    parish: Optional[str] = None
    postal_code: Optional[str] = None
    operating_hours: Optional[str] = None
    year_established: Optional[int] = None
    number_of_employees: Optional[int] = None
    halal_certified: bool = False
    accepts_zakat: bool = False
    social_media: Optional[str] = None
    is_active: bool = True
    notes: Optional[str] = None

class BusinessCreate(BusinessBase):
    pass

class BusinessUpdate(BusinessBase):
    name: Optional[str] = None
    owner_id: Optional[int] = None
    category: Optional[BusinessCategory] = None
    address: Optional[str] = None

class BusinessInDBBase(BusinessBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: Optional[int] = None
    
    class Config:
        from_attributes = True

class Business(BusinessInDBBase):
    pass

class BusinessWithOwner(Business):
    owner_name: Optional[str] = None
    owner_phone: Optional[str] = None