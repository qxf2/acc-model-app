"""
This module contains the CRUD (Create, Read, Update, Delete) operations for interacting with the database models.
"""

from sqlalchemy.orm import Session
from app import schemas, models

def get_acc_model(db: Session, acc_model_id: int):
    """
    Retreive an ACCModel by its ID.
    """
    return db.query(models.ACCModel).filter(models.ACCModel.id == acc_model_id).first()


def get_acc_model_by_name(db: Session, name: str):
    """
    Retreive an ACCModel by its name.
    """
    return db.query(models.ACCModel).filter(models.ACCModel.name == name).first()

def get_acc_models(db: Session, limit: int = 100):
    """
    Retreive a list of all ACCModels.
    """
    return db.query(models.ACCModel).limit(limit).all()


def create_acc_model(db: Session, acc_model: schemas.ACCModelCreate):
    """
    Create a new ACCModel.
    """
    db_acc_model = models.ACCModel(**acc_model.model_dump())
    db.add(db_acc_model)
    db.commit()
    db.refresh(db_acc_model)
    return db_acc_model

def update_acc_model(db: Session, acc_model_id: int, acc_model: schemas.ACCModelCreate):
    """
    Update an existing ACCModel.
    """
    db_acc_model = db.query(models.ACCModel).filter(models.ACCModel.id == acc_model_id).first()
    if db_acc_model:
        for key, value in acc_model.model_dump().items():
            setattr(db_acc_model, key, value)
        db.commit()
        db.refresh(db_acc_model)
    return db_acc_model

def delete_acc_model(db: Session, acc_model_id: int):
    """
    Delete an existing ACCModel.
    """
    db_acc_model = db.query(models.ACCModel).filter(models.ACCModel.id == acc_model_id).first()
    if db_acc_model:
        db.delete(db_acc_model)
        db.commit()
    return db_acc_model
