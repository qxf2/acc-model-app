""""
This module defines the API endpoints related to components.

The endpoints are:
- `POST /components`: Creates a new component.
- `GET /components`: Retrieves a list of all components.
- `GET /components/acc_model/{acc_model_id}`:
    Retrieves a list of components associated with a specific acc_model_id.
- `GET /components/id/{component_id}`: Retrieves a component by its ID.
- `PUT /components/id/{component_id}`: Updates an existing component.
- `DELETE /components/{component_id}`: Deletes an existing component.

The endpoints use the `get_db` dependency to get a database session.
The endpoints use the `crud` module to perform the database operations.
"""

import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas
from app.crud import components as crud
from app.database import get_db

router = APIRouter(
    prefix="/components",
    tags=["components"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger(__name__)


@router.post("/", response_model=schemas.ComponentRead)
def create_component(component: schemas.ComponentCreate, db_session: Session = Depends(get_db)):
    """
    Creates a new component.

    Args:
        component: The component data to create.
        db_session: The database session to use for the operation.

    Returns:
        The newly created component instance.
    """

    try:
        logger.info("Creating a new component: %s", component.name)
        existing_component = crud.get_component_by_name_and_acc_model_id(
            db_session, name=component.name, acc_model_id=component.acc_model_id)
        if existing_component:
            raise HTTPException(
                status_code=400, detail="Component with this name already exists")

        new_component = crud.create_component(
            db_session=db_session, component=component)
        logger.info("Successfully created component with ID: %s",
                    new_component.id)
        return new_component

    except Exception as error:
        logger.error("Error creating component: %s", error)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while creating the component",
        )


@router.get("/", response_model=List[schemas.ComponentRead])
def read_all_components(limit: int = 100, db_session: Session = Depends(get_db)):
    """
    Retrieves a list of all components.

    Args:
        db_session: The database session to use for the query.

    Returns:
        A list of all components.
    """

    try:
        logger.info("Fetching up to %d components", limit)
        components = crud.get_all_components(db_session, limit=limit)
        return components

    except Exception as error:
        logger.error("Error retrieving components: %s", error)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while retrieving the components",
        )


@router.get("/acc_model/{acc_model_id}", response_model=List[schemas.ComponentRead])
def read_components_by_acc_model(
                acc_model_id: int,
                limit: int = 100,
                db_session: Session = Depends(get_db)):
    """
    Retrieves a list of components associated with a specific acc_model_id.

    Args:
        acc_model_id: The id of the acc_model to filter components by.
        limit: The maximum number of components to retrieve. Defaults to 100.
        db_session: The database session to use for the query.

    Returns:
        A list of components associated with the specified acc_model_id.
    """
    try:
        logger.info("Fetching components for acc_model_id: %d", acc_model_id)
        components = crud.get_components_by_acc_model(
            db_session, acc_model_id=acc_model_id, limit=limit)
        return components

    except Exception as error:
        logger.error(
            "Error fetching components for acc_model_id %d: %s", acc_model_id, error)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred while fetching components for acc_model_id",
        )


@router.get("/id/{component_id}", response_model=schemas.ComponentRead)
def read_component(component_id: int, db_session: Session = Depends(get_db)):
    """
    Retrieves a Component by its ID.

    Args:
        component_id: The ID of the component to retrieve.
        db_session: The database session to use for the query.

    Returns:
        The retrieved component.
    """

    try:
        logger.info("Fetching component with ID: %d", component_id)
        component = crud.get_component(db_session, component_id=component_id)
        if component is None:
            logger.error("Component with ID: %d not found", component_id)
            raise HTTPException(status_code=404, detail="Component not found")
        logger.info("Returning component details for ID: %d", component_id)
        return component

    except Exception as error:
        logger.error("Error retrieving component with ID %d: %s",
                     component_id, error)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while fetching the component.",
        )


@router.put("/id/{component_id}", response_model=schemas.ComponentRead)
def update_component(
                component_id: int,
                component: schemas.ComponentCreate,
                db_session: Session = Depends(get_db)):
    """
    Updates an existing Component.

    Args:
        component_id: The ID of the component to update.
        component: The updated component data.
        db_session: The database session to use for the operation.

    Returns:
        The updated component instance.
    """

    try:
        logger.info("Updating component with ID: %d", component_id)
        existing_component = crud.get_component(
            db_session, component_id=component_id)
        if existing_component is None:
            logger.error("Component with ID: %d not found", component_id)
            raise HTTPException(status_code=404, detail="Component not found")

        existing_component_by_name = crud.get_component_by_name_and_acc_model_id(
            db_session, name=component.name, acc_model_id=component.acc_model_id)
        if existing_component_by_name and existing_component_by_name.id != component_id:
            logger.error("Component name '%s' already in use", component.name)
            raise HTTPException(
                status_code=400, detail="Component name already in use")

        updated_component = crud.update_component(
            db_session, component_id=component_id, component=component)
        logger.info("Successfully updated component with ID: %d", component_id)
        return updated_component

    except Exception as error:
        logger.error("Error updating component with ID %d: %s",
                     component_id, error)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while updating the component.",
        )


@router.delete("/{component_id}", response_model=schemas.ComponentRead)
def delete_component(component_id: int, db_session: Session = Depends(get_db)):
    """
    Deletes an existing Component.

    Args:
        component_id: The ID of the component to delete.
        db_session: The database session to use for the operation.

    Returns:
        The deleted component instance.
    """

    try:
        logger.info("Deleting component with ID: %d", component_id)
        existing_component = crud.get_component(
            db_session, component_id=component_id)
        if existing_component is None:
            logger.error("Component with ID: %d not found", component_id)
            raise HTTPException(status_code=404, detail="Component not found")

        deleted_component = crud.delete_component(
            db_session, component_id=component_id)
        logger.info("Successfully deleted component with ID: %d", component_id)
        return deleted_component

    except Exception as error:
        logger.error("Error deleting component with ID %d: %s",
                     component_id, error)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while deleting the component.",
        )
