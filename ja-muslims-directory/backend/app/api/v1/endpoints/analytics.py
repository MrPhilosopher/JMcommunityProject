from typing import Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.api import deps
from app.db.base import get_db
from app.models.member import Member as MemberModel, MaritalStatus
from app.models.life_event import LifeEvent as LifeEventModel, EventType
from app.models.user import User as UserModel
from datetime import date

router = APIRouter()

@router.get("/dashboard", response_model=Dict[str, Any])
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> Any:
    total_members = db.query(MemberModel).count()
    active_members = db.query(MemberModel).filter(MemberModel.date_of_death == None).count()
    deceased_members = db.query(MemberModel).filter(MemberModel.date_of_death != None).count()
    
    marital_status_distribution = dict(
        db.query(MemberModel.marital_status, func.count(MemberModel.id))
        .group_by(MemberModel.marital_status)
        .all()
    )
    
    current_year = date.today().year
    conversions_this_year = db.query(MemberModel).filter(
        extract('year', MemberModel.date_of_conversion) == current_year
    ).count()
    
    recent_events = db.query(LifeEventModel).order_by(
        LifeEventModel.event_date.desc()
    ).limit(10).all()
    
    event_type_distribution = dict(
        db.query(LifeEventModel.event_type, func.count(LifeEventModel.id))
        .group_by(LifeEventModel.event_type)
        .all()
    )
    
    age_groups = {
        "0-18": 0,
        "19-30": 0,
        "31-45": 0,
        "46-60": 0,
        "60+": 0
    }
    
    members = db.query(MemberModel).filter(MemberModel.date_of_death == None).all()
    for member in members:
        age = (date.today() - member.date_of_birth).days // 365
        if age <= 18:
            age_groups["0-18"] += 1
        elif age <= 30:
            age_groups["19-30"] += 1
        elif age <= 45:
            age_groups["31-45"] += 1
        elif age <= 60:
            age_groups["46-60"] += 1
        else:
            age_groups["60+"] += 1
    
    return {
        "total_members": total_members,
        "active_members": active_members,
        "deceased_members": deceased_members,
        "marital_status_distribution": marital_status_distribution,
        "conversions_this_year": conversions_this_year,
        "age_distribution": age_groups,
        "event_type_distribution": event_type_distribution,
        "recent_events": [
            {
                "id": event.id,
                "event_type": event.event_type.value,
                "event_date": event.event_date.isoformat(),
                "member_id": event.member_id
            }
            for event in recent_events
        ]
    }

@router.get("/members/statistics", response_model=Dict[str, Any])
def get_member_statistics(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> Any:
    avg_salary = db.query(func.avg(MemberModel.salary)).filter(
        MemberModel.salary != None
    ).scalar()
    
    employment_rate = db.query(MemberModel).filter(
        MemberModel.workplace != None,
        MemberModel.date_of_death == None
    ).count() / db.query(MemberModel).filter(
        MemberModel.date_of_death == None
    ).count() * 100
    
    conversions_by_year = dict(
        db.query(
            extract('year', MemberModel.date_of_conversion),
            func.count(MemberModel.id)
        )
        .filter(MemberModel.date_of_conversion != None)
        .group_by(extract('year', MemberModel.date_of_conversion))
        .all()
    )
    
    return {
        "average_salary": avg_salary,
        "employment_rate": employment_rate,
        "conversions_by_year": conversions_by_year
    }