from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app import models
from app.api import deps
from app.models.education import Education
from app.models.member import Member
from app.schemas.education import (
    EducationCreate,
    EducationUpdate,
    Education as EducationSchema,
    EducationWithMember
)

router = APIRouter()


@router.get("/", response_model=List[EducationSchema])
def read_educations(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    member_id: Optional[int] = None,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> List[EducationSchema]:
    """
    Retrieve educations. Optionally filter by member_id.
    """
    query = db.query(Education)
    
    if member_id:
        query = query.filter(Education.member_id == member_id)
    
    educations = query.offset(skip).limit(limit).all()
    return educations


@router.post("/", response_model=EducationSchema)
def create_education(
    *,
    db: Session = Depends(deps.get_db),
    education_in: EducationCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> EducationSchema:
    """
    Create new education record for a member.
    """
    # Verify member exists
    member = db.query(Member).filter(Member.id == education_in.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    education = Education(
        **education_in.dict(),
        created_by=current_user.id
    )
    db.add(education)
    db.commit()
    db.refresh(education)
    return education


@router.get("/{education_id}", response_model=EducationSchema)
def read_education(
    *,
    db: Session = Depends(deps.get_db),
    education_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> EducationSchema:
    """
    Get education by ID.
    """
    education = db.query(Education).filter(Education.id == education_id).first()
    if not education:
        raise HTTPException(status_code=404, detail="Education not found")
    return education


@router.put("/{education_id}", response_model=EducationSchema)
def update_education(
    *,
    db: Session = Depends(deps.get_db),
    education_id: int,
    education_in: EducationUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> EducationSchema:
    """
    Update education record.
    """
    education = db.query(Education).filter(Education.id == education_id).first()
    if not education:
        raise HTTPException(status_code=404, detail="Education not found")
    
    update_data = education_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(education, field, value)
    
    db.commit()
    db.refresh(education)
    return education


@router.delete("/{education_id}")
def delete_education(
    *,
    db: Session = Depends(deps.get_db),
    education_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> dict:
    """
    Delete education record.
    """
    education = db.query(Education).filter(Education.id == education_id).first()
    if not education:
        raise HTTPException(status_code=404, detail="Education not found")
    
    db.delete(education)
    db.commit()
    return {"message": "Education deleted successfully"}


@router.get("/member/{member_id}", response_model=List[EducationSchema])
def get_member_educations(
    *,
    db: Session = Depends(deps.get_db),
    member_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> List[EducationSchema]:
    """
    Get all education records for a specific member.
    """
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    educations = db.query(Education).filter(
        Education.member_id == member_id
    ).order_by(Education.end_year.desc().nullslast(), Education.start_year.desc()).all()
    
    return educations