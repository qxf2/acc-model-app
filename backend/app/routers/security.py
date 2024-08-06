import os
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from typing import Union, Annotated
import jwt
from jwt.exceptions import InvalidTokenError
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.crud import users
from app.database import get_db
from app.schemas import TokenData
import app.crud.users as crud
from fastapi.security import OAuth2PasswordRequestForm
from app import schemas


router = APIRouter()


load_dotenv()

# To generate SECRET_KEY run: openssl rand -hex 32
SECRET_KEY = os.getenv("SECRET_KEY")

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 300

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    """
    Verify if a plain password matches a hashed password.

    Args:
        plain_password (str): The plain password to be verified.
        hashed_password (str): The hashed password to be compared against.

    Returns:
        bool: True if the plain password matches the hashed password, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    """
    Generates a hash of the provided password using the password hashing context.

    Args:
        password (str): The password to be hashed.

    Returns:
        str: The hashed password.
    """
    return pwd_context.hash(password)


def authenticate_user(username: str, password: str, db: Session):
    """
    Authenticates a user based on the provided username and password.

    Parameters:
        username (str): The username of the user to authenticate.
        password (str): The password of the user to authenticate.
        db (Session): The database session to query user information.

    Returns:
        db_user: The authenticated user if successful, False otherwise.
    """
    db_user = crud.get_user_by_username(db, username=username)
    if not db_user:
        print("No user found with username: %s", username)
        return False
    if not verify_password(password, db_user.hashed_password):
        print("Password verification failed for user: %s", username)
        return False
    print("User %s authenticated successfully", username)
    return db_user


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
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        token_data = TokenData(username=username)
    except InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    user = crud.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db),
):
    """
    Endpoint for logging in a user and generating an access token.

    Args:
        form_data (OAuth2PasswordRequestForm): The form data containing the username and password.
        db (Session, optional): The database session. Defaults to Depends(get_db).

    Returns:
        Token: The access token with the username as the subject.
    """
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    print("Login successful for username: %s", form_data.username)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    print("Access token created:", access_token)
    return {"access_token": access_token, "token_type": "bearer"}