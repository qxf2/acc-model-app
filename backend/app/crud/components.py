"""
This module contains the CRUD (Create, Read, Update, Delete) operations related to components table.
"""
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from app import schemas, models
from app.crud import acc_models

def get_component(db_session: Session, component_id: int):
    """
    Retrieves a component by its ID.

    Args:
        db_session (Session): The database session to use for the query.
        component_id (int): The ID of the component to retrieve.

    Returns:
        dict: A dictionary containing the component's details,
        or None if the component is not found.
    """

    component = (
        db_session.query(models.Component).filter(models.Component.id == component_id).first()
    )
    if component:
        acc_model = (
            db_session.query(models.ACCModel)
            .filter(models.ACCModel.id == component.acc_model_id)
            .first()
        )
        component_details = {
            "id": component.id,
            "name": component.name,
            "description": component.description,
            "acc_model_id": component.acc_model_id,
            "acc_model_name": acc_model.name if acc_model else None,
        }
        return component_details
    return None


def get_all_components(db_session: Session, limit: int = 100) -> List[dict]:
    """
    Retrieves a list of all components from the database.

    Args:
        db_session (Session): The database session to use for the query.
        limit (int): The maximum number of components to retrieve. Defaults to 100.

    Returns:
        List[dict]: A list of dictionaries containing the component's details.
    """

    components = db_session.query(models.Component).limit(limit).all()
    component_details = []
    for component in components:
        acc_model = (
            db_session.query(models.ACCModel)
            .filter(models.ACCModel.id == component.acc_model_id)
            .first()
        )
        component_details.append(
            {
                "id": component.id,
                "name": component.name,
                "description": component.description,
                "acc_model_id": component.acc_model_id,
                "acc_model_name": acc_model.name if acc_model else None,
            }
        )
    return component_details


def get_components_by_acc_model(
                db_session: Session, acc_model_id: int, limit: int = 100
) -> List[dict]:
    """
    Retrieves a list of components associated with a specific acc_model_id.

    Args:
        db_session (Session): The database session to use for the query.
        acc_model_id (int): The id of the acc_model to filter components by.
        limit (int): The maximum number of components to retrieve. Defaults to 100.

    Returns:
        List[dict]: A list of dictionaries containing the component's details.
    """

    components = (
        db_session.query(models.Component)
        .filter(models.Component.acc_model_id == acc_model_id)
        .limit(limit)
        .all()
    )
    component_details = []
    for component in components:
        acc_model = (
            db_session.query(models.ACCModel)
            .filter(models.ACCModel.id == component.acc_model_id)
            .first()
        )
        component_details.append(
            {
                "id": component.id,
                "name": component.name,
                "description": component.description,
                "acc_model_id": component.acc_model_id,
                "acc_model_name": acc_model.name if acc_model else None,
            }
        )
    return component_details


def get_component_by_name_and_acc_model_id(db_session: Session, name: str, acc_model_id: int):
    """
    Retrieves a Component by its name and acc_model_id.

    Args:
        db_session (Session): The database session to use for the query.
        name (str): The name of the Component to filter by.
        acc_model_id (int): The id of the acc_model to filter by.

    Returns:
        The first Component that matches the given name and acc_model_id,
        or None if no match is found.
    """

    normalized_name = name.strip().lower()

    return (
        db_session.query(models.Component)
        .filter(
            func.lower(models.Component.name) == normalized_name,
            models.Component.acc_model_id == acc_model_id
        )
        .first()
    )


def create_component(db_session: Session, component: schemas.ComponentCreate):
    """
    Create a new Component.

    Args:
        db_session (Session): The database session to use for the operation.
        component (schemas.ComponentCreate): The component data to create.

    Returns:
        models.Component: The newly created component instance.
    """

    normalized_name = component.name.strip()

    acc_model = acc_models.get_acc_model(db_session, component.acc_model_id)
    if acc_model is None:
        raise HTTPException(
            status_code=400, detail="ACC model with this ID does not exist"
        )

    existing_component = get_component_by_name_and_acc_model_id(
        db_session, name=normalized_name, acc_model_id=component.acc_model_id
    )
    if existing_component:
        raise HTTPException(
            status_code=400,
            detail="Component with this name already exists in this ACC model",
        )

    db_component = models.Component(
        name=normalized_name,
        description=component.description,
        acc_model_id=component.acc_model_id,
    )
    db_session.add(db_component)
    db_session.commit()
    db_session.refresh(db_component)
    return db_component


def update_component(db_session: Session, component_id: int, component: schemas.ComponentCreate):
    """
    Updates an existing Component in the database.

    Args:
        db_session (Session): The database session to use for the operation.
        component_id (int): The ID of the Component to update.
        component (schemas.ComponentCreate): The updated Component data.

    Returns:
        models.Component: The updated Component instance.
    """

    existing_component = (
        db_session.query(models.Component).filter(models.Component.id == component_id).first()
    )
    if not existing_component:
        raise HTTPException(status_code=404, detail="Component not found")

    acc_model = acc_models.get_acc_model(db_session, component.acc_model_id)
    if not acc_model:
        raise HTTPException(
            status_code=400, detail="ACC model with this ID does not exist"
        )

    existing_component_by_name = get_component_by_name_and_acc_model_id(
        db_session, name=component.name, acc_model_id=component.acc_model_id
    )
    if existing_component_by_name and existing_component_by_name.id != component_id:
        raise HTTPException(
            status_code=400, detail="Component name already in use in this ACC model"
        )

    for key, value in component.model_dump().items():
        setattr(existing_component, key, value)

    db_session.commit()
    db_session.refresh(existing_component)
    return existing_component


def delete_component(db_session: Session, component_id: int) -> dict:
    """
    Deletes an existing Component from the database.

    Args:
        db_session (Session): The database session to use for the operation.
        component_id (int): The ID of the Component to delete.
    """

    db_component = (
        db_session.query(models.Component).filter(models.Component.id == component_id).first()
    )
    if db_component:
        acc_model = (
            db_session.query(models.ACCModel)
            .filter(models.ACCModel.id == db_component.acc_model_id)
            .first()
        )
        component_details = {
            "id": db_component.id,
            "name": db_component.name,
            "description": db_component.description,
            "acc_model_id": db_component.acc_model_id,
            "acc_model_name": acc_model.name if acc_model else None,
        }
        db_session.delete(db_component)
        db_session.commit()
        return component_details
    return None
