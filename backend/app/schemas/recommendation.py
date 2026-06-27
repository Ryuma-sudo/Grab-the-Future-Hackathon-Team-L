from typing import Any

from pydantic import BaseModel


class Coordinate(BaseModel):
    latitude: float
    longitude: float


class RecommendationRequest(BaseModel):
    origin: Coordinate
    destination: Coordinate
    vehicle_id: int


class RecommendationResponse(BaseModel):
    score: float

    estimated_distance: float
    estimated_duration: float

    battery_before: float
    battery_after: float

    co2_saved: float

    recommendation: str

    reasons: list[str]

    geometry: Any