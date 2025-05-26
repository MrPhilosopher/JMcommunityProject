from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.db.base import get_db
from app.models.life_event import LifeEvent as LifeEventModel, EventType
from app.models.user import User as UserModel
from app.schemas.life_event import LifeEvent, LifeEventCreate, LifeEventUpdate

router = APIRouter()

@router.get("/", response_model=List[LifeEvent])
def read_life_events(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    member_id: Optional[int] = Query(None),
    event_type: Optional[EventType] = Query(None),
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> Any:
    query = db.query(LifeEventModel)
    if member_id:
        query = query.filter(LifeEventModel.member_id == member_id)
    if event_type:
        query = query.filter(LifeEventModel.event_type == event_type)
    
    life_events = query.offset(skip).limit(limit).all()
    return life_events

@router.post("/", response_model=LifeEvent)
def create_life_event(
    *,
    db: Session = Depends(get_db),
    life_event_in: LifeEventCreate,
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> Any:
    life_event = LifeEventModel(**life_event_in.dict(), created_by=current_user.id)
    db.add(life_event)
    db.commit()
    db.refresh(life_event)
    return life_event

@router.get("/{life_event_id}", response_model=LifeEvent)
def read_life_event(
    *,
    db: Session = Depends(get_db),
    life_event_id: int,
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> Any:
    life_event = db.query(LifeEventModel).filter(LifeEventModel.id == life_event_id).first()
    if not life_event:
        raise HTTPException(status_code=404, detail="Life event not found")
    return life_event

@router.put("/{life_event_id}", response_model=LifeEvent)
def update_life_event(
    *,
    db: Session = Depends(get_db),
    life_event_id: int,
    life_event_in: LifeEventUpdate,
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> Any:
    life_event = db.query(LifeEventModel).filter(LifeEventModel.id == life_event_id).first()
    if not life_event:
        raise HTTPException(status_code=404, detail="Life event not found")
    
    update_data = life_event_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(life_event, field, value)
    
    db.add(life_event)
    db.commit()
    db.refresh(life_event)
    return life_event

@router.delete("/{life_event_id}")
def delete_life_event(
    *,
    db: Session = Depends(get_db),
    life_event_id: int,
    current_user: UserModel = Depends(deps.get_current_active_superuser),
) -> Any:
    life_event = db.query(LifeEventModel).filter(LifeEventModel.id == life_event_id).first()
    if not life_event:
        raise HTTPException(status_code=404, detail="Life event not found")
    db.delete(life_event)
    db.commit()
    return {"detail": "Life event deleted successfully"}