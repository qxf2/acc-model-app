from fastapi import APIRouter
from typing import List

router = APIRouter(
    prefix="/ratings",
    tags=["ratings"],
    responses={404: {"description": "Not found"}},
)

RATING_VALUES = ["Green", "Yellow", "Red", "N/A"]


@router.get("/rating-options/", response_model=List[str])
def read_rating_values():
    return RATING_VALUES



