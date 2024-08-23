"""
Authentication and Authorization Endpoints for FastAPI.

This module provides the following endpoints:
- `POST /token`: Login and generate an access token.
- `GET /users/me`: Retrieve the current logged-in user's information.

It also includes functions for:
- Password hashing and verification.
- User authentication.
- JWT token creation and validation.
"""

import os
import logging
from datetime import datetime, timedelta, timezone
from typing import Union, Annotated

from dotenv import load_dotenv
import jwt
from jwt.exceptions import InvalidTokenError
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import TokenData
from app import schemas
import app.crud.users as crud


router = APIRouter()

logger = logging.getLogger(__name__)

load_dotenv()

# To generate SECRET_KEY run: openssl rand -hex 32
SECRET_KEY = os.getenv("SECRET_KEY")

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 300

PWD_CONTEXT = CryptContext(schemes=["bcrypt"], deprecated="auto")

OAUTH2_SCHEME = OAuth2PasswordBearer(tokenUrl="token")


def verify_password(plain_password, hashed_password):
    """
    Verify if a plain password matches a hashed password.

    Args:
        plain_password (str): The plain password to be verified.
        hashed_password (str): The hashed password to be compared against.

    Returns:
        bool: True if the plain password matches the hashed password, False otherwise.
    """
    return PWD_CONTEXT.verify(plain_password, hashed_password)


def get_password_hash(password):
    """
    Generates a hash of the provided password using the password hashing context.

    Args:
        password (str): The password to be hashed.

    Returns:
        str: The hashed password.
    """
    return PWD_CONTEXT.hash(password)


def authenticate_user(username: str, password: str, db_session: Session):
    """
    Authenticates a user based on the provided username and password.

    Parameters:
        username (str): The username of the user to authenticate.
        password (str): The password of the user to authenticate.
        db (Session): The database session to query user information.

    Returns:
        db_user: The authenticated user if successful, False otherwise.
    """

    try:
        db_user = crud.get_user_by_username(db_session, username=username)
        if not db_user:
            logger.warning("No user found with username: %s", username)
            return False
        if not verify_password(password, db_user.hashed_password):
            logger.warning(
                "Password verification failed for user: %s", username)
            return False
        logger.info("User %s authenticated successfully", username)
        return db_user
    except Exception as error:
        logger.error("Error authenticating user %s: %s", username, error)
        return False


def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    """
    Creates an access token with the given data and optional expiration time.

    Args:
        data (dict): The data to be encoded into the token.
        expires_delta (Union[timedelta, None], optional): The expiration time of the token.
        If None, the token will expire after 7 days. Defaults to None.

    Returns:
        str: The encoded JWT access token.

    """

    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    try:
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        logger.info("JWT token created successfully.")
        return encoded_jwt
    except Exception as error:
        logger.error("Error creating JWT token: %s", error)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while creating the JWT token.",
        )


async def get_current_user(
                token: str = Depends(OAUTH2_SCHEME),
                db_session: Session = Depends(get_db)):
    """
    Retrieves the current user based on the provided JWT token.

    Args:
        token (str): The JWT token for authentication.
        db_session: The database session to query user information.

    Returns:
        user: The authenticated user if the token is valid.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            logger.warning("JWT payload missing 'sub' field.")
            raise credentials_exception
        token_data = TokenData(username=username)
    except InvalidTokenError as exc:
        logger.error("Invalid token: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    user = crud.get_user_by_username(db_session, username=token_data.username)
    if user is None:
        logger.warning("User not found for username: %s", token_data.username)
        raise credentials_exception
    return user


@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(
                form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                db_session: Session = Depends(get_db),
):
    """
    Endpoint for logging in a user and generating an access token.

    Args:
        form_data: The form data containing the username and password.
        db_session: The database session.

    Returns:
        Token: The access token with the username as the subject.
    """

    user = authenticate_user(
        form_data.username, form_data.password, db_session)
    if not user:
        logger.warning("Login failed for username: %s", form_data.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    logger.info("Login successful for username: %s", form_data.username)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    logger.info("Access token created successfully for user: %s", user.username)
    return {"access_token": access_token, "token_type": "bearer"}
