"""
This module defines the API endpoints related to ACC Models.

The endpoints are:
- `POST /acc-models`: Creates a new ACCModel instance.
- `GET /acc-models`: Retrieves a list of ACC models.
- `GET /acc-models/{acc_model_id}`: Retrieves an ACC model by its ID.
- `PUT /acc-models/{acc_model_id}`: Updates an existing ACC model.
- `DELETE /acc-models/{acc_model_id}`: Deletes an existing ACC model.

The endpoints use the `get_db` dependency to get a database session.
The endpoints use the `crud` module to perform the database operations.
"""

import logging
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

logger = logging.getLogger(__name__)


@router.post("/", response_model=schemas.ACCModelRead)
def create_acc_model(acc_model: schemas.ACCModelCreate, db_session: Session = Depends(get_db)):
    """
    Creates a new ACCModel instance.

    Args:
        acc_model: The ACCModel data to create.
        db: The database session to use for the query.

    Returns:
        schemas.ACCModelRead: The newly created ACCModel instance.
    """
    try:
        logger.info("Creating ACC model with name: %s", acc_model.name)
        existing_acc_model = crud.get_acc_model_by_name(
            db_session, name=acc_model.name)
        if existing_acc_model:
            logger.warning("ACC model with name '%s' already in use", acc_model.name)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="ACC model with this name already exists")

        new_model = crud.create_acc_model(
            db_session=db_session, acc_model=acc_model)
        logger.info("ACC model '%s' created successfully", acc_model.name)
        return new_model
    except Exception as error:
        logger.error("Error creating ACC model: %s", error)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="An unexpected error occurred while creating the ACC model.")


@router.get("/", response_model=List[schemas.ACCModelRead])
def read_acc_models(limit: int = 100, db_session: Session = Depends(get_db)):
    """
    Retrieve a list of ACC models.

    Args:
        limit: The maximum number of ACC models to retrieve. Defaults to 100.
        db_session: The database session to use for the query.

    Returns:
        List: A list of ACC models.
    """
    try:
        acc_models = crud.get_acc_models(db_session, limit=limit)
        logger.info("Fetched %d ACC models", len(acc_models))
        return acc_models
    except Exception as error:
        logger.error("Error fetching ACC models: %s", error)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="An unexpected error occurred while fetching the ACC models.")


@router.get("/{acc_model_id}", response_model=schemas.ACCModelRead)
def read_acc_model(acc_model_id: int, db_session: Session = Depends(get_db)):
    """
    Retrieve an ACC model by its ID.

    Args:
        acc_model_id: The ID of the ACC model to retrieve.
        db_session: The database session to use for the query.

    Returns:
        The retrieved ACC model.
    """
    try:
        acc_model = crud.get_acc_model(db_session, acc_model_id=acc_model_id)
        if acc_model is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="ACC model not found")
        logger.info("Fetched ACC model with ID: %d", acc_model_id)
        return acc_model
    except Exception as error:
        logger.error("Error fetching ACC model with ID %d: %s", acc_model_id, error)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="An unexpected error occurred while fetching the ACC model.")


@router.put("/{acc_model_id}", response_model=schemas.ACCModelRead)
def update_acc_model(
                acc_model_id: int,
                acc_model: schemas.ACCModelCreate,
                db_session: Session = Depends(get_db)):
    """
    Updates an existing ACC model.

    Args:
        acc_model_id: The ID of the ACC model to update.
        acc_model: The updated ACC model data.
        db_session: The database session to use for the query.

    Returns:
        The updated ACC model.
    """

    try:
        logger.info("Updating ACC model with ID: %d", acc_model_id)
        existing_acc_model = crud.get_acc_model(
            db_session, acc_model_id=acc_model_id)
        if existing_acc_model is None:
            logger.warning("ACC model with ID %d not found", acc_model_id)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="ACC model not found")

        existing_acc_model_by_name = crud.get_acc_model_by_name(
            db_session, name=acc_model.name)
        if existing_acc_model_by_name and existing_acc_model_by_name.id != acc_model_id:
            logger.warning("ACC model name '%s' already in use", acc_model.name)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="ACC model name already in use")

        updated_acc_model = crud.update_acc_model(
            db_session, acc_model_id=acc_model_id, acc_model=acc_model)
        logger.info("ACC model with ID %d updated successfully", acc_model_id)
        return updated_acc_model
    except Exception as error:
        logger.error("Error updating ACC model with ID %d: %s", acc_model_id, error)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="An unexpected error occurred while updating the ACC model.")


@router.delete("/{acc_model_id}", response_model=schemas.ACCModelRead)
def delete_acc_model(acc_model_id: int, db_session: Session = Depends(get_db)):
    """
    Deletes an ACC model by its ID.

    Args:
        acc_model_id: The ID of the ACC model to be deleted.
        db_session: The database session.

    Returns:
        The deleted ACC model.
    """

    try:
        logger.info("Deleting ACC model with ID: %d", acc_model_id)
        existing_acc_model = crud.get_acc_model(
            db_session, acc_model_id=acc_model_id)
        if existing_acc_model is None:
            logger.warning("ACC model with ID %d not found", acc_model_id)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="ACC model not found")

        deleted_acc_model = crud.delete_acc_model(
            db_session, acc_model_id=acc_model_id)
        logger.info("ACC model with ID %d deleted successfully", acc_model_id)
        return deleted_acc_model
    except Exception as error:
        logger.error("Error deleting ACC model with ID %d: %s", acc_model_id, error)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="An unexpected error occurred while deleting the ACC model.")
