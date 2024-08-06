"""
This module contains the CRUD (Create, Read, Update, Delete) operations for interacting with the database models.
"""

from sqlalchemy.orm import Session
from app import schemas, models

def get_attribute(db: Session, attribute_id: int):
    """
    Retreive an Attribute by its ID.
    """
    return db.query(models.Attribute).filter(models.Attribute.id == attribute_id).first()

def get_attributes(db: Session, limit: int = 100):
    """
    Retreive a list of all Attributes.
    """
    return db.query(models.Attribute).limit(limit).all()

def get_attribute_by_name(db: Session, name: str):
    """
    Retreive an Attribute by its name.
    """
    return db.query(models.Attribute).filter(models.Attribute.name == name).first()

def create_attribute(db: Session, attribute: schemas.AttributeCreate):
    """
    Create a new Attribute.
    """
    db_attribute = models.Attribute(**attribute.model_dump())
    db.add(db_attribute)
    db.commit()
    db.refresh(db_attribute)
    return db_attribute


def update_attribute(db: Session, attribute_id: int, attribute: schemas.AttributeCreate):
    """
    Update an existing attribute.
    """
    db_attribute = db.query(models.Attribute).filter(models.Attribute.id == attribute_id).first()
    if db_attribute:
        for key, value in attribute.model_dump().items():
            setattr(db_attribute, key, value)
        db.commit()
        db.refresh(db_attribute)
    return db_attribute

def delete_attribute(db: Session, attribute_id: int):
    """
    Delete an existing attribute.
    """
    db_attribute = db.query(models.Attribute).filter(models.Attribute.id == attribute_id).first()
    if db_attribute:
        db.delete(db_attribute)
        db.commit()
    return db_attribute