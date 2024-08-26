"""
This module defines the API endpoints related to users.

The endpoints are:
- `POST /users`: Creates a new user.
- `GET /users`: Retrieves a list of users.
- `GET /users/me`: Retrieves the current logged user.
- `GET /users/{user_id}`: Retrieves a user by its ID.
- `PUT /users/{user_id}`: Updates an existing user.
- `DELETE /users/{user_id}`: Deletes an existing user.

The endpoints use the `get_db` dependency to get a database session.
The endpoints use the `crud` module to perform the database operations.
"""

import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas
from app.crud import users as crud
from app.database import get_db
from app import models
from app.routers.security import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger(__name__)


@router.post("/", response_model=schemas.UserRead)
def create_user(user: schemas.UserCreate, db_session: Session = Depends(get_db)):
    """
    Creates a new user.

    Args:
        user: The user to create.
        db_session: The database session to use for the query.

    Returns:
        The newly created user.
    """

    try:
        existing_user = crud.get_user_by_username(
            db_session, username=user.username)
        if existing_user:
            logger.warning(
                "Attempt to create user with existing username: %s", user.username)
            raise HTTPException(
                status_code=400, detail="User with this username already exists")

        new_user = crud.create_user(db_session=db_session, user=user)
        logger.info("User created successfully: %s", user.username)
        return new_user
    except HTTPException as error:
        raise error
    except Exception as error:
        logger.error("Error occurred while creating user: %s", str(error))
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while creating the user") from error


@router.get("/", response_model=List[schemas.UserRead])
def read_users(limit: int = 100, db_session: Session = Depends(get_db)):
    """
    Retrieves a list of users.

    Args:
        skip: The number of users to skip before starting to return users.
        limit: The maximum number of users to return.
        db_session: The database session to use for the query.

    Returns:
        A list of users.
    """

    try:
        users = crud.get_users(db_session, limit=limit)
        logger.info("Retrieved %s users,", len(users))
        return users
    except Exception as error:
        logger.error("Error occurred while retrieving users: %s", str(error))
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while retrieving the users") from error


@router.get("/{user_id}", response_model=schemas.UserRead)
def read_user(user_id: int, db_session: Session = Depends(get_db)):
    """
    Retrieves a user by its ID.

    Args:
        user_id: The ID of the user to retrieve.
        db_session: The database session to use for the query.

    Returns:
        The user with the specified ID.
    """

    try:
        db_user = crud.get_user(db_session, user_id=user_id)
        if db_user is None:
            logger.warning("User not found with ID: %s", user_id)
            raise HTTPException(status_code=404, detail="User not found")

        logger.info("User retrieved successfully with ID: %s", user_id)
        return db_user
    except HTTPException as error:
        raise error
    except Exception as error:
        logger.error(
            "Error occurred while retrieving user by ID: %s, error: %s", user_id, str(error))
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while retrieving the user") from error


@router.delete("/{user_id}", response_model=schemas.UserRead)
def delete_user(user_id: int,
                db_session: Session = Depends(get_db),
                current_user: schemas.UserRead = Depends(get_current_user)):
    """
    Deletes an existing user by its ID.

    Args:
        user_id: The ID of the user to delete.
        db_session: The database session to use for the query.
        current_user: The current user. Depends(get_current_user).

    Returns:
        The deleted user.
    """

    try:
        db_user = crud.get_user(db_session, user_id=user_id)
        if db_user is None:
            logger.warning(
                "Attempt to delete non-existing user with ID: %s", user_id)
            raise HTTPException(status_code=404, detail="User not found")

        deleted_user = crud.delete_user(db_session, user_id=user_id)
        logger.info("User deleted successfully with ID by user %s: %s",
                    user_id, current_user.username)
        return deleted_user
    except HTTPException as error:
        raise error
    except Exception as error:
        logger.error(
            "Error occurred while deleting user with ID: %s, error: %s", user_id, str(error))
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while deleting the user") from error


@router.get("/users/me/", response_model=schemas.UserRead)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    """
    Retrieves the currently logged-in user.

    Args:
        current_user: The currently logged-in user, retrieved using the get_current_user dependency.

    Returns:
        The currently logged-in user details.
    """

    try:
        logger.info("Current user retrieved: %s", current_user.username)
        return current_user
    except Exception as error:
        logger.error(
            "Error occurred while retrieving current user: %s", str(error))
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while retrieving the current user") from error
