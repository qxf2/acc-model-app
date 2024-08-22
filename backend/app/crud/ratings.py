"""
This module contains the CRUD (Create, Read, Update, Delete) operations related to ratings table.
"""
from datetime import datetime
from typing import List
from sqlalchemy.orm import Session
from app import schemas, models


def create_rating(db_session: Session, rating: schemas.RatingCreate, user_id: int):
    """
    Creates a new rating in the database.

    Args:
        db (Session): The database session.
        rating (schemas.RatingCreate): The rating to be created.
        user_id (int): The ID of the user creating the rating.

    Returns:
        models.Rating: The newly created rating.
    """

    db_rating = models.Rating(
        rating=rating.rating,
        user_id=user_id,
        capability_assessment_id=rating.capability_assessment_id,
        comments=rating.comments,
        timestamp=rating.timestamp or datetime.now(),
    )
    db_session.add(db_rating)
    db_session.commit()
    db_session.refresh(db_rating)
    return db_rating


def get_rating_by_user_and_assessment(
                db_session: Session, user_id: int, capability_assessment_id: int):
    """
    Retrieves the rating provided by user for a capability assessment.

    Args:
        db (Session): The database session.
        user_id (int): The ID of the user.
        capability_assessment_id (int): The ID of the capability assessment.

    Returns:
        models.Rating: The rating associated with the user and capability assessment,
        or None if not found.
    """

    return (
        db_session.query(models.Rating)
        .filter_by(user_id=user_id, capability_assessment_id=capability_assessment_id)
        .first()
    )

def get_rating(db_session: Session, rating_id: int):
    """
    Retrieve a Rating by its ID.

    Args:
        db (Session): The database session.
        rating_id (int): The ID of the Rating to retrieve.

    Returns:
        models.Rating: The Rating corresponding to the provided ID, or None if not found.
    """

    return db_session.query(models.Rating).filter(models.Rating.id == rating_id).first()


def delete_rating(db_session: Session, rating_id: int):
    """
    Delete an existing Rating.

    Args:
        db (Session): The database session to use for the deletion.
        rating_id (int): The ID of the Rating to delete.

    Returns:
        models.Rating: The deleted Rating, or None if it did not exist.
    """

    db_rating = get_rating(db_session, rating_id=rating_id)
    if db_rating:
        db_session.delete(db_rating)
        db_session.commit()
    return db_rating


def update_rating(db_session: Session, db_rating: models.Rating, rating: schemas.RatingCreate):
    """
    Update an existing Rating.

    Args:
        db (Session): The database session to use for the update.
        db_rating (models.Rating): The existing Rating to update.
        rating (schemas.RatingCreate): The new Rating data to apply to the existing Rating.

    Returns:
        models.Rating: The updated Rating.
    """
    db_rating.rating = rating.rating
    db_rating.comments = rating.comments
    db_rating.timestamp = rating.timestamp or datetime.now()

    db_session.commit()
    db_session.refresh(db_rating)
    return db_rating

def get_ratings_for_capability_assessment(
                db_session: Session,
                capability_assessment_id: int
) -> List[schemas.RatingRead]:
    """
    Retrieve all ratings for a specific capability assessment.

    Args:
        db_session (Session): The database session to use for the query.
        capability_assessment_id (int): The ID of the capability assessment to fetch ratings for.

    Returns:
        List[schemas.RatingRead]: A list of RatingRead schemas.
    """
    ratings = (
        db_session.query(models.Rating)
        .filter(models.Rating.capability_assessment_id == capability_assessment_id)
        .all()
    )

    return [schemas.RatingRead.model_validate(rating) for rating in ratings]

def get_ratings_for_user_and_capability(db_session: Session, user_id: int, capability_id: int):
    """
    Retrieves all ratings provided by a user for a given capability.

    Args:
        db (Session): The database session.
        user_id (int): The ID of the user.
        capability_id (int): The ID of the capability.

    Returns:
        List[Rating]: A list of ratings for the given user and capability.
    """
    # Fetch the capability assessments related to this capability
    capability_assessments = (
        db_session.query(models.CapabilityAssessment)
        .filter_by(capability_id=capability_id)
        .all()
    )

    if not capability_assessments:
        return []

    # Collect ratings for these assessments that belong to the user
    user_ratings = (
        db_session.query(models.Rating)
        .filter(
            models.Rating.capability_assessment_id.in_(
                [assessment.id for assessment in capability_assessments]
            ),
            models.Rating.user_id == user_id,
        )
        .all()
    )

    return user_ratings


def get_ratings_for_user_and_capability_assessment(
                db_session: Session, user_id: int, capability_assessment_id: int):
    """
    Retrieves the ratings by a user for a capability assessment.

    Args:
        db (Session): The database session.
        user_id (int): The ID of the user.
        capability_assessment_id (int): The ID of the capability assessment.

    Returns:

        List[Rating]: A list of ratings for the given user and capability assessment.
    """
    user_ratings = (
        db_session.query(models.Rating)
        .filter(
            models.Rating.capability_assessment_id == capability_assessment_id,
            models.Rating.user_id == user_id,
        )
        .all()
    )

    return user_ratings

def get_all_ratings_for_user(db_session: Session, user_id: int) -> List[models.Rating]:
    """
    Retrieves all ratings for a specific user across all capabilities.

    Args:
        db (Session): The database session.
        user_id (int): The ID of the user.

    Returns:
        List[models.Rating]: A list of ratings provided by the given user.
    """

    user_ratings = db_session.query(models.Rating).filter(
        models.Rating.user_id == user_id
    ).all()

    return user_ratings
