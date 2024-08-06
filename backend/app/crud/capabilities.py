"""
This module contains the CRUD (Create, Read, Update, Delete) operations for interacting with the database models.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException
from app import models, schemas

def get_capability(db: Session, capability_id: int):
    """
    Retrieve a Capability by its ID.
    """
    return db.query(models.Capability).filter(models.Capability.id == capability_id).first()

def get_capabilities(db: Session, limit: int = 100):
    """
    Retrieve a list of all Capabilities.
    """
    return db.query(models.Capability).limit(limit).all()

def get_capability_by_name_and_component_id(db: Session, name: str, component_id: int):
    """
    Retrieve a Capability by its name and component_id.
    """
    return db.query(models.Capability).filter(models.Capability.name == name, models.Capability.component_id == component_id).first()

def create_capability(db: Session, capability: schemas.CapabilityCreate):
    """
    Create a new Capability.
    """
    # Check if the component exists
    component = db.query(models.Component).filter(models.Component.id == capability.component_id).first()
    if component is None:
        raise HTTPException(status_code=404, detail="Component with this id does not exist")

    # Check if attribute id is valid
    attribute = db.query(models.Attribute).filter(models.Attribute.id == capability.attribute_id).first()
    if attribute is None:
        raise HTTPException(status_code=404, detail="Attribute with this id does not exist")

    # Check if a capability with the same name and component_id already exists
    existing_capability = get_capability_by_name_and_component_id(db, name=capability.name, component_id=capability.component_id)
    if existing_capability:
        raise HTTPException(status_code=400, detail="Capability name already in use in this component")
    
    db_capability = models.Capability(**capability.model_dump())
    db.add(db_capability)
    db.commit()
    db.refresh(db_capability)
    return db_capability

def update_capability(db: Session, capability_id: int, capability: schemas.CapabilityCreate):
    """
    Update an existing capability.
    """
    # Check if the capability exists
    db_capability = db.query(models.Capability).filter(models.Capability.id == capability_id).first()
    if db_capability is None:
        raise HTTPException(status_code=404, detail="Capability not found")

    # Check if component_id is valid
    component = db.query(models.Component).filter(models.Component.id == capability.component_id).first()
    if component is None:
        raise HTTPException(status_code=400, detail="Component with this id does not exist")

    # Check if attribute_id is valid
    attribute = db.query(models.Attribute).filter(models.Attribute.id == capability.attribute_id).first()
    if attribute is None:
        raise HTTPException(status_code=400, detail="Attribute with this id does not exist")

    # Check if a capability with the same name and component_id already exists
    existing_capability_by_name = get_capability_by_name_and_component_id(db, name=capability.name, component_id=capability.component_id)
    if existing_capability_by_name and existing_capability_by_name.id != capability_id:
        raise HTTPException(status_code=400, detail="Capability name already in use in this component")

    # Update capability
    for key, value in capability.model_dump().items():
        setattr(db_capability, key, value)

    db.commit()
    db.refresh(db_capability)
    return db_capability

def delete_capability(db: Session, capability_id: int):
    """
    Delete an existing capability.
    """
    db_capability = db.query(models.Capability).filter(models.Capability.id == capability_id).first()
    if db_capability:
        db.delete(db_capability)
        db.commit()
    return db_capability
