from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
import os
import shutil
from datetime import datetime

from app import models
from app.api import deps
from app.models.restaurant import Restaurant, RestaurantMenu
from app.models.business import Business, BusinessCategory
from app.schemas.restaurant import (
    RestaurantCreate, 
    RestaurantUpdate, 
    Restaurant as RestaurantSchema,
    RestaurantWithBusiness,
    RestaurantMenu as RestaurantMenuSchema
)

router = APIRouter()


@router.get("/", response_model=List[RestaurantWithBusiness])
def read_restaurants(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    halal_only: Optional[bool] = None,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> List[RestaurantWithBusiness]:
    """
    Retrieve restaurants, including Muslim-owned restaurants from businesses.
    """
    query = db.query(Restaurant).options(
        joinedload(Restaurant.business).joinedload(Business.owner)
    )
    
    if search:
        query = query.filter(
            or_(
                Restaurant.name.ilike(f"%{search}%"),
                Restaurant.address.ilike(f"%{search}%"),
                Restaurant.parish.ilike(f"%{search}%"),
                Restaurant.cuisine_types.ilike(f"%{search}%")
            )
        )
    
    if halal_only:
        query = query.filter(
            or_(
                Restaurant.is_halal_certified == True,
                Restaurant.has_halal_options == True
            )
        )
    
    restaurants = query.offset(skip).limit(limit).all()
    
    # Get Muslim-owned restaurants from businesses
    restaurant_businesses = db.query(Business).filter(
        Business.category == BusinessCategory.RESTAURANT,
        Business.is_active == True
    ).options(joinedload(Business.owner)).all()
    
    # Convert businesses to restaurant format if not already in restaurants table
    result = []
    restaurant_business_ids = {r.business_id for r in restaurants if r.business_id}
    
    for restaurant in restaurants:
        rest_dict = {
            "id": restaurant.id,
            "name": restaurant.name,
            "address": restaurant.address,
            "parish": restaurant.parish,
            "phone": restaurant.phone,
            "email": restaurant.email,
            "website": restaurant.website,
            "is_halal_certified": restaurant.is_halal_certified,
            "has_halal_options": restaurant.has_halal_options,
            "has_vegetarian_options": restaurant.has_vegetarian_options,
            "has_vegan_options": restaurant.has_vegan_options,
            "cuisine_types": restaurant.cuisine_types,
            "opening_hours": restaurant.opening_hours,
            "description": restaurant.description,
            "business_id": restaurant.business_id,
            "created_at": restaurant.created_at,
            "updated_at": restaurant.updated_at,
            "menu_files": restaurant.menu_files,
            "business_name": restaurant.business.name if restaurant.business else None,
            "owner_name": restaurant.business.owner.legal_name if restaurant.business and restaurant.business.owner else None
        }
        result.append(RestaurantWithBusiness(**rest_dict))
    
    # Add restaurant businesses not in restaurants table
    for business in restaurant_businesses:
        if business.id not in restaurant_business_ids:
            rest_dict = {
                "id": 0,  # Placeholder ID for businesses not in restaurant table
                "name": business.name,
                "address": business.address,
                "parish": business.parish,
                "phone": business.phone_number,
                "email": business.email,
                "website": business.website,
                "is_halal_certified": business.halal_certified,
                "has_halal_options": business.halal_certified,
                "has_vegetarian_options": False,
                "has_vegan_options": False,
                "cuisine_types": None,
                "opening_hours": business.operating_hours,
                "description": business.description,
                "business_id": business.id,
                "created_at": business.created_at,
                "updated_at": business.updated_at,
                "menu_files": [],
                "business_name": business.name,
                "owner_name": business.owner.legal_name if business.owner else None
            }
            if not search or (search and (
                search.lower() in business.name.lower() or
                search.lower() in business.address.lower() or
                search.lower() in business.parish.lower()
            )):
                if not halal_only or business.halal_certified:
                    result.append(RestaurantWithBusiness(**rest_dict))
    
    return result


@router.post("/", response_model=RestaurantSchema)
def create_restaurant(
    *,
    db: Session = Depends(deps.get_db),
    restaurant_in: RestaurantCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> RestaurantSchema:
    """
    Create new restaurant.
    """
    restaurant = Restaurant(**restaurant_in.dict())
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return restaurant


@router.get("/{restaurant_id}", response_model=RestaurantWithBusiness)
def read_restaurant(
    *,
    db: Session = Depends(deps.get_db),
    restaurant_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> RestaurantWithBusiness:
    """
    Get restaurant by ID.
    """
    restaurant = db.query(Restaurant).options(
        joinedload(Restaurant.business).joinedload(Business.owner),
        joinedload(Restaurant.menu_files)
    ).filter(Restaurant.id == restaurant_id).first()
    
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    rest_dict = {
        "id": restaurant.id,
        "name": restaurant.name,
        "address": restaurant.address,
        "parish": restaurant.parish,
        "phone": restaurant.phone,
        "email": restaurant.email,
        "website": restaurant.website,
        "is_halal_certified": restaurant.is_halal_certified,
        "has_halal_options": restaurant.has_halal_options,
        "has_vegetarian_options": restaurant.has_vegetarian_options,
        "has_vegan_options": restaurant.has_vegan_options,
        "cuisine_types": restaurant.cuisine_types,
        "opening_hours": restaurant.opening_hours,
        "description": restaurant.description,
        "business_id": restaurant.business_id,
        "created_at": restaurant.created_at,
        "updated_at": restaurant.updated_at,
        "menu_files": restaurant.menu_files,
        "business_name": restaurant.business.name if restaurant.business else None,
        "owner_name": restaurant.business.owner.legal_name if restaurant.business and restaurant.business.owner else None
    }
    
    return RestaurantWithBusiness(**rest_dict)


@router.put("/{restaurant_id}", response_model=RestaurantSchema)
def update_restaurant(
    *,
    db: Session = Depends(deps.get_db),
    restaurant_id: int,
    restaurant_in: RestaurantUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> RestaurantSchema:
    """
    Update restaurant.
    """
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    update_data = restaurant_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(restaurant, field, value)
    
    restaurant.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(restaurant)
    return restaurant


@router.delete("/{restaurant_id}")
def delete_restaurant(
    *,
    db: Session = Depends(deps.get_db),
    restaurant_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> dict:
    """
    Delete restaurant.
    """
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Delete associated menu files
    for menu_file in restaurant.menu_files:
        if os.path.exists(menu_file.file_path):
            os.remove(menu_file.file_path)
    
    db.delete(restaurant)
    db.commit()
    return {"message": "Restaurant deleted successfully"}


@router.post("/{restaurant_id}/menu", response_model=RestaurantMenuSchema)
async def upload_menu(
    *,
    db: Session = Depends(deps.get_db),
    restaurant_id: int,
    file: UploadFile = File(...),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> RestaurantMenuSchema:
    """
    Upload menu file for restaurant (PDF or image).
    """
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Validate file type
    allowed_types = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only PDF and images (JPEG, PNG, GIF) are allowed."
        )
    
    # Create upload directory
    upload_dir = f"uploads/restaurants/{restaurant_id}"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_extension = file.filename.split(".")[-1]
    file_name = f"menu_{timestamp}.{file_extension}"
    file_path = os.path.join(upload_dir, file_name)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create database entry
    file_type = "pdf" if file.content_type == "application/pdf" else "image"
    menu_file = RestaurantMenu(
        restaurant_id=restaurant_id,
        file_name=file.filename,
        file_path=file_path,
        file_type=file_type
    )
    
    db.add(menu_file)
    db.commit()
    db.refresh(menu_file)
    
    return menu_file


@router.delete("/{restaurant_id}/menu/{menu_id}")
def delete_menu(
    *,
    db: Session = Depends(deps.get_db),
    restaurant_id: int,
    menu_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> dict:
    """
    Delete menu file.
    """
    menu_file = db.query(RestaurantMenu).filter(
        RestaurantMenu.id == menu_id,
        RestaurantMenu.restaurant_id == restaurant_id
    ).first()
    
    if not menu_file:
        raise HTTPException(status_code=404, detail="Menu file not found")
    
    # Delete physical file
    if os.path.exists(menu_file.file_path):
        os.remove(menu_file.file_path)
    
    db.delete(menu_file)
    db.commit()
    
    return {"message": "Menu file deleted successfully"}