"""
This module contains the CRUD (Create, Read, Update, Delete) operations related to attributes table.
"""

from sqlalchemy.orm import Session
from app import schemas, models


def get_attribute(db_session: Session, attribute_id: int):
    """
    Retrieves an attribute from the database by its id.

    Args:
        db_session (Session): The database session to use for the query.
        attribute_id (int): The id of the attribute to retrieve.

    Returns:
        models.Attribute: The attribute with the specified ID, or None if no such attribute exists.
    """

    return (
        db_session.query(models.Attribute)
        .filter(models.Attribute.id == attribute_id)
        .first()
    )


def get_attributes(db_session: Session, limit: int = 100):
    """
    Retrieves a list of Attribute instances from the database.

    Args:
        db_session (Session): The database session to use for the query.
        limit (int): The maximum number of Attribute instances to retrieve. Defaults to 100.

    Returns:
        list[models.Attribute]: A list of Attribute instances.
    """

    return db_session.query(models.Attribute).limit(limit).all()


def get_attribute_by_name(db_session: Session, name: str):
    """
    Retrieves an attribute from the database by its name.

    Args:
        db_session (Session): The database session to use for the query.
        name (str): The name of the attribute to retrieve.

    Returns:
        models.Attribute: The attribute with the specified name,
        or None if no such attribute exists.
    """

    return (
        db_session.query(models.Attribute).filter(models.Attribute.name == name).first()
    )


def create_attribute(db_session: Session, attribute: schemas.AttributeCreate):
    """
    Creates a new Attribute instance in the database.

    Args:
        db_session (Session): The database session to use for the query.
        attribute (schemas.AttributeCreate): The attribute data to create.

    Returns:
        models.Attribute: The newly created Attribute instance.
    """

    db_attribute = models.Attribute(**attribute.model_dump())
    db_session.add(db_attribute)
    db_session.commit()
    db_session.refresh(db_attribute)
    return db_attribute


def update_attribute(db_session: Session, attribute_id: int, attribute: schemas.AttributeCreate):
    """
    Update an existing attribute.

    Args:
        db_session (Session): The database session to use for the query.
        attribute_id (int): The ID of the attribute to update.
        attribute (schemas.AttributeCreate): The updated attribute data.

    Returns:
        models.Attribute: The updated attribute instance, or None if the attribute does not exist.
    """

    db_attribute = (
        db_session.query(models.Attribute).filter(models.Attribute.id == attribute_id).first()
    )
    if db_attribute:
        for key, value in attribute.model_dump().items():
            setattr(db_attribute, key, value)
        db_session.commit()
        db_session.refresh(db_attribute)
    return db_attribute


def delete_attribute(db_session: Session, attribute_id: int):
    """
    Deletes an existing attribute from the database.

    Args:
        db_session (Session): The database session to use for the query.
        attribute_id (int): The ID of the attribute to delete.

    Returns:
        models.Attribute: The deleted attribute instance, or None if no such attribute exists.
    """

    db_attribute = (
        db_session.query(models.Attribute).filter(models.Attribute.id == attribute_id).first()
    )
    if db_attribute:
        db_session.delete(db_attribute)
        db_session.commit()
    return db_attribute
