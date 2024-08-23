"""
This module consists of the SQLAlchemy models used to define the structure of the tables in the database.
"""

from datetime import datetime
from sqlalchemy import Enum, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy import DateTime

from app.database import Base

class ACCModel(Base):
    __tablename__ = "acc_models"

    id = Column(Integer, primary_key=True)
    name = Column(String, index=True)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    components = relationship("Component", back_populates="acc_model", cascade="all, delete-orphan")

class Component(Base):
    __tablename__ = "components"

    id = Column(Integer, primary_key=True)
    name = Column(String, index=True)
    description = Column(Text)
    acc_model_id = Column(Integer, ForeignKey("acc_models.id"), nullable=False)

    acc_model = relationship("ACCModel", back_populates="components")
    capabilities = relationship("Capability", back_populates="component", cascade="all, delete-orphan")

class Attribute(Base):
    __tablename__ = "attributes"

    id = Column(Integer, primary_key=True)
    name = Column(String, index=True)
    description = Column(Text)

    assessments = relationship("CapabilityAssessment", back_populates="attribute", cascade="all, delete-orphan")

class Capability(Base):
    __tablename__ = "capabilities"

    id = Column(Integer, primary_key=True)
    name = Column(String, index=True)
    description = Column(Text)
    component_id = Column(Integer, ForeignKey('components.id'))

    component = relationship("Component", back_populates="capabilities")
    assessments = relationship("CapabilityAssessment", back_populates="capability", cascade="all, delete-orphan")

class CapabilityAssessment(Base):
    __tablename__ = "capability_assessments"

    id = Column(Integer, primary_key=True)
    capability_id = Column(Integer, ForeignKey('capabilities.id'), nullable=False)
    attribute_id = Column(Integer, ForeignKey('attributes.id'), nullable=False)
    rating = Column(Integer, nullable=True)
    comments = Column(Text, nullable=True)

    capability = relationship("Capability", back_populates="assessments")
    attribute = relationship("Attribute")
    ratings = relationship("Rating", back_populates="capability_assessment", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    designation = Column(String, nullable=True)

    ratings = relationship("Rating", back_populates="user")


class Rating(Base):
    __tablename__ = 'ratings'

    id = Column(Integer, primary_key=True, index=True)
    rating = Column(String, nullable=False)
    comments = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    capability_assessment_id = Column(Integer, ForeignKey('capability_assessments.id'), nullable=False)
    timestamp = Column(DateTime, default=datetime.now, nullable=False)

    user = relationship("User", back_populates="ratings")
    capability_assessment = relationship("CapabilityAssessment", back_populates="ratings")

