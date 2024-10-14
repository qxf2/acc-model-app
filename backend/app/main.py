"""
This module initializes and configures the FastAPI application,
sets up logging, and defines the main entry point for the backend API.
"""

import logging
import os
import sys
import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from logging_config import setup_logging  # pylint: disable=wrong-import-position
from app.routers import (
    acc_models,
    attributes,
    capabilities,
    components,
    users,
    security,
    ratings,
    capabilities_assessments,
)

# Configure the root logger
setup_logging()

app = FastAPI()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logging.info("Starting application...")

origins = [
    "http://localhost",
    "http://localhost:3000",
    "https://acc-model-app.netlify.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """
    Root endpoint of the ACC model app.
    """
    return {"message": "This is an application for catpure ACC model for your projects"}


@app.middleware("http")
async def log_request_validation_error(request: Request, call_next):
    """
    Middleware to log validation errors and handle responses for invalid requests.
    Args:
        request (Request): The HTTP request object.
        call_next (Callable): A function that takes the request as a parameter
            and returns a response.

    Returns:
        JSONResponse: A response object, which may include validation error details 
        or a general internal server error message.
    """
    try:
        response = await call_next(request)
        return response
    except ValidationError as error:
        logging.error("Validation error: %s", error.json())
        return JSONResponse(status_code=422, content={"detail": error.errors()})
    except Exception as error:
        logging.error("Unexpected error: %s", str(error))
        return JSONResponse(
            status_code=500, content={"detail": "Internal server error"}
        )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception): # pylint: disable=unused-argument
    """
    Handles any unhandled exceptions that occur while processing a request.
    """
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )


app.include_router(acc_models.router)
app.include_router(attributes.router)
app.include_router(capabilities.router)
app.include_router(components.router)
app.include_router(users.router)
app.include_router(security.router)
app.include_router(ratings.router)
app.include_router(capabilities_assessments.router)

logger.info("Starting the backend...")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
