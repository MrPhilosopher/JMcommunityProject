from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func

from app import models
from app.api import deps
from app.models.masjid import Masjid, MasjidType
from app.models.member import Member
from app.schemas.masjid import (
    MasjidCreate, 
    MasjidUpdate, 
    Masjid as MasjidSchema,
    MasjidWithRelations
)
from app.schemas.member import Member as MemberSchema

router = APIRouter()


@router.get("/", response_model=List[MasjidWithRelations])
def read_masjids(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    masjid_type: Optional[MasjidType] = None,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> List[MasjidWithRelations]:
    """
    Retrieve masjids with their relations.
    """
    query = db.query(Masjid).options(
        joinedload(Masjid.imam),
        joinedload(Masjid.shura_members)
    )
    
    if search:
        query = query.filter(
            or_(
                Masjid.name.ilike(f"%{search}%"),
                Masjid.address.ilike(f"%{search}%"),
                Masjid.parish.ilike(f"%{search}%"),
                Masjid.activities.ilike(f"%{search}%")
            )
        )
    
    if masjid_type:
        query = query.filter(Masjid.type == masjid_type)
    
    masjids = query.offset(skip).limit(limit).all()
    
    # Convert to response model with counts
    result = []
    for masjid in masjids:
        affiliated_count = db.query(func.count(Member.id)).filter(
            Member.masjid_id == masjid.id
        ).scalar()
        
        masjid_dict = {
            "id": masjid.id,
            "name": masjid.name,
            "type": masjid.type,
            "address": masjid.address,
            "city": masjid.city,
            "parish": masjid.parish,
            "postal_code": masjid.postal_code,
            "phone": masjid.phone,
            "email": masjid.email,
            "website": masjid.website,
            "imam_id": masjid.imam_id,
            "established_year": masjid.established_year,
            "capacity": masjid.capacity,
            "facilities": masjid.facilities,
            "prayer_times_info": masjid.prayer_times_info,
            "jummah_time": masjid.jummah_time,
            "activities": masjid.activities,
            "created_at": masjid.created_at,
            "updated_at": masjid.updated_at,
            "imam": masjid.imam,
            "shura_members": masjid.shura_members,
            "affiliated_members_count": affiliated_count
        }
        result.append(MasjidWithRelations(**masjid_dict))
    
    return result


@router.post("/", response_model=MasjidSchema)
def create_masjid(
    *,
    db: Session = Depends(deps.get_db),
    masjid_in: MasjidCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> MasjidSchema:
    """
    Create new masjid.
    """
    # Extract shura member IDs
    shura_member_ids = masjid_in.shura_member_ids
    masjid_data = masjid_in.dict(exclude={"shura_member_ids"})
    
    # Create masjid
    masjid = Masjid(**masjid_data, created_by=current_user.id)
    
    # Add shura members if provided
    if shura_member_ids:
        shura_members = db.query(Member).filter(Member.id.in_(shura_member_ids)).all()
        masjid.shura_members = shura_members
    
    db.add(masjid)
    db.commit()
    db.refresh(masjid)
    return masjid


@router.get("/{masjid_id}", response_model=MasjidWithRelations)
def read_masjid(
    *,
    db: Session = Depends(deps.get_db),
    masjid_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> MasjidWithRelations:
    """
    Get masjid by ID with all relations.
    """
    masjid = db.query(Masjid).options(
        joinedload(Masjid.imam),
        joinedload(Masjid.shura_members)
    ).filter(Masjid.id == masjid_id).first()
    
    if not masjid:
        raise HTTPException(status_code=404, detail="Masjid not found")
    
    # Get affiliated members count
    affiliated_count = db.query(func.count(Member.id)).filter(
        Member.masjid_id == masjid.id
    ).scalar()
    
    masjid_dict = {
        "id": masjid.id,
        "name": masjid.name,
        "type": masjid.type,
        "address": masjid.address,
        "city": masjid.city,
        "parish": masjid.parish,
        "postal_code": masjid.postal_code,
        "phone": masjid.phone,
        "email": masjid.email,
        "website": masjid.website,
        "imam_id": masjid.imam_id,
        "established_year": masjid.established_year,
        "capacity": masjid.capacity,
        "facilities": masjid.facilities,
        "prayer_times_info": masjid.prayer_times_info,
        "jummah_time": masjid.jummah_time,
        "activities": masjid.activities,
        "created_at": masjid.created_at,
        "updated_at": masjid.updated_at,
        "imam": masjid.imam,
        "shura_members": masjid.shura_members,
        "affiliated_members_count": affiliated_count
    }
    
    return MasjidWithRelations(**masjid_dict)


@router.put("/{masjid_id}", response_model=MasjidSchema)
def update_masjid(
    *,
    db: Session = Depends(deps.get_db),
    masjid_id: int,
    masjid_in: MasjidUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> MasjidSchema:
    """
    Update masjid.
    """
    masjid = db.query(Masjid).filter(Masjid.id == masjid_id).first()
    if not masjid:
        raise HTTPException(status_code=404, detail="Masjid not found")
    
    # Update shura members if provided
    if masjid_in.shura_member_ids is not None:
        shura_members = db.query(Member).filter(
            Member.id.in_(masjid_in.shura_member_ids)
        ).all()
        masjid.shura_members = shura_members
    
    # Update other fields
    update_data = masjid_in.dict(exclude={"shura_member_ids"}, exclude_unset=True)
    for field, value in update_data.items():
        setattr(masjid, field, value)
    
    db.commit()
    db.refresh(masjid)
    return masjid


@router.delete("/{masjid_id}")
def delete_masjid(
    *,
    db: Session = Depends(deps.get_db),
    masjid_id: int,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> dict:
    """
    Delete masjid.
    """
    masjid = db.query(Masjid).filter(Masjid.id == masjid_id).first()
    if not masjid:
        raise HTTPException(status_code=404, detail="Masjid not found")
    
    # Check if there are affiliated members
    affiliated_count = db.query(func.count(Member.id)).filter(
        Member.masjid_id == masjid.id
    ).scalar()
    
    if affiliated_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete masjid with {affiliated_count} affiliated members. Please reassign them first."
        )
    
    db.delete(masjid)
    db.commit()
    return {"message": "Masjid deleted successfully"}


@router.get("/{masjid_id}/members", response_model=List[MemberSchema])
def get_masjid_members(
    *,
    db: Session = Depends(deps.get_db),
    masjid_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> List[MemberSchema]:
    """
    Get all members affiliated with a specific masjid.
    """
    masjid = db.query(Masjid).filter(Masjid.id == masjid_id).first()
    if not masjid:
        raise HTTPException(status_code=404, detail="Masjid not found")
    
    members = db.query(Member).filter(Member.masjid_id == masjid_id).all()
    return members