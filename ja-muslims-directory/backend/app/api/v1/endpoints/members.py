from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.api import deps
from app.db.base import get_db
from app.models.member import Member as MemberModel
from app.models.user import User as UserModel
from app.schemas.member import Member, MemberCreate, MemberUpdate, MemberWithRelations
import json

router = APIRouter()

@router.get("/", response_model=List[Member])
def read_members(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = Query(None),
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> Any:
    query = db.query(MemberModel)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                MemberModel.muslim_name.ilike(search_filter),
                MemberModel.legal_name.ilike(search_filter),
                MemberModel.email.ilike(search_filter),
                MemberModel.phone_number.ilike(search_filter)
            )
        )
    members = query.offset(skip).limit(limit).all()
    return members

@router.post("/", response_model=Member)
def create_member(
    *,
    db: Session = Depends(get_db),
    member_in: MemberCreate,
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> Any:
    member = MemberModel(**member_in.dict(), created_by=current_user.id)
    db.add(member)
    db.commit()
    db.refresh(member)
    return member

@router.get("/{member_id}", response_model=MemberWithRelations)
def read_member(
    *,
    db: Session = Depends(get_db),
    member_id: int,
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> Any:
    member = db.query(MemberModel).filter(MemberModel.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

@router.put("/{member_id}/debug")
async def debug_update_member(
    *,
    member_id: int,
    request: Request,
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> Any:
    body = await request.body()
    print(f"=== DEBUG UPDATE MEMBER {member_id} ===")
    print(f"Raw body: {body}")
    try:
        import json
        data = json.loads(body)
        print(f"Parsed JSON: {data}")
        return {"status": "success", "data": data}
    except Exception as e:
        print(f"Error parsing JSON: {e}")
        return {"status": "error", "error": str(e)}

@router.put("/{member_id}", response_model=Member)
def update_member(
    *,
    db: Session = Depends(get_db),
    member_id: int,
    request: Request,
    member_in: MemberUpdate,
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> Any:
    print(f"=== UPDATE MEMBER {member_id} ===")
    try:
        # Log raw request body
        print(f"Raw request content: {member_in}")
        
        member = db.query(MemberModel).filter(MemberModel.id == member_id).first()
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        
        update_data = member_in.dict(exclude_unset=True)
        print(f"Update data: {update_data}")
        
        for field, value in update_data.items():
            if hasattr(member, field):
                print(f"Setting {field} = {value}")
                setattr(member, field, value)
            else:
                print(f"Warning: Field {field} not found on member model")
        
        db.add(member)
        db.commit()
        db.refresh(member)
        print("Member updated successfully")
        return member
    except Exception as e:
        print(f"Error updating member: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=422, detail=f"{type(e).__name__}: {str(e)}")

@router.delete("/{member_id}")
def delete_member(
    *,
    db: Session = Depends(get_db),
    member_id: int,
    current_user: UserModel = Depends(deps.get_current_active_superuser),
) -> Any:
    member = db.query(MemberModel).filter(MemberModel.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    db.delete(member)
    db.commit()
    return {"detail": "Member deleted successfully"}