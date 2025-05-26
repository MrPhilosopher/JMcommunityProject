from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from app.api import deps
from app.db.base import get_db
from app.models.business import Business as BusinessModel
from app.models.member import Member as MemberModel
from app.models.user import User as UserModel
from app.schemas.business import Business, BusinessCreate, BusinessUpdate, BusinessWithOwner

router = APIRouter()

@router.get("/", response_model=List[BusinessWithOwner])
def read_businesses(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> Any:
    query = db.query(BusinessModel).join(MemberModel)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                BusinessModel.name.ilike(search_filter),
                BusinessModel.description.ilike(search_filter),
                BusinessModel.phone_number.ilike(search_filter),
                MemberModel.muslim_name.ilike(search_filter),
                MemberModel.phone_number.ilike(search_filter)
            )
        )
    
    if category:
        query = query.filter(BusinessModel.category == category)
    
    if is_active is not None:
        query = query.filter(BusinessModel.is_active == is_active)
    
    businesses = query.offset(skip).limit(limit).all()
    
    # Add owner details to response
    result = []
    for business in businesses:
        business_dict = {
            **business.__dict__,
            "owner_name": business.owner.muslim_name if business.owner else None,
            "owner_phone": business.owner.phone_number if business.owner else None
        }
        result.append(business_dict)
    
    return result

@router.post("/", response_model=Business)
def create_business(
    *,
    db: Session = Depends(get_db),
    business_in: BusinessCreate,
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> Any:
    # Verify owner exists
    owner = db.query(MemberModel).filter(MemberModel.id == business_in.owner_id).first()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner member not found")
    
    business = BusinessModel(**business_in.dict(), created_by=current_user.id)
    db.add(business)
    db.commit()
    db.refresh(business)
    return business

@router.get("/{business_id}", response_model=BusinessWithOwner)
def read_business(
    *,
    db: Session = Depends(get_db),
    business_id: int,
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> Any:
    business = db.query(BusinessModel).filter(BusinessModel.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    result = {
        **business.__dict__,
        "owner_name": business.owner.muslim_name if business.owner else None,
        "owner_phone": business.owner.phone_number if business.owner else None
    }
    return result

@router.put("/{business_id}", response_model=Business)
def update_business(
    *,
    db: Session = Depends(get_db),
    business_id: int,
    business_in: BusinessUpdate,
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> Any:
    business = db.query(BusinessModel).filter(BusinessModel.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    update_data = business_in.dict(exclude_unset=True)
    
    # Verify new owner if changing
    if "owner_id" in update_data and update_data["owner_id"] != business.owner_id:
        owner = db.query(MemberModel).filter(MemberModel.id == update_data["owner_id"]).first()
        if not owner:
            raise HTTPException(status_code=404, detail="New owner member not found")
    
    for field, value in update_data.items():
        setattr(business, field, value)
    
    db.add(business)
    db.commit()
    db.refresh(business)
    return business

@router.delete("/{business_id}")
def delete_business(
    *,
    db: Session = Depends(get_db),
    business_id: int,
    current_user: UserModel = Depends(deps.get_current_active_superuser),
) -> Any:
    business = db.query(BusinessModel).filter(BusinessModel.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    db.delete(business)
    db.commit()
    return {"detail": "Business deleted successfully"}

@router.get("/categories/list", response_model=List[dict])
def get_business_categories(
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> Any:
    from app.models.business import BusinessCategory
    categories = [
        {"value": cat.value, "label": cat.value.replace("_", " ").title()}
        for cat in BusinessCategory
    ]
    return categories