from typing import Optional
from pydantic import BaseModel, validator
from datetime import datetime
from app.models.education import EducationType, EducationCategory


class EducationBase(BaseModel):
    education_type: EducationType
    category: EducationCategory
    degree_name: str
    institution: str
    location: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    is_ongoing: bool = False
    field_of_study: Optional[str] = None
    grade: Optional[str] = None
    achievements: Optional[str] = None
    islamic_qualification_details: Optional[str] = None
    
    @validator('end_year')
    def validate_end_year(cls, v, values):
        if v is not None and 'start_year' in values and values['start_year'] is not None:
            if v < values['start_year']:
                raise ValueError('End year must be after start year')
        return v
    
    @validator('is_ongoing')
    def validate_ongoing(cls, v, values):
        if v and 'end_year' in values and values['end_year'] is not None:
            raise ValueError('Cannot be ongoing if end year is specified')
        return v


class EducationCreate(EducationBase):
    member_id: int


class EducationUpdate(BaseModel):
    education_type: Optional[EducationType] = None
    category: Optional[EducationCategory] = None
    degree_name: Optional[str] = None
    institution: Optional[str] = None
    location: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    is_ongoing: Optional[bool] = None
    field_of_study: Optional[str] = None
    grade: Optional[str] = None
    achievements: Optional[str] = None
    islamic_qualification_details: Optional[str] = None


class Education(EducationBase):
    id: int
    member_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: Optional[int] = None
    
    class Config:
        from_attributes = True


class EducationWithMember(Education):
    member_name: Optional[str] = None
    
    class Config:
        from_attributes = True