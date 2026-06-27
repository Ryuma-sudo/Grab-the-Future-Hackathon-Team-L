from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.service.routing import calculate_route

router = APIRouter( tags=["Routing"])

class Station(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float

class RouteRequest(BaseModel):
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    battery_level: int
    stations: List[Station]

@router.post("/routing")
def ai_route(req: RouteRequest):
    result = calculate_route(
        req.start_lat, req.start_lng,
        req.end_lat, req.end_lng,
        req.battery_level,
        [s.dict() for s in req.stations]
    )
    return result
