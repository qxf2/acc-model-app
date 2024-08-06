"""
This module defines the API endpoints related to attributes.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas
from app.crud import attributes as crud
from app.database import get_db

router = APIRouter(
    prefix="/attributes",
    tags=["attributes"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.AttributeRead)
def create_attribute(attribute: schemas.AttributeCreate, db: Session = Depends(get_db)):
    """
    Create a new Attribute.
    """
    existing_attribute = crud.get_attribute_by_name(db, name=attribute.name)
    if existing_attribute:
        raise HTTPException(status_code=400, detail="Attribute with this name already exists")
    new_attribute = crud.create_attribute(db=db, attribute=attribute)
    return new_attribute

@router.get("/", response_model=List[schemas.AttributeRead])
def read_attributes(limit: int = 100, db: Session = Depends(get_db)):
    """
    Retreive a list of all Attributes.
    """
    attributes = crud.get_attributes(db, limit=limit)
    return attributes

@router.get("/{attribute_id}", response_model=schemas.AttributeRead)
def read_attribute(attribute_id: int, db: Session = Depends(get_db)):
    """
    Retreive an Attribute by its ID.
    """
    attribute = crud.get_attribute(db, attribute_id=attribute_id)
    if attribute is None:
        raise HTTPException(status_code=404, detail="Attribute not found")
    return attribute


@router.put("/{attribute_id}", response_model=schemas.AttributeRead)
def update_attribute(attribute_id: int, attribute: schemas.AttributeCreate, db: Session = Depends(get_db)):
    """
    Update an existing Attribute.
    """
    existing_attribute = crud.get_attribute(db, attribute_id=attribute_id)
    if existing_attribute is None:
        raise HTTPException(status_code=404, detail="Attribute not found")

    existing_attribute_by_name = crud.get_attribute_by_name(db, name=attribute.name)
    if existing_attribute_by_name and existing_attribute_by_name.id != attribute_id:
        raise HTTPException(status_code=400, detail="Attribute name already in use")

    updated_attribute = crud.update_attribute(db, attribute_id=attribute_id, attribute=attribute)
    return updated_attribute


@router.delete("/{attribute_id}", response_model=schemas.AttributeRead)
def delete_attribute(attribute_id: int, db: Session = Depends(get_db)):
    """
    Delete an existing Attribute.
    """
    existing_attribute = crud.get_attribute(db, attribute_id=attribute_id)
    if existing_attribute is None:
        raise HTTPException(status_code=404, detail="Attribute not found")
    deleted_attribute = crud.delete_attribute(db, attribute_id=attribute_id)
    return deleted_attribute
