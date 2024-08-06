"""
This module contains the Pydantic models used to define the structure of the data that the API will handle.
"""

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from enum import Enum
from typing import Union

class ACCModelBase(BaseModel):
    """
    Base model for ACCModel with common properties
    """
    name: str = Field(min_length=1, description="The name must have atleast one character")
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
    name: str = Field(min_length=1, description="The name must have atleast one character")
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
    name: str = Field(min_length=1, description="The name must have atleast one character")
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
    name: str = Field(min_length=1, description="The name must have atleast one character")
    description: Optional[str] = None
    comments: Optional[str] = None
    component_id: int
    attribute_id: int

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
    rating: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class UserBase(BaseModel):
    username: str = Field(min_length=1, description="The name must have at least one character")
    email: str = Field(min_length=1, description="The email must have at least one character")
    designation: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(min_length=6, description="The password must have at least 6 characters")

class UserRead(UserBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class RatingBase(BaseModel):
    user_id: int
    capability_id: int
    rating_value: int
    comments: Optional[str] = None
    timestamp: Optional[datetime] = None
    
class RatingCreate(RatingBase):
    pass

class RatingRead(RatingBase):
    id: int

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