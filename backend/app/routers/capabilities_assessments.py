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
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas
from app.crud import capabilities as crud
from app.crud import ratings as rating_crud
from app.database import get_db
from app.routers.security import get_current_user

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
        logger.info("Received capability_assessment_id: %s from user ID: %s",
                    capability_assessment_id, current_user.id)

        existing_capability_assessment = crud.get_capability_assessment(
            db_session, capability_assessment_id=capability_assessment_id)
        if existing_capability_assessment is None:
            logger.error("Capability Assessment with ID %s not found",
                         capability_assessment_id)
            raise HTTPException(
                status_code=404, detail="Capability Assessment not found")

        existing_rating = crud.get_rating_by_user_and_assessment(
            db_session, user_id=current_user.id, capability_assessment_id=capability_assessment_id)
        logger.debug("Existing Rating: %s", existing_rating)

        if existing_rating:
            updated_rating = rating_crud.update_rating(
                db_session=db_session, db_rating=existing_rating, rating=rating)
            logger.info("Updated Rating: %s", updated_rating)
            return updated_rating

        new_rating = rating_crud.create_rating(
            db_session=db_session, rating=rating, user_id=current_user.id)
        logger.info("Created New Rating: %s", new_rating)
        return new_rating

    except Exception as error:
        logger.exception("Error creating or updating rating: %s", error)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while creating or updating the rating")


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
            raise HTTPException(
                status_code=404, detail="No ratings found for this capability assessment")

        logger.info("Retrieved %s ratings for capability assessment ID %s", len(
            ratings), capability_assessment_id)
        return ratings
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

        if not user_ratings:
            logger.warning("No ratings found for user ID %s and capability assessment ID %s",
                           user_id, capability_assessment_id)
            raise HTTPException(
                status_code=404, detail="No ratings found for this user and capability assessment")

        logger.info("Retrieved %s ratings for user ID %s and capability assessment ID %s", len(
            user_ratings), user_id, capability_assessment_id)
        return user_ratings
    except Exception as error:
        logger.exception(
            "Error retrieving ratings for user and capability assessment: %s", error)
        raise HTTPException(status_code=500, detail="Internal Server Error")
