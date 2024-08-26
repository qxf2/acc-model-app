"""
This module defines the API endpoints related to capabilities.

The endpoints are:
- `POST /capabilities`: Creates a new capability.
- `GET /capabilities`: Retrieves a list of all capabilities.
- `GET /capabilities/{capability_id}`: Retrieves a capability by its ID.
- `PUT /capabilities/{capability_id}`: Updates an existing capability.
- `DELETE /capabilities/{capability_id}`: Deletes an existing capability.
- `GET /capabilities/component/{component_id}`:
    Retrieves a list of capabilities for a component by its ID.

The endpoints use the `get_db` dependency to get a database session.
The endpoints use the `crud` module to perform the database operations.
"""

from typing import List
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas
from app.crud import capabilities as crud
from app.database import get_db
from app.routers.security import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/capabilities",
    tags=["capabilities"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=schemas.CapabilityRead)
def create_capability(
                capability: schemas.CapabilityCreate,
                db_session: Session = Depends(get_db),
                current_user: schemas.UserRead = Depends(get_current_user)
):
    """
    Creates a new capability.

    Args:
        capability: The capability to be created.
        db_session: The database session.
        current_user: The current user. Depends(get_current_user).

    Returns:
        The newly created capability.
    """
    try:
        existing_capability = crud.get_capability_by_name_and_component_id(
            db_session, name=capability.name, component_id=capability.component_id
        )
        if existing_capability:
            logger.error("Capability with name %s already exists", capability.name)
            raise HTTPException(
                status_code=400, detail="Capability with this name already exists"
            )

        new_capability = crud.create_capability(
            db_session=db_session, capability=capability
        )
        crud.create_capability_assessment(
            db_session=db_session, capability_id=new_capability.id
        )
        logger.info("Created new capability with ID %s by user %s",
                    new_capability.id, current_user.username)
        return new_capability

    except HTTPException as http_error:
        logger.error("Client error: %s", http_error.detail)
        raise http_error

    except Exception as error:
        logger.exception("Error creating capability: %s", error)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while creating the capability",
        )


@router.get("/", response_model=List[schemas.CapabilityRead])
def read_capabilities(limit: int = 100, db_session: Session = Depends(get_db)):
    """
    Retrieves a list of capabilities.

    Args:
        limit: The maximum number of capabilities to retrieve. Defaults to 100.
        db_session: The database session.

    Returns:
        A list of capabilities.
    """
    try:
        capabilities = crud.get_capabilities(db_session, limit=limit)
        logger.info("Retrieved %s capabilities", len(capabilities))
        return capabilities
    
    except HTTPException as http_error:
        logger.error("Client error: %s", http_error.detail)
        raise http_error
    except Exception as error:
        logger.exception("Error retrieving capabilities: %s", error)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while retrieving the capabilities",
        )


@router.get("/{capability_id}", response_model=schemas.CapabilityRead)
def read_capability(capability_id: int, db_session: Session = Depends(get_db)):
    """
    Retrieves a capability by its ID.

    Args:
        capability_id: The ID of the capability to retrieve.
        db_session: The database session.

    Returns:
        The retrieved capability.
    """
    try:
        capability = crud.get_capability(db_session, capability_id=capability_id)
        if capability is None:
            logger.error("Capability with ID %s not found", capability_id)
            raise HTTPException(status_code=404, detail="Capability not found")
        logger.info("Retrieved capability with ID %s", capability_id)
        return capability
    except HTTPException as http_error:
        logger.error("Client error: %s", http_error.detail)
        raise http_error
    except Exception as error:
        logger.exception("Error retrieving capability: %s", error)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while retrieving the capability",
        )


@router.get("/component/{component_id}", response_model=List[schemas.CapabilityRead])
def read_capabilities_by_component(
                component_id: int,
                limit: int = 100,
                db_session: Session = Depends(get_db)
):
    """
    Retrieves a list of capabilities belonging to a specific component by its ID.

    Args:
        component_id: The ID of the component to retrieve capabilities for.
        limit : The maximum number of capabilities to return. Defaults to 100.
        db_session : The database session. Defaults to Depends(get_db).

    Returns:
        A list of capabilities belonging to the specified component.
    """
    try:
        capabilities = crud.get_capability_by_component(
            db_session, component_id=component_id, limit=limit
        )
        logger.info(
            "Retrieved %s capabilities for component ID %s",
            len(capabilities),
            component_id,
        )
        return capabilities
    except HTTPException as http_error:
        logger.error("Client error: %s", http_error.detail)
        raise http_error
    except Exception as error:
        logger.exception("Error retrieving capabilities by component: %s", error)
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving the capabilities of the component",
        )


@router.put("/{capability_id}", response_model=schemas.CapabilityRead)
def update_capability(
                capability_id: int,
                capability: schemas.CapabilityUpdate,
                db_session: Session = Depends(get_db),
                current_user: schemas.UserRead = Depends(get_current_user),
):
    """
    Updates an existing capability by its ID.

    Args:
        capability_id: The ID of the capability to update.
        capability: The updated capability data.
        db_session: The database session.
        current_user: The current user. Depends(get_current_user).

    Returns:
        The updated capability data.
    """
    try:
        existing_capability = crud.get_capability(
            db_session, capability_id=capability_id
        )
        if existing_capability is None:
            logger.error("Capability with ID %s not found", capability_id)
            raise HTTPException(status_code=404, detail="Capability not found")

        capability_by_name = crud.get_capability_by_name_and_component_id(
            db_session, name=capability.name, component_id=capability.component_id
        )
        if capability_by_name and capability_by_name.id != capability_id:
            logger.error(
                "Capability name %s already in use in component ID %d",
                capability.name,
                capability.component_id,
            )
            raise HTTPException(
                status_code=400,
                detail="Capability name already in use in this component",
            )

        updated_capability = crud.update_capability(
            db_session, capability_id=capability_id, capability=capability
        )
        logger.info("Updated capability with ID %s by user %s",
                    capability_id, current_user.username)
        return updated_capability
    except HTTPException as http_error:
        logger.error("Client error: %s", http_error.detail)
        raise http_error
    except Exception as error:
        logger.exception("Error updating capability: %s", error)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while updating the capability",
        )


@router.delete("/{capability_id}", response_model=schemas.CapabilityRead)
def delete_capability(
                capability_id: int,
                db_session: Session = Depends(get_db),
                current_user: schemas.UserRead = Depends(get_current_user)
):
    """
    Deletes an existing capability by its ID.

    Args:
        capability_id: The ID of the capability to delete.
        db_session: The database session.
        current_user: The current user. Depends(get_current_user).

    Returns:
        The deleted capability.
    """
    try:
        existing_capability = crud.get_capability(
            db_session, capability_id=capability_id
        )
        if existing_capability is None:
            logger.error("Capability with ID %s not found", capability_id)
            raise HTTPException(status_code=404, detail="Capability not found")

        deleted_capability = crud.delete_capability(
            db_session, capability_id=capability_id
        )
        logger.info("Deleted capability with ID %s by user %s",
                    capability_id, current_user.username)
        return deleted_capability
    except HTTPException as http_error:
        logger.error("Client error: %s", http_error.detail)
        raise http_error
    except Exception as error:
        logger.exception("Error deleting capability: %s", error)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while deleting the capability",
        )
