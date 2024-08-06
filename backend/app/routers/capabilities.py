"""
This module defines the API endpoints related to capabilities.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas
from app.crud import capabilities as crud
from app.crud import ratings as rating_crud
from app.database import get_db
from app.routers.security import get_current_user

router = APIRouter(
    prefix="/capabilities",
    tags=["capabilities"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.CapabilityRead)
def create_capability(capability: schemas.CapabilityCreate, db: Session = Depends(get_db)):
    """
    Create a new Capability.
    """
    existing_capability = crud.get_capability_by_name_and_component_id(db, name=capability.name, component_id=capability.component_id)
    if existing_capability:
        raise HTTPException(status_code=400, detail="Capability with this name already exists")
    new_capability = crud.create_capability(db=db, capability=capability)
    return new_capability

@router.get("/", response_model=List[schemas.CapabilityRead])
def read_capabilities(limit: int = 100, db: Session = Depends(get_db)):
    """
    Retreive a list of all Capabilities.
    """
    capabilities = crud.get_capabilities(db, limit=limit)
    return capabilities

@router.get("/{capability_id}", response_model=schemas.CapabilityRead)
def read_capability(capability_id: int, db: Session = Depends(get_db)):
    """
    Retreive a Capability by its ID.
    """
    capability = crud.get_capability(db, capability_id=capability_id)
    if capability is None:
        raise HTTPException(status_code=404, detail="Capability not found")
    return capability

@router.put("/{capability_id}", response_model=schemas.CapabilityRead)
def update_capability(capability_id: int, capability: schemas.CapabilityCreate, db: Session = Depends(get_db)):
    """
    Update an existing capability.
    """
    existing_capability = crud.get_capability(db, capability_id=capability_id)
    if existing_capability is None:
        raise HTTPException(status_code=404, detail="Capability not found")

    capability_by_name = crud.get_capability_by_name_and_component_id(db, name=capability.name, component_id=capability.component_id)
    if capability_by_name and capability_by_name.id != capability_id:
        raise HTTPException(status_code=400, detail="Capability name already in use in this component")
    
    updated_capability = crud.update_capability(db, capability_id=capability_id, capability=capability)
    return updated_capability

@router.delete("/{capability_id}", response_model=schemas.CapabilityRead)
def delete_capability(capability_id: int, db: Session = Depends(get_db)):
    """
    Delete an existing capability.
    """
    existing_capability = crud.get_capability(db, capability_id=capability_id)
    if existing_capability is None:
        raise HTTPException(status_code=404, detail="Capability not found")
    deleted_capability = crud.delete_capability(db, capability_id=capability_id)
    return deleted_capability

@router.post("/{capability_id}/ratings/", response_model=schemas.RatingRead)
def create_rating_for_capability(
    capability_id: int,
    rating: schemas.RatingCreate,
    db: Session = Depends(get_db),
    current_user: schemas.UserRead = Depends(get_current_user)
):
    """
    Create a new rating for a capability.
    """
    existing_capability = crud.get_capability(db, capability_id=capability_id)
    if existing_capability is None:
        raise HTTPException(status_code=404, detail="Capability not found")

    new_rating = rating_crud.create_rating(db=db, rating=rating, user_id=current_user.id)
    return new_rating

@router.put("/{capability_id}/ratings/{rating_id}", response_model=schemas.RatingRead)
def update_rating_for_capability(
    capability_id: int,
    rating_id: int,
    rating_update: schemas.RatingCreate,
    db: Session = Depends(get_db),
    current_user: schemas.UserRead = Depends(get_current_user)
):
    """
    Update a rating for a capability.
    """
    existing_capability = crud.get_capability(db, capability_id=capability_id)
    if existing_capability is None:
        raise HTTPException(status_code=404, detail="Capability not found")

    rating = rating_crud.get_rating(db=db, rating_id=rating_id)
    if rating is None:
        raise HTTPException(status_code=404, detail="Rating not found")

    # Check if the current user is authorized to update this rating
    if rating.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this rating")

    updated_rating = rating_crud.update_rating(db=db, rating_id=rating_id, rating_update=rating_update)
    return updated_rating


@router.get("/{capability_id}/ratings/", response_model=List[schemas.RatingRead])
def get_ratings_for_capability(
    capability_id: int,
    db: Session = Depends(get_db)):
    """
    Get all ratings for a capability.
    """
    existing_capability = crud.get_capability(db, capability_id=capability_id)
    if existing_capability is None:
        raise HTTPException(status_code=404, detail="Capability not found")

    return rating_crud.get_ratings_for_capability(db=db, capability_id=capability_id)

@router.delete("/{capability_id}/ratings/{rating_id}", response_model=schemas.RatingRead)
def delete_rating_for_capability(
    capability_id: int,
    rating_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.UserRead = Depends(get_current_user)
):
    """
    Delete a rating for a capability.
    """
    existing_capability = crud.get_capability(db, capability_id=capability_id)
    if existing_capability is None:
        raise HTTPException(status_code=404, detail="Capability not found")

    rating = rating_crud.get_rating(db=db, rating_id=rating_id)
    if rating is None:
        raise HTTPException(status_code=404, detail="Rating not found")

    # Check if the current user is authorized to delete this rating
    if rating.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this rating")

    deleted_rating = rating_crud.delete_rating(db=db, rating_id=rating_id)
    return deleted_rating