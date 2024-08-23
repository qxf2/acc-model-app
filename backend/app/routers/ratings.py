"""
This module defines the API endpoints related to ratings.

The endpoints are:
- `GET /rating-options/`: Returns a list of rating values to be provided
    to the capabilities against the attributes.

"""

from typing import List
from fastapi import APIRouter

router = APIRouter(
    prefix="/",
    tags=["ratings"],
    responses={404: {"description": "Not found"}},
)

RATING_VALUES = ["Green", "Yellow", "Red", "N/A"]


@router.get("/rating-options/", response_model=List[str])
def read_rating_values():
    """
    Returns a list of possible rating values.
    """
    return RATING_VALUES
