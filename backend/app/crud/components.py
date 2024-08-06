"""
This module contains the CRUD (Create, Read, Update, Delete) operations for interacting with the database models.
"""
import logging
from typing import Optional, List
from sqlalchemy.orm import Session
from app import schemas, models
from app.crud import acc_models
from fastapi import HTTPException

def get_component(db: Session, component_id: int):
    """
    Retreive a Component by its ID.
    """
    logging.info(f"Fetching component with ID: {component_id}")
    component = db.query(models.Component).filter(models.Component.id == component_id).first()
    logging.info(f"Component fetched: {component}")
    if component:
        acc_model = db.query(models.ACCModel).filter(models.ACCModel.id == component.acc_model_id).first()
        component_details = {
            "id": component.id,
            "name": component.name,
            "description": component.description,
            "acc_model_id": component.acc_model_id,
            "acc_model_name": acc_model.name if acc_model else None
        }
        logging.info(f"Component details constructed: {component_details}")
        return component_details
    logging.warning(f"Component with ID: {component_id} not found")
    return None

def get_all_components(db:Session, limit: int = 100) -> List[dict]:
    """
    Retreive a list of all Components.
    """
    components = db.query(models.Component).limit(limit).all()
    component_details = []
    for component in components:
        acc_model = db.query(models.ACCModel).filter(models.ACCModel.id == component.acc_model_id).first()
        component_details.append({
            "id": component.id,
            "name": component.name,
            "description": component.description,
            "acc_model_id": component.acc_model_id,
            "acc_model_name": acc_model.name if acc_model else None
        })
    return component_details

def get_components_by_acc_model(db: Session, acc_model_id: int, limit: int = 100) -> List[dict]:
    """
    Retreive a list of all Components by acc_model_id
    """
    components = db.query(models.Component).filter(models.Component.acc_model_id == acc_model_id).limit(limit).all()
    component_details = []
    for component in components:
        acc_model = db.query(models.ACCModel).filter(models.ACCModel.id == component.acc_model_id).first()
        component_details.append({
            "id": component.id,
            "name": component.name,
            "description": component.description,
            "acc_model_id": component.acc_model_id,
            "acc_model_name": acc_model.name if acc_model else None
        })
    return component_details


def get_component_by_name_and_acc_model_id(db: Session, name: str, acc_model_id: int):
    """
    Retreive a Component by its name and acc_model_id.
    """
    return db.query(models.Component).filter(models.Component.name == name, models.Component.acc_model_id == acc_model_id).first()

def create_component(db: Session, component: schemas.ComponentCreate):
    """
    Create a new Component.
    """
    # Check if acc_model_id is valid
    acc_model = acc_models.get_acc_model(db, component.acc_model_id)
    if acc_model is None:
        raise HTTPException(status_code=400, detail="ACC model with this ID does not exist")
    
    # Check if a component with the same name and acc_model_id already exists
    existing_component = get_component_by_name_and_acc_model_id(db, name=component.name, acc_model_id=component.acc_model_id)
    if existing_component:
        raise HTTPException(status_code=400, detail="Component with this name already exists in this ACC model")
    
    db_component = models.Component(**component.model_dump())
    db.add(db_component)
    db.commit()
    db.refresh(db_component)
    return db_component

def update_component(db: Session, component_id: int, component: schemas.ComponentCreate):
    """
    Update an existing Component.
    """
    # Check if the component exists
    existing_component = db.query(models.Component).filter(models.Component.id == component_id).first()
    if not existing_component:
        raise HTTPException(status_code=404, detail="Component not found")

    # Check if the ACC model exists
    acc_model = acc_models.get_acc_model(db, component.acc_model_id)
    if not acc_model:
        raise HTTPException(status_code=400, detail="ACC model with this ID does not exist")

    # Check if a component with the same name and acc_model_id already exists
    existing_component_by_name = get_component_by_name_and_acc_model_id(db, name=component.name, acc_model_id=component.acc_model_id)
    if existing_component_by_name and existing_component_by_name.id != component_id:
        raise HTTPException(status_code=400, detail="Component name already in use in this ACC model")

    # Update component
    for key, value in component.model_dump().items():
        setattr(existing_component, key, value)

    db.commit()
    db.refresh(existing_component)
    return existing_component


def delete_component(db: Session, component_id: int) -> dict:
    """
    Delete an existing Component.
    """
    db_component = db.query(models.Component).filter(models.Component.id == component_id).first()
    if db_component:
        acc_model = db.query(models.ACCModel).filter(models.ACCModel.id == db_component.acc_model_id).first()
        component_details = {
            "id": db_component.id,
            "name": db_component.name,
            "description": db_component.description,
            "acc_model_id": db_component.acc_model_id,
            "acc_model_name": acc_model.name if acc_model else None
        }
        db.delete(db_component)
        db.commit()
        return component_details
    return None

