from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.models.masjid import MasjidType


class MasjidBase(BaseModel):
    name: str
    type: MasjidType
    address: str
    city: Optional[str] = None
    parish: str
    postal_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    imam_id: Optional[int] = None
    established_year: Optional[int] = None
    capacity: Optional[int] = None
    facilities: Optional[str] = None
    prayer_times_info: Optional[str] = None
    jummah_time: Optional[str] = None
    activities: Optional[str] = None


class MasjidCreate(MasjidBase):
    shura_member_ids: Optional[List[int]] = []


class MasjidUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[MasjidType] = None
    address: Optional[str] = None
    city: Optional[str] = None
    parish: Optional[str] = None
    postal_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    imam_id: Optional[int] = None
    established_year: Optional[int] = None
    capacity: Optional[int] = None
    facilities: Optional[str] = None
    prayer_times_info: Optional[str] = None
    jummah_time: Optional[str] = None
    activities: Optional[str] = None
    shura_member_ids: Optional[List[int]] = None


class MemberBasic(BaseModel):
    id: int
    muslim_name: str
    legal_name: str
    
    class Config:
        from_attributes = True


class Masjid(MasjidBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class MasjidWithRelations(Masjid):
    imam: Optional[MemberBasic] = None
    shura_members: List[MemberBasic] = []
    affiliated_members_count: Optional[int] = 0
    
    class Config:
        from_attributes = True