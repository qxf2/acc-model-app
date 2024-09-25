"""
This module contains the CRUD (Create, Read, Update, Delete) operations related to acc_models table.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from app import schemas, models


def get_acc_model(db_session: Session, acc_model_id: int):
    """
    Retrieves an ACCModel instance from the database based on the provided acc_model_id.

    Args:
        db_session (Session): The database session to use for the query.
        acc_model_id (int): The ID of the ACCModel to retrieve.

    Returns:
        models.ACCModel: The retrieved ACCModel instance, or None if not found.
    """

    return (
        db_session.query(models.ACCModel)
        .filter(models.ACCModel.id == acc_model_id)
        .first()
    )


def get_acc_model_by_name(db_session: Session, name: str):
    """
    Retrieves an ACCModel instance from the database based on the provided name.

    Args:
        db_session (Session): The database session to use for the query.
        name (str): The name of the ACCModel to retrieve.

    Returns:
        models.ACCModel: The retrieved ACCModel instance, or None if not found.
    """
    normalized_name = name.strip().lower()

    return (
        db_session.query(models.ACCModel).filter(
            func.lower(models.ACCModel.name) == normalized_name).first()
    )

def get_acc_models(db_session: Session, limit: int = 100):
    """
    Retrieves a list of ACCModel instances from the database.

    Args:
        db_session (Session): The database session to use for the query.
        limit (int): The maximum number of ACCModel instances to retrieve. Defaults to 100.

    Returns:
        list[models.ACCModel]: A list of ACCModel instances.
    """

    return db_session.query(models.ACCModel).limit(limit).all()


def create_acc_model(db_session: Session, acc_model: schemas.ACCModelCreate):
    """
    Creates a new ACCModel instance in the database.

    Args:
        db_session (Session): The database session to use for the query.
        acc_model (schemas.ACCModelCreate): The ACCModel data to create.

    Returns:
        models.ACCModel: The newly created ACCModel instance.
    """
    normalized_name = acc_model.name.strip().lower()

    existing_acc_model = db_session.query(models.ACCModel).filter(
        func.lower(models.ACCModel.name) == normalized_name
    ).first()

    if existing_acc_model:
        raise ValueError(f"ACC model with name '{acc_model.name}' already exists")

    db_acc_model = models.ACCModel(name=acc_model.name.strip(), description=acc_model.description)

    db_session.add(db_acc_model)
    db_session.commit()
    db_session.refresh(db_acc_model)
    return db_acc_model


def update_acc_model(db_session: Session, acc_model_id: int, acc_model: schemas.ACCModelCreate):
    """
    Updates an existing ACCModel instance in the database.

    Args:
        db_session (Session): The database session to use for the query.
        acc_model_id (int): The ID of the ACCModel instance to update.
        acc_model (schemas.ACCModelCreate): The updated ACCModel data.

    Returns:
        models.ACCModel: The updated ACCModel instance, or None if no instance was found.
    """

    db_acc_model = (
        db_session.query(models.ACCModel)
        .filter(models.ACCModel.id == acc_model_id)
        .first()
    )
    if db_acc_model:
        for key, value in acc_model.model_dump().items():
            setattr(db_acc_model, key, value)
        db_session.commit()
        db_session.refresh(db_acc_model)
    return db_acc_model


def delete_acc_model(db_session: Session, acc_model_id: int):
    """
    Deletes an existing ACCModel instance from the database.

    Args:
        db_session (Session): The database session to use for the query.
        acc_model_id (int): The ID of the ACCModel instance to delete.

    Returns:
        models.ACCModel: The deleted ACCModel instance, or None if no instance was found.
    """

    db_acc_model = (
        db_session.query(models.ACCModel)
        .filter(models.ACCModel.id == acc_model_id)
        .first()
    )
    if db_acc_model:
        db_session.delete(db_acc_model)
        db_session.commit()
    return db_acc_model
