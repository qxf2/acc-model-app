"""
This module contains the CRUD (Create, Read, Update, Delete) operations related to ratings table.
"""

import logging
from datetime import datetime
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy.sql import func, and_
from fastapi import HTTPException
from app import schemas, models

logger = logging.getLogger(__name__)


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

    # Log the same entry into RatingHistory
    rating_history = models.RatingHistory(
        rating=db_rating.rating,
        comments=db_rating.comments,
        user_id=db_rating.user_id,
        capability_assessment_id=db_rating.capability_assessment_id,
        change_timestamp=db_rating.timestamp,
    )

    db_session.add(rating_history)

    db_session.commit()
    db_session.refresh(db_rating)
    return db_rating


def get_rating_by_user_and_assessment(
    db_session: Session, user_id: int, capability_assessment_id: int
):
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


def update_rating(
    db_session: Session, db_rating: models.Rating, rating: schemas.RatingCreate
):
    """
    Update an existing Rating, and insert the old Rating into the RatingHistory table.

    Args:
        db (Session): The database session to use for the update.
        db_rating (models.Rating): The existing Rating to update.
        rating (schemas.RatingCreate): The new Rating data to apply to the existing Rating.

    Returns:
        models.Rating: The updated Rating.
    """

    rating_history = models.RatingHistory(
        rating=db_rating.rating,
        comments=db_rating.comments,
        user_id=db_rating.user_id,
        capability_assessment_id=db_rating.capability_assessment_id,
        change_timestamp=db_rating.timestamp,
    )
    db_session.add(rating_history)

    if rating.rating is not None:
        db_rating.rating = rating.rating
    if rating.comments is not None:
        db_rating.comments = rating.comments
    if rating.timestamp is not None:
        db_rating.timestamp = rating.timestamp

    db_session.commit()
    db_session.refresh(db_rating)
    return db_rating


def get_ratings_for_capability_assessment(
    db_session: Session, capability_assessment_id: int
) -> List[schemas.RatingRead]:
    """
    Retrieve all ratings for a specific capability assessment.

    Args:
        db_session (Session): The database session to use for the query.
        capability_assessment_id (int): The ID of the capability assessment to fetch ratings for.

    Returns:
        List[schemas.RatingRead]: A list of RatingRead schemas.
    """
    try:
        ratings = (
            db_session.query(models.Rating)
            .filter(models.Rating.capability_assessment_id == capability_assessment_id)
            .all()
        )

        if not ratings:
            return []

        return [schemas.RatingRead.model_validate(rating) for rating in ratings]
    except Exception as error:
        logger.exception(
            "Error retreiving ratings for capability assessment ID %d: %s",
            capability_assessment_id,
            error,
        )
        raise HTTPException(status_code=500, detail="Internal Server Error") from error


def get_ratings_for_user_and_capability(
    db_session: Session, user_id: int, capability_id: int
):
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
    db_session: Session, user_id: int, capability_assessment_id: int
):
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


def get_ratings_for_user_and_capability_assessments(
    db_session: Session, user_id: int, capability_assessment_ids: List[int]
):
    """
    Retrieves all ratings for a specific user across multiple capability assessments.

    Args:
        db (Session): The database session.
        user_id (int): The ID of the user.
        capability_assessment_ids (List[int]): List of capability assessment IDs.

    Returns:
        List[Rating]: A list of ratings for the given user and capability assessments.
    """
    return (
        db_session.query(models.Rating)
        .filter(
            models.Rating.user_id == user_id,
            models.Rating.capability_assessment_id.in_(capability_assessment_ids),
        )
        .all()
    )


def get_all_ratings_for_user(db_session: Session, user_id: int) -> List[models.Rating]:
    """
    Retrieves all ratings for a specific user across all capabilities.

    Args:
        db (Session): The database session.
        user_id (int): The ID of the user.

    Returns:
        List[models.Rating]: A list of ratings provided by the given user.
    """

    user_ratings = (
        db_session.query(models.Rating).filter(models.Rating.user_id == user_id).all()
    )

    return user_ratings

def get_ratings_history_for_date(
    db_session: Session, capability_assessment_ids: List[int], target_date: datetime
):
    """
    Retrieves the latest rating history for each user for a
    specific date and a list of capability assessments.

    Args:
        db_session (Session): The database session.
        capability_assessment_ids (List[int]): List of capability assessment IDs.
        target_date (datetime): The date for which to fetch the rating history.

    Returns:
        List[RatingHistory]: A list of the latest rating history entries for the given date.
    """
    subquery = (
        db_session.query(
            models.RatingHistory.user_id,
            models.RatingHistory.capability_assessment_id,
            func.max(models.RatingHistory.change_timestamp).label('latest_change_timestamp')
        )
        .filter(
            models.RatingHistory.capability_assessment_id.in_(capability_assessment_ids),
            func.date(models.RatingHistory.change_timestamp) == target_date.date()
        )
        .group_by(models.RatingHistory.user_id, models.RatingHistory.capability_assessment_id)
        .subquery()
    )

    # Fetch the full rows that match the subquery's user_id, cap_assess_id, and latest timestamp
    return (
        db_session.query(models.RatingHistory)
        .join(
            subquery,
            and_(
                models.RatingHistory.user_id == subquery.c.user_id,
                models.RatingHistory.capability_assessment_id == subquery.c.capability_assessment_id,
                models.RatingHistory.change_timestamp == subquery.c.latest_change_timestamp
            )
        )
        .all()
    )
