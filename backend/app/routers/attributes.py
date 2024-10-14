"""
This module defines the API endpoints related to attributes.

Endpoints:
- POST /attributes/ : Create a new attribute.
- GET /attributes/ : Retrieve a list of attributes.
- GET /attributes/{attribute_id} : Retrieve a specific attribute by ID.
- PUT /attributes/{attribute_id} : Update a specific attribute by ID.
- DELETE /attributes/{attribute_id} : Delete a specific attribute by ID.

The endpoints use the `get_db` dependency to get a database session.
The endpoints use the `crud` module to perform the database operations.
"""

import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas
from app.crud import attributes as crud
from app.crud import capabilities as capability_crud
from app.database import get_db
from app.routers.security import get_current_user

router = APIRouter(
    prefix="/attributes",
    tags=["attributes"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger(__name__)

@router.post("/", response_model=schemas.AttributeRead)
def create_attribute(
                attribute: schemas.AttributeCreate,
                db_session: Session = Depends(get_db),
                current_user: schemas.UserRead = Depends(get_current_user)
):
    """
    Creates a new Attribute instance.

    Args:
        attribute: The attribute data to create.
        db_session: The database session to use for the query.
        current_user: The current user. Depends(get_current_user).

    Returns:
        The newly created Attribute instance.
    """
    try:
        logger.info("Creating a new attribute with name: %s by user: %s",
                    attribute.name, current_user.username)
        existing_attribute = crud.get_attribute_by_name(db_session, name=attribute.name)
        if existing_attribute:
            logger.warning("Attribute with name '%s' already exists", attribute.name)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Attribute with this name already exists",
            )

        new_attribute = crud.create_attribute(db_session=db_session, attribute=attribute)
        logger.info("Attribute '%s' created successfully", attribute.name)

        # Create CapabilityAssessment entries for all capabilities for this new attribute
        capability_crud.create_capability_assessment(
            db_session=db_session, attribute_id=new_attribute.id
        )
        return new_attribute

    except HTTPException as http_error:
        logger.error("Client error: %s", http_error.detail)
        raise http_error

    except Exception as error:
        logger.error("Error creating attribute: %s", error)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while creating the attribute.",
        ) from error

@router.get("/", response_model=List[schemas.AttributeRead])
def read_attributes(limit: int = 100, db_session: Session = Depends(get_db)):
    """
    Retrieves a list of Attribute instances.

    Args:
        limit: The maximum number of instances to retrieve. Defaults to 100.
        db_session: The database session to use for the query.

    Returns:
        List: A list of Attribute instances.
    """
    try:
        logger.info("Fetching up to Attributes")
        attributes = crud.get_attributes(db_session, limit=limit)
        return attributes

    except HTTPException as http_error:
        logger.error("Client error: %s", http_error.detail)
        raise http_error
    except Exception as error:
        logger.error("Error retrieving attributes: %s", error)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An  unexpected error occurred while fetching the attributes.",
        ) from error

@router.get("/{attribute_id}", response_model=schemas.AttributeRead)
def read_attribute(attribute_id: int, db_session: Session = Depends(get_db)):
    """
    Retrieves an Attribute instance by its ID.

    Args:
        attribute_id: The ID of the Attribute instance to retrieve.
        db: The database session to use for the query.

    Returns:
        The retrieved Attribute instance.
    """
    try:
        logger.info("Fetching attribute with ID: %d", attribute_id)
        attribute = crud.get_attribute(db_session, attribute_id=attribute_id)
        if attribute is None:
            logger.warning("Attribute with ID %d not found", attribute_id)
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attribute not found")
        return attribute

    except HTTPException as http_error:
        logger.error("Client error: %s", http_error.detail)
        raise http_error
    except Exception as error:
        logger.error("Error retrieving attribute: %s", error)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while fetching the attribute.",
        ) from error

@router.put("/{attribute_id}", response_model=schemas.AttributeRead)
def update_attribute(
                attribute_id: int,
                attribute: schemas.AttributeCreate,
                db_session: Session = Depends(get_db),
                current_user: schemas.UserRead = Depends(get_current_user)
):
    """
    Updates an existing attribute.

    Args:
        attribute_id: The ID of the attribute to update.
        attribute: The updated attribute data.
        db_session: The database session to use for the query.
        current_user: The current user. Depends(get_current_user).

    Returns:
        The updated attribute instance.
    """

    try:
        logger.info("Updating attribute with ID: %d by user: %s",
                    attribute_id, current_user.username)
        existing_attribute = crud.get_attribute(db_session, attribute_id=attribute_id)
        if existing_attribute is None:
            logger.warning("Attribute with ID %d not found", attribute_id)
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attribute not found")

        existing_attribute_by_name = crud.get_attribute_by_name(
            db_session, name=attribute.name
        )
        if existing_attribute_by_name and existing_attribute_by_name.id != attribute_id:
            logger.warning("Attribute name '%s' already in use", attribute.name)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="Attribute name already in use")

        updated_attribute = crud.update_attribute(
            db_session, attribute_id=attribute_id, attribute=attribute
        )
        logger.info("Attribute with ID %d updated successfully", attribute_id)
        return updated_attribute

    except HTTPException as http_error:
        logger.error("Client error: %s", http_error.detail)
        raise http_error
    except Exception as error:
        logger.error("Error updating attribute: %s", error)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while updating the attribute.",
        ) from error


@router.delete("/{attribute_id}", response_model=schemas.AttributeRead)
def delete_attribute(
                attribute_id: int,
                db_session: Session = Depends(get_db),
                current_user: schemas.UserRead = Depends(get_current_user)
):
    """
    Deletes an existing Attribute instance.

    Args:
        attribute_id: The ID of the attribute to delete.
        db_session: The database session to use for the query.
        current_user: The current user. Depends(get_current_user).

    Returns:
        The deleted Attribute instance.
    """
    try:
        logger.info("Deleting attribute with ID: %d by user %s",
                    attribute_id, current_user.username)
        existing_attribute = crud.get_attribute(db_session, attribute_id=attribute_id)
        if existing_attribute is None:
            logger.warning("Attribute with ID %d not found", attribute_id)
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attribute not found")

        deleted_attribute = crud.delete_attribute(db_session, attribute_id=attribute_id)
        logger.info("Attribute with ID %d deleted successfully", attribute_id)
        return deleted_attribute

    except HTTPException as http_error:
        logger.error("Client error: %s", http_error.detail)
        raise http_error

    except Exception as error:
        logger.error("Error deleting attribute: %s", error)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Server Error",
        ) from error
