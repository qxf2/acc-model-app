"""
This module contains common utility functions used in other modules.
"""

import logging
from typing import List
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models import Capability, Attribute, CapabilityAssessment, Component, ACCModel

logger = logging.getLogger(__name__)

def get_full_capability_assessment_data(
    db_session: Session, capability_assessment_ids: List[int]
) -> List[Dict[str, Any]]:
    """
    Fetches the capability, attribute, component, and ACC model names
    based on capability_assessment_ids.
    
    Args:
        db_session: The database session.
        capability_assessment_ids: List of capability assessment IDs.
    
    Returns:
        List of dictionaries with the full data for each capability assessment.
    """
    assessments = (
        db_session.query(
            CapabilityAssessment.id.label("capability_assessment_id"),
            Capability.name.label("capability_name"),
            Attribute.name.label("attribute_name"),
            Component.name.label("component_name"),
            ACCModel.name.label("acc_model_name")
        )
        .join(Capability, Capability.id == CapabilityAssessment.capability_id)
        .join(Attribute, Attribute.id == CapabilityAssessment.attribute_id)
        .join(Component, Component.id == Capability.component_id)
        .join(ACCModel, ACCModel.id == Component.acc_model_id)
        .filter(CapabilityAssessment.id.in_(capability_assessment_ids))
        .all()
    )

    return [
        {
            "capability_assessment_id": a.capability_assessment_id,
            "capability_name": a.capability_name,
            "attribute_name": a.attribute_name,
            "component_name": a.component_name,
            "acc_model_name": a.acc_model_name,
        }
        for a in assessments
    ]
