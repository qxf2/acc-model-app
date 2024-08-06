"""
This module defines the API endpoints related to acc_models.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas
from app.crud import acc_models as crud
from app.database import get_db

router = APIRouter(
    prefix="/acc-models",
    tags=["acc_models"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.ACCModelRead)
def create_acc_model(acc_model: schemas.ACCModelCreate, db: Session = Depends(get_db)):
    """
    Create a new ACCModel.
    """
    existing_acc_model = crud.get_acc_model_by_name(db, name=acc_model.name)
    if existing_acc_model:
        raise HTTPException(status_code=400, detail="ACC model with this name already exists")
    new_model = crud.create_acc_model(db=db, acc_model=acc_model)
    return new_model


@router.get("/", response_model=List[schemas.ACCModelRead])
def read_acc_models(limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve a list of ACC models.
    """
    acc_models = crud.get_acc_models(db, limit=limit)
    return acc_models


@router.get("/{acc_model_id}", response_model=schemas.ACCModelRead)
def read_acc_model(acc_model_id: int, db: Session = Depends(get_db)):
    """
    Retrieve an ACC model by its ID.
    """
    acc_model = crud.get_acc_model(db, acc_model_id=acc_model_id)
    if acc_model is None:
        raise HTTPException(status_code=404, detail="ACC model not found")
    return acc_model

@router.put("/{acc_model_id}", response_model=schemas.ACCModelRead)
def update_acc_model(acc_model_id: int, acc_model: schemas.ACCModelCreate, db: Session = Depends(get_db)):
    """
    Update an existing ACC model.
    """
    existing_acc_model = crud.get_acc_model(db, acc_model_id=acc_model_id)
    if existing_acc_model is None:
        raise HTTPException(status_code=404, detail="ACC model not found")

    existing_acc_model_by_name = crud.get_acc_model_by_name(db, name=acc_model.name)
    if existing_acc_model_by_name and existing_acc_model_by_name.id != acc_model_id:
        raise HTTPException(status_code=400, detail="ACC model name already in use")

    updated_acc_model = crud.update_acc_model(db, acc_model_id=acc_model_id, acc_model=acc_model)
    return updated_acc_model


@router.delete("/{acc_model_id}", response_model=schemas.ACCModelRead)
def delete_acc_model(acc_model_id: int, db: Session = Depends(get_db)):
    """
    Delete an existing ACC model.
    """
    existing_acc_model = crud.get_acc_model(db, acc_model_id=acc_model_id)
    if existing_acc_model is None:
        raise HTTPException(status_code=404, detail="ACC model not found")
    deleted_acc_model = crud.delete_acc_model(db, acc_model_id=acc_model_id)
    return deleted_acc_model