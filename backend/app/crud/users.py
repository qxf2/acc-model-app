"""
This module defines the API endpoints related to users.
"""

from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app import models, schemas


HASHER = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    """
    Verify if a plain password matches a hashed password.

    Args:
        plain_password (str): The plain password to be verified.
        hashed_password (str): The hashed password to be compared against.

    Returns:
        bool: True if the plain password matches the hashed password, False otherwise.
    """
    return HASHER.verify(plain_password, hashed_password)

def get_password_hash(password):
    """
    Generates a hash of the provided password using the password hashing context.

    Args:
        password (str): The password to be hashed.

    Returns:
        str: The hashed password.
    """
    return HASHER.hash(password)

def get_user(db_session: Session, user_id: int):
    """
    Retrieves a user from the database based on the provided user_id.

    Args:
        db (Session): The database session.
        user_id (int): The unique identifier of the user to retrieve.

    Returns:
        User: The user corresponding to the provided user_id, or None if not found.
    """
    return db_session.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db_session: Session, username: str):
    """
    Retrieves a user from the database based on the provided username.

    Args:
        db (Session): The database session.
        username (str): The username of the user to retrieve.

    Returns:
        User: The user corresponding to the provided username, or None if not found.
    """
    user = db_session.query(models.User).filter(models.User.username == username).first()
    return user

def get_users(db_session: Session, limit: int = 100):
    """
    Retrieves a list of users from the database.

    Args:
        db (Session): The database session.
        skip (int, optional): The number of users to skip. Defaults to 0.
        limit (int, optional): The maximum number of users to retrieve. Defaults to 100.

    Returns:
        list: A list of User objects representing the retrieved users.
    """
    return db_session.query(models.User).limit(limit).all()

def create_user(db_session: Session, user: schemas.UserCreate):
    """
    Creates a new user in the database.

    Args:
        db (Session): The database session.
        user (UserCreate): The user data to create.

    Returns:
        User: The newly created user in the database.
    """
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        hashed_password=hashed_password,
        email=user.email,
        designation=user.designation)
    db_session.add(db_user)
    db_session.commit()
    db_session.refresh(db_user)
    return db_user


def delete_user(db_session: Session, user_id: int):
    """
    Deletes a user from the database.

    Args:
        db (Session): The database session.
        user_id (int): The ID of the user to delete.

    Returns:
        User or None: The deleted user object if successful, None otherwise.
    """
    db_user = get_user(db_session, user_id=user_id)
    if db_user:
        db_session.query(models.Rating).filter(models.Rating.user_id == user_id).update({"user_id": None})
        db_session.commit()
        db_session.delete(db_user)
        db_session.commit()
    return db_user
