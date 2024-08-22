"""
This module contains the CRUD (Create, Read, Update, Delete)
operations related to capabilities table.
"""

from typing import List
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app import models, schemas


def get_capability(db_session: Session, capability_id: int):
    """
    Retrieves a Capability by its ID.

    Args:
        db_session (Session): The database session to use for the query.
        capability_id (int): The ID of the Capability to retrieve.

    Returns:
        models.Capability: The Capability with the specified ID, or None if not found.
    """

    return (
        db_session.query(models.Capability)
        .filter(models.Capability.id == capability_id)
        .first()
    )


def get_capabilities(db_session: Session, limit: int = 100):
    """
    Retrieve a list of all Capabilities.

    Args:
        db_session (Session): The database session.
        limit (int, optional): The maximum number of capabilities to retrieve. Defaults to 100.

    Returns:
        List[models.Capability]: A list of all Capability objects.
    """

    return db_session.query(models.Capability).limit(limit).all()


def get_capability_by_name_and_component_id(
                db_session: Session, name: str, component_id: int):
    """
    Retrieve a Capability by its name and the component it belongs to.

    Args:
        db_session (Session): The database session to use for the query.
        name (str): The name of the Capability to retrieve.
        component_id (int): The ID of the component that the Capability belongs to.

    Returns:
        models.Capability: The Capability object that matches the given name
        and component ID, or None if no match is found.
    """

    return (
        db_session.query(models.Capability)
        .filter(
            models.Capability.name == name,
            models.Capability.component_id == component_id,
        )
        .first()
    )


def get_capability_by_component(
                db_session: Session,
                component_id: int,
                limit: int = 100,) -> List[dict]:
    """
    Retrieves a list of capabilities belonging to a specific component.

    Args:
        db_session (Session): The database session.
        component_id (int): The ID of the component.
        limit (int, optional): The maximum number of capabilities to retrieve. Defaults to 100.

    Returns:
        List[dict]: A list of dictionaries containing the details of each capability.
    """

    capabilities = (
        db_session.query(models.Capability)
        .filter(models.Capability.component_id == component_id)
        .all()
    )
    capability_details = []
    for capability in capabilities:
        component = (
            db_session.query(models.Component)
            .filter(models.Component.id == capability.component_id)
            .first()
        )
        capability_details.append(
            {
                "id": capability.id,
                "name": capability.name,
                "description": capability.description,
                "component_id": capability.component_id,
                "component_name": component.name if component else None,
            }
        )
    return capability_details


def create_capability(db_session: Session, capability: schemas.CapabilityCreate):
    """
    Creates a new Capability in the database.

    Args:
        db_session (Session): The database session to use for create.
        capability (schemas.CapabilityCreate): The Capability data to create.

    Returns:
        models.Capability: The newly created Capability.
    """

    component = (
        db_session.query(models.Component)
        .filter(models.Component.id == capability.component_id)
        .first()
    )
    if component is None:
        raise HTTPException(
            status_code=404, detail="Component with this id does not exist"
        )

    existing_capability = get_capability_by_name_and_component_id(
        db_session, name=capability.name, component_id=capability.component_id
    )
    if existing_capability:
        raise HTTPException(
            status_code=400, detail="Capability name already in use in this component"
        )

    db_capability = models.Capability(**capability.model_dump())
    db_session.add(db_capability)
    db_session.commit()
    db_session.refresh(db_capability)
    return db_capability


def update_capability(
                db_session: Session,
                capability_id: int,
                capability: schemas.CapabilityCreate,):
    """
    Update an existing capability.

    Args:
        db_session (Session): The database session to use for the update.
        capability_id (int): The ID of the capability to update.
        capability (schemas.CapabilityCreate): The updated capability data.

    Returns:
        models.Capability: The updated capability.
    """

    db_capability = (
        db_session.query(models.Capability)
        .filter(models.Capability.id == capability_id)
        .first()
    )
    if db_capability is None:
        raise HTTPException(status_code=404, detail="Capability not found")

    component = (
        db_session.query(models.Component)
        .filter(models.Component.id == capability.component_id)
        .first()
    )
    if component is None:
        raise HTTPException(
            status_code=400, detail="Component with this id does not exist"
        )

    existing_capability_by_name = get_capability_by_name_and_component_id(
        db_session, name=capability.name, component_id=capability.component_id
    )
    if existing_capability_by_name and existing_capability_by_name.id != capability_id:
        raise HTTPException(
            status_code=400, detail="Capability name already in use in this component"
        )

    for key, value in capability.model_dump().items():
        setattr(db_capability, key, value)

    db_session.commit()
    db_session.refresh(db_capability)
    return db_capability


def delete_capability(db_session: Session, capability_id: int):
    """
    Deletes an existing capability from the database.

    Args:
        db_session (Session): The database session to use for the deletion.
        capability_id (int): The ID of the capability to delete.

    Returns:
        models.Capability: The deleted capability, or None if no capability was found.
    """

    db_capability = (
        db_session.query(models.Capability)
        .filter(models.Capability.id == capability_id)
        .first()
    )
    if db_capability:
        db_session.delete(db_capability)
        db_session.commit()
    return db_capability


def create_capability_assessment(
                db_session: Session,
                capability_id: Optional[int] = None,
                attribute_id: Optional[int] = None,):
    """
    Creates CapabilityAssessment entries for all attributes when a new capability is created,
    or for all capabilities when a new attribute is created.

    Args:
        db_session (Session): The database session to use for the operation.
        capability_id (Optional[int]): The ID of the capability to create assessments for.
                                        Defaults to None.
        attribute_id (Optional[int]): The ID of the attribute to create assessments for.
                                        Defaults to None.

    Returns:
        dict: A dictionary containing a success message.
    """

    if capability_id:
        # Create assessments for all attributes for the new capability
        all_attributes = db_session.query(models.Attribute).all()

        for attribute in all_attributes:
            db_assessment = models.CapabilityAssessment(
                capability_id=capability_id,
                attribute_id=attribute.id,
                rating=None,
                comments=None,
            )
            db_session.add(db_assessment)

    elif attribute_id:
        # Create assessments for all capabilities for the new attribute
        all_capabilities = db_session.query(models.Capability).all()

        for capability in all_capabilities:
            db_assessment = models.CapabilityAssessment(
                capability_id=capability.id,
                attribute_id=attribute_id,
                rating=None,
                comments=None,
            )
            db_session.add(db_assessment)

    db_session.commit()
    return {"message": "Capability assessments created successfully."}


def get_capability_assessment(
                db_session: Session, capability_assessment_id: int
) -> schemas.CapabilityAssessmentRead:
    """
    Retrieves a capability assessment by its ID.

    Args:
        db_session (Session): The database session to use for the retrieval.
        capability_assessment_id (int): The ID of the capability assessment to retrieve.

    Returns:
        schemas.CapabilityAssessmentRead: The retrieved capability assessment, or None if not found.
    """

    capability_assessment = (
        db_session.query(models.CapabilityAssessment)
        .filter(models.CapabilityAssessment.id == capability_assessment_id)
        .first()
    )

    if capability_assessment:
        return schemas.CapabilityAssessmentRead.model_validate(capability_assessment)
    return None


def get_capability_assessment_by_capability_and_attribute(
                db_session: Session, capability_id: int, attribute_id: int
) -> schemas.CapabilityAssessmentRead:
    """
    Retrieves a capability assessment by its capability ID and attribute ID.

    Args:
        db_session (Session): The database session to use for the query.
        capability_id (int): The ID of the capability to retrieve the assessment for.
        attribute_id (int): The ID of the attribute to retrieve the assessment for.

    Returns:
        schemas.CapabilityAssessmentRead: The capability assessment, or None if not found.
    """

    capability_assessment = (
        db_session.query(models.CapabilityAssessment)
        .filter(
            models.CapabilityAssessment.capability_id == capability_id,
            models.CapabilityAssessment.attribute_id == attribute_id,
        )
        .first()
    )

    if capability_assessment:
        return schemas.CapabilityAssessmentRead.model_validate(capability_assessment)
    return None


def get_rating_by_user_and_assessment(
                db_session: Session, user_id: int, capability_assessment_id: int):
    """
    Retrieves a rating provided by a user for a specific capability assessment.

    Args:
        db (Session): The database session to use for the query.
        user_id (int): The ID of the user.
        capability_assessment_id (int): The ID of the capability assessment that was rated.

    Returns:
        models.Rating: The rating provided by the user for the capability assessment,
        or None if not found.
    """

    return (
        db_session.query(models.Rating)
        .filter_by(user_id=user_id, capability_assessment_id=capability_assessment_id)
        .first()
    )
