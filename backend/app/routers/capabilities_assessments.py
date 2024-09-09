""""
This module defines the API endpoints related to capability assessments.

The endpoints are:
- `POST /capability-assessments/{capability_assessment_id}/`:
        Creates or updates a rating for a capability assessment.
- `GET /capability-assessments`:
        Retrieves a capability assessment for a specific capability and attribute.
- `GET /capability-assessments/{capability_assessment_id}/`:
        Retrieves all ratings associated with a specific capability assessment.
- `GET /capability-assessments/{capability_assessment_id}/user/{user_id}/`:
        Retrieves all ratings associated with a capability assessment associated provided by a user.

The endpoints use the `get_db` dependency to get a database session.
The endpoints use the `crud` module to perform the database operations.
"""
import logging
from datetime import datetime
from typing import List, Dict, Union
from statistics import mean
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas
from app.crud import capabilities as crud
from app.crud import ratings as rating_crud
from app.database import get_db
from app.routers.security import get_current_user
from app.routers.ratings import RATING_MAPPING

router = APIRouter(
    prefix="/capability-assessments",
    tags=["capability-assessments"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger(__name__)

@router.post("/{capability_assessment_id}/", response_model=schemas.RatingRead)
def upsert_capability_assessment_rating(
        capability_assessment_id: int,
        rating: schemas.RatingCreate,
        db_session: Session = Depends(get_db),
        current_user: schemas.UserRead = Depends(get_current_user)
):
    """
    Creates or updates a rating for a capability assessment.

    Args:
        capability_assessment_id: The ID of the capability assessment.
        rating: The rating to create or update.
        db_session: The database session.
        current_user: The current user. Depends(get_current_user).

    Returns:
        The created or updated rating.
    """

    try:
        logger.info("Received capability_assessment_id: %s from user: %s",
                    capability_assessment_id, current_user.username)

        existing_capability_assessment = crud.get_capability_assessment(
            db_session, capability_assessment_id=capability_assessment_id)
        if existing_capability_assessment is None:
            logger.error("Capability Assessment with ID %s not found",
                         capability_assessment_id)
            raise HTTPException(
                status_code=404, detail="Capability Assessment not found")

        existing_rating = crud.get_rating_by_user_and_assessment(
            db_session, user_id=current_user.id, capability_assessment_id=capability_assessment_id)

        if existing_rating:
            updated_rating = rating_crud.update_rating(
                db_session=db_session, db_rating=existing_rating, rating=rating)
            logger.info("Updated Rating for capability assessment: %s",
                        capability_assessment_id)
            return updated_rating

        new_rating = rating_crud.create_rating(
            db_session=db_session, rating=rating, user_id=current_user.id)
        logger.info("Created New Rating for capability assessment: %s",
                    capability_assessment_id)
        return new_rating
    except HTTPException as http_error:
        logger.error("Client error: %s", http_error.detail)
        raise http_error
    except Exception as error:
        logger.exception("Error creating or updating rating: %s", error)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while creating or updating the rating")

@router.put("/ratings/{rating_id}/", response_model=schemas.RatingRead)
def update_rating(
        rating_id: int,
        rating_update: schemas.RatingUpdate,
        db_session: Session = Depends(get_db),
        current_user: schemas.UserRead = Depends(get_current_user)
):
    """
    Updates an existing rating, including comments.

    Args:
        rating_id: The ID of the rating to update.
        rating_update: The updated rating data, including comments.
        db_session: The database session.
        current_user: The current user.

    Returns:
        The updated rating.
    """
    try:
        logger.info("Received rating_id: %s from user: %s", rating_id, current_user.username)

        existing_rating = rating_crud.get_rating(db_session, rating_id=rating_id)
        if existing_rating is None:
            logger.error("Rating with ID %s not found", rating_id)
            raise HTTPException(status_code=404, detail="Rating not found")

        if rating_update.comments is not None:
            existing_rating.comments = rating_update.comments
        existing_rating.timestamp = rating_update.timestamp or datetime.now()

        db_session.commit()
        db_session.refresh(existing_rating)

        logger.info("Updated Rating with ID: %s", rating_id)
        return existing_rating

    except HTTPException as http_error:
        logger.error("Client error: %s", http_error.detail)
        raise http_error
    except Exception as error:
        logger.exception("Error updating rating: %s", error)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while updating the rating"
        )


@router.get("/", response_model=schemas.CapabilityAssessmentRead)
def get_capability_assessment(
                capability_id: int,
                attribute_id: int,
                db_session: Session = Depends(get_db)
):
    """
    Retrieves a capability assessment for a specific capability and attribute.

    Args:
        capability_id: The ID of the capability.
        attribute_id: The ID of the attribute.
        db_session: The database session. Defaults to Depends(get_db).

    Returns:
        The retrieved capability assessment.
    """
    try:
        capability_assessment = crud.get_capability_assessment_by_capability_and_attribute(
            db_session=db_session,
            capability_id=capability_id,
            attribute_id=attribute_id
        )

        if not capability_assessment:
            logger.error(
                "Capability Assessment not found for capability ID %s and attribute ID %s",
                capability_id, attribute_id)
            raise HTTPException(
                status_code=404, detail="Capability Assessment not found")

        logger.info("Retrieved Capability Assessment: %s",
                    capability_assessment)
        return capability_assessment
    except Exception as error:
        logger.exception("Error retrieving capability assessment: %s", error)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while retrieving the capability assessment")


@router.get("/{capability_assessment_id}/", response_model=List[schemas.RatingRead])
def get_ratings_for_capability_assessment(
                capability_assessment_id: int,
                db_session: Session = Depends(get_db)
):
    """
    Retrieves all ratings associated with a specific capability assessment.

    Args:
        capability_assessment_id: The ID of the capability assessment.
        db_session: The database session.

    Returns:
        A list of ratings associated with the capability assessment.
    """

    try:
        capability_assessment = crud.get_capability_assessment(
            db_session, capability_assessment_id)
        if not capability_assessment:
            logger.error("Capability Assessment with ID %s not found",
                         capability_assessment_id)
            raise HTTPException(
                status_code=404, detail="Capability Assessment not found")

        ratings = rating_crud.get_ratings_for_capability_assessment(
            db_session, capability_assessment_id)

        if not ratings:
            logger.warning(
                "No ratings found for capability assessment ID %s", capability_assessment_id)
            return []

        logger.info("Retrieved %s ratings for capability assessment ID %s", len(
            ratings), capability_assessment_id)
        return ratings

    except HTTPException as http_ex:
        raise http_ex
    except Exception as error:
        logger.exception(
            "Error retrieving ratings for capability assessment: %s", error)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.get("/{capability_assessment_id}/user/{user_id}/", response_model=List[schemas.RatingRead])
def get_ratings_for_capability_assessment_by_user(
                capability_assessment_id: int,
                user_id: int,
                db_session: Session = Depends(get_db)
):
    """
    Retrieves all ratings associated for a capability assessment associated provided by a user.

    Args:
        capability_assessment_id: The ID of the capability assessment.
        user_id: The ID of the user.
        db_session: The database session.

    Returns:
        A list of ratings associated with the user and capability assessment.
    """
    try:
        user_ratings = rating_crud.get_ratings_for_user_and_capability_assessment(
            db_session=db_session,
            user_id=user_id,
            capability_assessment_id=capability_assessment_id
        )

        logger.info("Retrieved %s ratings for user ID %s and capability assessment ID %s", len(
            user_ratings), user_id, capability_assessment_id)
        return user_ratings or []

    except Exception as error:
        logger.exception(
            "Error retrieving ratings for user and capability assessment: %s", error)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/{capability_assessment_id}/aggregate", response_model=Dict[str, Union[int, float]])
def get_ratings_aggregate_for_capability_assessment(
                capability_assessment_id: int,
                db_session: Session = Depends(get_db)
):
    """
    Retrieves aggregated ratings for a specific capability assessment.

    Args:
        capability_assessment_id: The ID of the capability assessment.
        db_session: The database session.

    Returns:
        A dictionary with the capability assessment ID and the average rating,
        or None if no ratings are found.
    """
    try:
        ratings = rating_crud.get_ratings_for_capability_assessment(
            db_session,
            capability_assessment_id
        )
        if not ratings:
            return {
                "capability_assessment_id": capability_assessment_id,
                "average_rating": None
            }

        numeric_ratings = [RATING_MAPPING.get(rating.rating, 0) for rating in ratings]
        print(numeric_ratings)

        if not numeric_ratings:
            return {
                "capability_assessment_id": capability_assessment_id,
                "average_rating": None
            }
        average_rating = mean(numeric_ratings)
        aggregated_rating = {
            "capability_assessment_id": capability_assessment_id,
            "average_rating": average_rating
        }

        return aggregated_rating
    except Exception as error:
        logger.exception(
            "Error retrieving aggregated ratings for capability assessment: %s", error
        )
        raise HTTPException(status_code=500, detail="Internal Server Error")
