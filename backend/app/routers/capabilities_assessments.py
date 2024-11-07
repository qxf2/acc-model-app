""""
This module defines the API endpoints related to capability assessments.

The endpoints are:
- POST /capability-assessments/batch/:
    Creates or updates ratings for capability assessments in batch.
- POST /capability-assessments/bulk/ids: 
    Retrieves capability assessment IDs for the given capability IDs and attribute IDs.
- POST /capability-assessments/{capability_assessment_id}/:
    Creates or updates a rating for a specific capability assessment.
- PUT /capability-assessments/ratings/{rating_id}/:
    Updates an existing rating, including comments.
- GET /capability-assessments:
    Retrieves a capability assessment for a specific capability and attribute.
- GET /capability-assessments/{capability_assessment_id}/:
   - Retrieves all ratings associated with a specific capability assessment.
- GET /capability-assessments/{capability_assessment_id}/user/{user_id}/:
   - Retrieves all ratings for a capability assessment provided by a specific user.
- GET /capability-assessments/{capability_assessment_id}/aggregate:
   - Retrieves aggregated ratings for a specific capability assessment.
- POST /capability-assessments/aggregates
   - Retrieves aggregated ratings for a list of capability assessments.
- POST /capability-assessments/ratings/batch/
   - Retrieves all ratings for multiple capability assessments provided by a user.

The endpoints use the `get_db` dependency to get a database session.
The endpoints use the `crud` module to perform the database operations.
"""
import logging
from datetime import datetime
from typing import List, Dict, Union, Any, Optional
from statistics import mean
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import DatabaseError
from app import schemas
from app.crud import capabilities as crud
from app.crud import ratings as rating_crud
from app.database import get_db
from app.routers.security import get_current_user
from app.crud.utils import get_full_capability_assessment_data
from app.routers.ratings import RATING_MAPPING

router = APIRouter(
    prefix="/capability-assessments",
    tags=["capability-assessments"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger(__name__)

# Define mappings
RATING_MAPPING = {
    "Stable": 4,
    "Acceptable": 3,
    "Low impact": 2,
    "Critical Concern": 1,
    "Not Applicable": 0
}

THRESHOLD_RATING_MAPPING = {
    "Stable": [3.5, 4],
    "Acceptable": [2.5, 3.49],
    "Low impact": [1.5, 2.49],
    "Critical Concern": [0, 1.49],
    "Not Applicable": [0, 0]
}

@router.post("/batch/", response_model=Dict[str, Union[List[schemas.RatingRead], Dict[str, str]]])
def upsert_capability_assessment_ratings(
        batch_request: schemas.BatchRatingRequest,
        db_session: Session = Depends(get_db),
        current_user: schemas.UserRead = Depends(get_current_user)
):
    """
    Creates or updates ratings for capability assessments in batch.
    """
    ids = [rating.capability_assessment_id for rating in batch_request.ratings]
    existing_assessments = {ca.id for ca in crud.get_capability_assessments_by_ids(db_session, ids)}

    logging.info("Existing assessments: %s", existing_assessments)

    valid_ratings = []
    errors = {}
    for rating in batch_request.ratings:
        if rating.capability_assessment_id not in existing_assessments:
            errors[rating.capability_assessment_id] = "Capability Assessment not found"
            continue

        existing_rating = crud.get_rating_by_user_and_assessment(
            db_session, user_id=current_user.id,
            capability_assessment_id=rating.capability_assessment_id
        )

        if existing_rating:
            updated_rating = rating_crud.update_rating(
                db_session=db_session, db_rating=existing_rating, rating=rating
            )
            valid_ratings.append(updated_rating)
        else:
            new_rating = rating_crud.create_rating(
                db_session=db_session, rating=rating, user_id=current_user.id
            )
            valid_ratings.append(new_rating)

    response = {
        "ratings": valid_ratings,
        "errors": errors if errors else None
    }
    return response

@router.post("/bulk/ids", response_model=List[schemas.CapabilityAssessmentId])
def get_bulk_capability_assessment_ids(
            request: schemas.CapabilityAssessmentBulkRequest,
            db_session: Session = Depends(get_db)
):
    """
    Retrieves capability assessment IDs for the given capability IDs and attribute IDs.

    Args:
        request: A request object containing capability IDs and attribute IDs.
        db_session: The database session. Defaults to Depends(get_db).

    Returns:
        A list of capability assessment IDs.
    """
    try:
        assessment_ids = crud.get_bulk_capability_assessments(
            db_session=db_session,
            capability_ids=request.capability_ids,
            attribute_ids=request.attribute_ids
        )

        if not assessment_ids:
            raise HTTPException(
                status_code=404,
                detail="No capability assessments found for the provided IDs"
            )
        return assessment_ids

    except Exception as error:
        logger.exception("Error retrieving capability assessment IDs: %s", error)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while retrieving capability assessment IDs"
        ) from error


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
            detail="An unexpected error occurred") from error

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
        ) from error


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
            detail="An unexpected error occurred") from error


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
        raise HTTPException(status_code=500, detail="Internal Server Error") from error


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
        raise HTTPException(status_code=500, detail="Internal Server Error") from error

@router.get("/{capability_assessment_id}/aggregate",
            response_model=Dict[str, Union[int, float, None]])
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
        logger.info("Rating for the capability assessemnt %s", ratings)
        if not ratings:
            logger.info("No ratings found for capability assessment")
            return {
                "capability_assessment_id": capability_assessment_id,
                "average_rating": None
            }

        numeric_ratings = [
            mapped_rating for rating in ratings
            if (
                mapped_rating := RATING_MAPPING.get(rating.rating)
                ) is not None and mapped_rating > 0
        ]

        if not numeric_ratings:
            logger.info("No numeric ratings to calculate average")
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

    except ValueError as error:
        logger.exception("Data validation error: %s", error)
        raise HTTPException(status_code=400, detail="Data Validation Error") from error
    except Exception as error:
        logger.exception(
            "Unexpected error retrieving aggregated ratings for capability assessment: %s", error
        )
        raise HTTPException(status_code=500, detail="Internal Server Error") from error


@router.post("/aggregates", response_model=List[Dict[str, Union[int, float, str, None]]])
def get_bulk_ratings_aggregate(
            capability_assessment_ids: List[int],
            db_session: Session = Depends(get_db)
):
    """
    Retrieves aggregated ratings for a list of capability assessments.

    Args:
        capability_assessment_ids: List of capability assessment IDs.
        db_session: The database session.

    Returns:
        A list of dictionaries with the capability assessment ID and the average rating.
    """
    logger.info("Received capability_assessment_ids: %s", capability_assessment_ids)
    try:
        results = []
        for capability_assessment_id in capability_assessment_ids:
            ratings = rating_crud.get_ratings_for_capability_assessment(
                db_session, capability_assessment_id
            )
            if not ratings:
                results.append({
                    "capability_assessment_id": capability_assessment_id,
                    "average_rating": None
                })
                continue

            numeric_ratings = [
                mapped_rating for rating in ratings
                if (
                    mapped_rating := RATING_MAPPING.get(rating.rating)
                    ) is not None and mapped_rating > 0
            ]

            average_rating = mean(numeric_ratings) if numeric_ratings else None

            rating_label = None
            if average_rating is not None:
                for label, (min_val, max_val) in THRESHOLD_RATING_MAPPING.items():
                    if min_val <= average_rating <= max_val:
                        rating_label = label
                        break

            results.append({
                "capability_assessment_id": capability_assessment_id,
                "average_rating": average_rating,
                "rating_label": rating_label
            })

        return results

    except Exception as error:
        logger.exception("Error retrieving bulk ratings: %s", error)
        raise HTTPException(status_code=500, detail="Internal Server Error") from error


@router.post("/ratings/batch/", response_model=List[schemas.RatingRead])
def get_ratings_for_capability_assessments_by_user(
                user_id: int,
                capability_assessment_ids: List[int],
                db_session: Session = Depends(get_db)
):
    """
    Retrieves all ratings associated for multiple capability assessments provided by a user.

    Args:
        user_id: The ID of the user.
        capability_assessment_ids: List of capability assessment IDs.
        db_session: The database session.

    Returns:
        A list of ratings associated with the user and capability assessments.
    """
    try:
        user_ratings = rating_crud.get_ratings_for_user_and_capability_assessments(
            db_session=db_session,
            user_id=user_id,
            capability_assessment_ids=capability_assessment_ids
        )

        logger.info("Retrieved ratings for user ID %s and capability assessments IDs %s",
                    user_id, capability_assessment_ids)
        logger.info("The ratings are %s \n", user_ratings)
        return user_ratings or []

    except Exception as error:
        logger.exception(
            "Error retrieving ratings for user and capability assessments: %s", error)
        raise HTTPException(status_code=500, detail="Internal Server Error") from error

@router.post("/historical-ratings", response_model=List[schemas.RatingHistoryRead])
def get_historical_ratings(
    capability_assessment_ids: List[int],
    target_date: datetime,
    db_session: Session = Depends(get_db)
) -> List[schemas.RatingHistoryRead]:
    """
    Retrieves historical ratings for a list of capability assessments
    for a given date.

    Args:
        capability_assessment_ids (List[int]): List of capability assessment IDs.
        target_date (datetime): The date for which to retrieve historical ratings.
        db_session (Session): The database session.

    Returns:
        Filtered historical rating data matching the target date.
    """
    logger.info("Fetching historical ratings for target date: %s", target_date)

    try:
        historical_ratings = rating_crud.get_ratings_history_for_date(
            db_session, capability_assessment_ids, target_date
        )

        return historical_ratings

    except ValueError as ve:
        logger.exception("Value error while retrieving historical ratings: %s", ve)
        raise HTTPException(status_code=400, detail="Invalid input value") from ve
    except DatabaseError as db_error:
        logger.exception("Database error while retrieving historical ratings: %s", db_error)
        raise HTTPException(status_code=500, detail="Database error occurred") from db_error
    except Exception as error:
        logger.exception("Error retrieving ratings: %s", error)
        raise HTTPException(status_code=500, detail="Internal Server Error") from error


def get_ratings_for_target_date(
    db_session: Session,
    capability_assessment_ids: List[int],
    target_date: datetime
) -> List[schemas.RatingRead]:
    """
    Retrieves ratings for capability assessments based on the target date.

    Args:
        db_session (Session): The database session.
        capability_assessment_ids (List[int]): List of capability assessment IDs.
        target_date (datetime): The date for which to fetch ratings.

    Returns:
        List[schemas.RatingRead]: List of rating entries.
    """
    try:
        ratings_data = rating_crud.get_ratings_history_for_date(
                    db_session,
                    capability_assessment_ids,
                    target_date
                )

        if not ratings_data:
            logger.info("No ratings found for the provided date.")

        return ratings_data or []

    except DatabaseError as db_error:
        logger.exception("Database error while fetching ratings for target date %s: %s",
                        target_date, db_error)
        raise HTTPException(status_code=500, detail="Database error occurred") from db_error
    except Exception as error:
        logger.exception("Error fetching ratings for target date %s: %s", target_date, error)
        raise HTTPException(status_code=500,
                            detail="Error fetching ratings for target date") from error


def get_historical_ratings_aggregate(
        db_session: Session,
        capability_assessment_ids: List[int],
        target_date: datetime,
) -> List[Dict[str, Any]]:
    """
    Fetches and aggregates historical ratings for a set of capability assessments on a target date.

    Args:
        db_session (Session): The database session.
        capability_assessment_ids (List[int]): List of capability assessment IDs.
        target_date (datetime): The date for which to fetch the ratings.

    Returns:
        List[Dict[str, Any]]: Aggregated rating data with detailed information.
    """
    try:
        ratings_data = get_ratings_for_target_date(
                    db_session,
                    capability_assessment_ids,
                    target_date
                )

        if not ratings_data:
            logger.info("No ratings found for the provided date.")

            return [
                {
                    "capability_assessment_id": cap_id,
                    "average_rating": None
                }
                for cap_id in capability_assessment_ids
            ]

        # Aggregate ratings
        ratings_by_assessment = {}
        for entry in ratings_data:
            cap_id = entry.capability_assessment_id
            rating_value = RATING_MAPPING.get(entry.rating)
            if rating_value is not None:
                ratings_by_assessment.setdefault(cap_id, []).append(rating_value)

        # Fetch detailed assessment data
        detailed_assessments = get_full_capability_assessment_data(
                    db_session,
                    capability_assessment_ids
                )
        detailed_assessment_map = {
                    item["capability_assessment_id"]: item
                    for item in detailed_assessments
                }

        # Helper to map average rating to a label
        def get_rating_label(average_rating: Optional[float]) -> Optional[str]:
            if average_rating is None:
                return None
            return next(
                (label for label, (min_val, max_val) in THRESHOLD_RATING_MAPPING.items()
                 if min_val <= average_rating <= max_val),
                None
            )

        # Populate results with aggregated data and detailed information
        results = []
        for cap_id in capability_assessment_ids:
            ratings = ratings_by_assessment.get(cap_id, [])
            average_rating = mean(ratings) if ratings else None
            rating_label = get_rating_label(average_rating)
            detailed_info = detailed_assessment_map.get(cap_id, {})

            results.append({
                "capability_assessment_id": cap_id,
                "average_rating": average_rating,
                "rating_label": rating_label,
                "capability_name": detailed_info.get("capability_name"),
                "attribute_name": detailed_info.get("attribute_name"),
                "component_name": detailed_info.get("component_name"),
                "acc_model_name": detailed_info.get("acc_model_name"),
            })

        return results

    except KeyError as key_error:
        logger.exception("Error aggregating historical ratings: %s", key_error)
        raise HTTPException(status_code=500, detail="Internal Server Error") from key_error
    except Exception as error:
        logger.exception("Error retrieving historical aggregates: %s", error)
        raise HTTPException(status_code=500, detail="Internal Server Error") from error

class HistoricalGraphData(BaseModel):
    """
    Model to represent the results of a historical ratings comparison between two dates.

    Attributes:
        start_date (List[Dict[str, Any]]): A list of dictionaries containing the 
        ratings for each capability assessment on the start date.
            Each dictionary should contain the following keys:
                - capability_assessment_id (int): The ID of the capability assessment.
                - average_rating (float): The average rating for the capability assessment
                - rating_label (str): The label for the rating
                - capability_name (str): The name of the capability.
                - attribute_name (str): The name of the attribute.
                - component_name (str): The name of the component.
                - acc_model_name (str): The name of the ACC model.
        end_date (List[Dict[str, Any]]): A list of dictionaries containing 
        the ratings for each capability assessment on the end date.
            The same structure as the start_date attribute.
    """
    start_date: List[Dict[str, Any]]
    end_date: List[Dict[str, Any]]

@router.post("/historical-graph-data", response_model=HistoricalGraphData)
def get_historical_ratings_for_graph(
        capability_assessment_ids: List[int],
        start_date: datetime,
        end_date: datetime,
        db_session: Session = Depends(get_db)
) -> HistoricalGraphData:
    """
    Retrieves historical ratings for a list of capability assessments 
    on two specific dates for comparison in graph form.
    """
    try:
        results = {}
        for date_label, target_date in [("start_date", start_date), ("end_date", end_date)]:
            results[date_label] = get_historical_ratings_aggregate(
                capability_assessment_ids=capability_assessment_ids,
                target_date=target_date,
                db_session=db_session
            )

        return HistoricalGraphData(**results)

    except ValueError as ve:
        logger.exception("Value error in historical graph data retrieval: %s", ve)
        raise HTTPException(status_code=400, detail="Invalid input value") from ve
    except KeyError as ke:
        logger.exception("Key error in historical graph data retrieval: %s", ke)
        raise HTTPException(status_code=500, detail="Data retrieval error") from ke
    except Exception as error:
        logger.exception("Unexpected error in historical graph data retrieval: %s", error)
        raise HTTPException(status_code=500, detail="Internal Server Error") from error
