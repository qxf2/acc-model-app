"""
This module contains the Pydantic models used to define the structure of the data that the API will handle.
"""

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from enum import Enum
from typing import Union

class ACCModelBase(BaseModel):
    """
    Base model for ACCModel with common properties
    """
    name: str = Field(
        min_length=3,
        max_length=100,
        description="The name must have atleast three characters and upto 100 characters"
    )
    description: Optional[str] = None

class ACCModelCreate(ACCModelBase):
    """
    Model for creating an ACCModel
    """
    pass

class ACCModelRead(ACCModelBase):
    """
    Model for reading an ACCModel
    """
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
   
class ComponentBase(BaseModel):
    """
    Base model for Component with common properties
    """
    name: str = Field(
        min_length=1,
        max_length=100,
        description="The name must have atleast three characters and upto 100 characters"
    )
    description: Optional[str] = None
    acc_model_id: int

class ComponentCreate(ComponentBase):
    """
    Model for creating a Component
    """
    pass

class ComponentRead(ComponentBase):
    """
    Model for reading a Component
    """
    id: int
    
    model_config = ConfigDict(from_attributes=True)

class AttributeBase(BaseModel):
    """
    Base model for Attribute with common properties
    """
    name: str = Field(
        min_length=3,
        max_length=100,
        description="The name must have atleast three characters and upto 100 characters"
    )
    description: Optional[str] = None

class AttributeCreate(AttributeBase):
    """
    Model for creating an Attribute
    """
    pass

class AttributeRead(AttributeBase):
    """
    Model for reading an Attribute
    """
    id: int

    model_config = ConfigDict(from_attributes=True)

class CapabilityBase(BaseModel):
    """
    Base model for Capability with common properties
    """
    name: str = Field(
        min_length=1,
        max_length=100,
        description="The name must have atleast three characters and upto 100 characters"
    )
    description: Optional[str] = None
    component_id: int

class CapabilityCreate(CapabilityBase):
    """
    Model for creating a Capability
    """
    pass

class CapabilityRead(CapabilityBase):
    """
    Model for reading a Capability
    """
    id: int

    model_config = ConfigDict(from_attributes=True)

class CapabilityUpdate(BaseModel):
    """
    Model for updating a Capability
    """
    name: Optional[str] = None
    description: Optional[str] = None
    component_id: Optional[int] = None


class CapabilityAssessmentBase(BaseModel):
    """
    Base model for CapabilityAssessment with common properties
    """
    capability_id: int
    attribute_id: int
    rating: Optional[int] = None
    comments: Optional[str] = None

class CapabilityAssessmentCreate(CapabilityAssessmentBase):
    """
    Model for creating a CapabilityAssessment
    """
    pass

class CapabilityAssessmentRead(CapabilityAssessmentBase):
    """
    Model for reading a CapabilityAssessment
    """
    id: int

    model_config = ConfigDict(from_attributes=True)

class CapabilityAssessmentBulkRequest(BaseModel):
    """
    Model for Bulk CapabilityAssessments
    """
    capability_ids: List[int]
    attribute_ids: List[int]

class CapabilityAssessmentId(BaseModel):
    """
    Model for reading a CapabilityAssessment along with its capability and attribute ids
    """
    capability_assessment_id: int
    capability_id: int
    attribute_id: int

class UserBase(BaseModel):
    username: str = Field(
        min_length=3,
        max_length=100,
        description="The name must have atleast three characters and upto 100 characters"
    )
    email: str = Field(
        min_length=3,
        max_length=100,
        description="The email must have at least one character"
    )
    designation: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(
        min_length=6,
        description="The password must have at least 6 characters"
    )

class UserRead(UserBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class RatingBase(BaseModel):
    capability_assessment_id: int
    rating: str
    comments: Optional[str] = None
    timestamp: Optional[datetime] = None
    
class RatingCreate(RatingBase):
    pass

class RatingRead(RatingBase):
    id: int
    user_id: int
    
    model_config = ConfigDict(from_attributes=True)

class RatingUpdate(BaseModel):
    comments: Optional[str] = None
    timestamp: Optional[datetime] = None

class BatchRatingRequest(BaseModel):
    ratings: List[RatingCreate]

class CommentBase(BaseModel):
    rating_id: int
    comment_text: str
    timestamp: Optional[datetime] = None

class CommentCreate(CommentBase):
    pass

class CommentRead(CommentBase):
    id: int
    user_id: int
    
    model_config = ConfigDict(from_attributes=True)

class CommentUpdate(BaseModel):
    comment_text: Optional[str] = None
    timestamp: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    """
    Pydantic model representing a token.

    Attributes:
        access_token (str): The access token.
        token_type (str): The type of the token.
    """
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """
    Pydantic model representing token data.

    Attributes:
        username (Union[str, None]): The username associated with the token,
            or None if the token is not associated with any user.
    """
    username: Union[str, None] = None