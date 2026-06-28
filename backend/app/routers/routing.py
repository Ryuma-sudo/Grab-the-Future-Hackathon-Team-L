import math
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import get_db
from app.models.station import Station as StationModel
from app.models.vehicle import VehicleStatus
from app.services.maps import calculate_battery_usage_percent, has_enough_battery
from app.services.routing import calculate_route
from app.services.score_routing import (
    compute_access_score,
    compute_availability_score,
    compute_battery_score,
    compute_route_score,
    compute_start_station_score,
)

router = APIRouter()


class RouteStation(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float


class Coordinate(BaseModel):
    latitude: float
    longitude: float


class RouteRequest(BaseModel):
    origin: Coordinate
    destination: Coordinate
    battery_level: int
    stations: List[RouteStation]


class StartStationRecommendationRequest(BaseModel):
    origin: Coordinate
    destination: Coordinate
    max_access_distance_m: float = 1000
    max_expected_duration_min: float = 30


class RecommendedStartStation(BaseModel):
    id: int
    name: str
    address: str
    latitude: float
    longitude: float


def calculate_distance_m(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    earth_radius_m = 6_371_000
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)

    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    return earth_radius_m * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@router.post("/routing")
def ai_route(req: RouteRequest):
    result = calculate_route(
        req.origin.latitude, req.origin.longitude,
        req.destination.latitude, req.destination.longitude,
        req.battery_level,
        [station.model_dump() for station in req.stations],
    )
    return result


@router.post("/recommend/start-station", response_model=RecommendedStartStation)
def recommend_start_station(
    req: StartStationRecommendationRequest,
    db: Session = Depends(get_db),
):
    stations = db.query(StationModel).filter(StationModel.is_active.is_(True)).all()
    candidates = []

    for station in stations:
        ready_vehicles = [
            vehicle for vehicle in station.vehicles if vehicle.status == VehicleStatus.READY
        ]
        if not ready_vehicles:
            continue

        distance_to_station_m = calculate_distance_m(
            req.origin.latitude,
            req.origin.longitude,
            station.latitude,
            station.longitude,
        )
        if distance_to_station_m > req.max_access_distance_m:
            continue

        selected_vehicle = max(ready_vehicles, key=lambda vehicle: vehicle.battery_level)
        route = calculate_route(
            station.latitude,
            station.longitude,
            req.destination.latitude,
            req.destination.longitude,
            100,
            [],
        )
        if route.get("status") != "ok":
            continue

        route_distance_km = route["distance_km"]
        route_duration_min = route["duration_min"]
        battery_usage_percent = calculate_battery_usage_percent(
            route_distance_km,
            selected_vehicle.estimated_range_km,
        )
        battery_after_trip_percent = round(
            selected_vehicle.battery_level - battery_usage_percent,
            2,
        )
        enough_battery = has_enough_battery(
            selected_vehicle.battery_level,
            selected_vehicle.estimated_range_km,
            route_distance_km,
        )

        availability_score = compute_availability_score()
        access_score = compute_access_score(distance_to_station_m, req.max_access_distance_m)
        battery_score = compute_battery_score(battery_after_trip_percent)
        route_score = compute_route_score(route_duration_min, req.max_expected_duration_min)
        total_score = compute_start_station_score(
            availability_flag=len(ready_vehicles) > 0,
            battery_flag=enough_battery,
            availability_score=availability_score,
            access_score=access_score,
            battery_score=battery_score,
            route_score=route_score,
        )

        if enough_battery:
            candidates.append((total_score, station))

    candidates.sort(key=lambda candidate: candidate[0], reverse=True)

    if not candidates:
        raise HTTPException(
            status_code=404,
            detail="No reachable station with ready vehicle and enough battery was found",
        )

    best_station = candidates[0][1]
    return RecommendedStartStation(
        id=best_station.id,
        name=best_station.name,
        address=best_station.address,
        latitude=best_station.latitude,
        longitude=best_station.longitude,
    )
