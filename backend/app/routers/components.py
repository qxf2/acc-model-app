"""
This module defines the API endpoints related to components.
"""
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas
from app.crud import components as crud
from app.database import get_db

router = APIRouter(
    prefix="/components",
    tags=["components"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.ComponentRead)
def create_component(component: schemas.ComponentCreate, db: Session = Depends(get_db)):
    """
    Create a new Component.
    """
    existing_component = crud.get_component_by_name_and_acc_model_id(db, name=component.name, acc_model_id=component.acc_model_id)
    if existing_component:
        raise HTTPException(status_code=400, detail="Component with this name already exists")    
    new_component = crud.create_component(db=db, component=component)
    return new_component

@router.get("/", response_model=List[schemas.ComponentRead])
def read_all_components(limit: int = 100, db: Session = Depends(get_db)):
    """
    Retreive a list of all Components.
    """
    logging.info(f"Reading all components")
    components = crud.get_all_components(db, limit=limit)
    return components

@router.get("/acc_model/{acc_model_id}", response_model=List[schemas.ComponentRead])
def read_components_by_acc_model(acc_model_id: int, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retreive a list of all Components by acc_model_id
    """
    logging.info(f"Reading components by acc_model_id: {acc_model_id}")
    components = crud.get_components_by_acc_model(db, acc_model_id=acc_model_id, limit=limit)
    return components


@router.get("/id/{component_id}", response_model=schemas.ComponentRead)
def read_component(component_id: int, db: Session = Depends(get_db)):
    """
    Retreive a Component by its ID.
    """
    logging.info(f"Received request to fetch component with ID: {component_id}")
    component = crud.get_component(db, component_id=component_id)
    if component is None:
        logging.error(f"Component with ID: {component_id} not found")
        raise HTTPException(status_code=404, detail="Component not found")
    logging.info(f"Returning component details: {component}")
    return component

@router.put("/id/{component_id}", response_model=schemas.ComponentRead)
def update_component(component_id: int, component: schemas.ComponentCreate, db: Session = Depends(get_db)):
    """
    Update an existing Component.
    """
    existing_component = crud.get_component(db, component_id=component_id)
    if existing_component is None:
        raise HTTPException(status_code=404, detail="Component not found")

    existing_component_by_name = crud.get_component_by_name_and_acc_model_id(db, name=component.name, acc_model_id=component.acc_model_id)
    if existing_component_by_name and existing_component_by_name.id != component_id:
        raise HTTPException(status_code=400, detail="Component name already in use")

    updated_component = crud.update_component(db, component_id=component_id, component=component)
    return updated_component

@router.delete("/{component_id}", response_model=schemas.ComponentRead)
def delete_component(component_id: int, db: Session = Depends(get_db)): 
    """
    Delete an existing Component.
    """
    existing_component = crud.get_component(db, component_id=component_id)
    if existing_component is None:
        raise HTTPException(status_code=404, detail="Component not found")
    deleted_component = crud.delete_component(db, component_id=component_id)
    return deleted_component