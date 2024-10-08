"""
This module sets up the database connection and session for SQLAlchemy.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) # pylint: disable=invalid-name

def get_db():
    """
    Generator function that yields a SQLAlchemy SessionLocal instance.
    """
    database_session = SessionLocal()
    try:
        yield database_session
    finally:
        database_session.close()
