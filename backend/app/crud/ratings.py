"""
This module contains the CRUD (Create, Read, Update, Delete) operations for interacting with the database models.
"""
from datetime import datetime
import logging
from sqlalchemy.orm import Session
from app import schemas, models

def create_rating(db: Session, rating: schemas.RatingCreate, user_id: int):
    db_rating = models.Rating(
        rating=rating.rating_value,
        user_id=user_id,
        capability_id=rating.capability_id,
        timestamp=rating.timestamp or datetime.now()
    )
    db.add(db_rating)
    db.commit()
    db.refresh(db_rating)
    return db_rating

def get_rating(db: Session, rating_id: int):
    return db.query(models.Rating).filter(models.Rating.id == rating_id).first()

def get_ratings_for_capability(db: Session, capability_id: int):
    return db.query(models.Rating).filter(models.Rating.capability_id == capability_id).all()

def delete_rating(db: Session, rating_id: int):
    db_rating = get_rating(db, rating_id=rating_id)
    if db_rating:
        db.delete(db_rating)
        db.commit()
    return db_rating

def update_rating(db: Session, rating_id: int, rating_update: schemas.RatingCreate):
    rating = get_rating(db, rating_id=rating_id)
    if rating:
        rating.rating_value = rating_update.rating_value
        rating.comments = rating_update.comments
        rating.timestamp = rating_update.timestamp or datetime.now() 
        db.commit()
        db.refresh(rating)
    return rating
