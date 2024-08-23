import logging
import os
import sys
import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(base_dir)

from app.routers import acc_models, attributes, capabilities, components, users, security, ratings
from app.database import Base, engine
from logging_config import setup_logging

# Configure the root logger
setup_logging()

app = FastAPI()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logging.info("Starting application...")

origins = ["http://localhost", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "This is an application for catpure ACC model for your projects"}

@app.middleware("http")
async def log_request_validation_error(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except ValidationError as e:
        logging.error(f"Validation error: {e.json()}")
        return JSONResponse(status_code=422, content={"detail": e.errors()})
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."}
    )

app.include_router(acc_models.router)
app.include_router(attributes.router)
app.include_router(capabilities.router)
app.include_router(components.router)
app.include_router(users.router)
app.include_router(security.router)
app.include_router(ratings.router)

Base.metadata.create_all(bind=engine)

logger.info("Starting the backend...")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)