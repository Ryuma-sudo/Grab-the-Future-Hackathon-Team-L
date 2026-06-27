from datetime import datetime, timezone
from math import ceil

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import get_db
from app.models.station import Station
from app.models.trip import Trip, TripStatus
from app.models.user import User
from app.models.vehicle import Vehicle, VehicleStatus
from app.schemas.trip import TripEnd, TripRead, TripStart
from app.services.maps import calculate_battery_usage_percent, estimate_trip_cost, has_enough_battery


router = APIRouter(prefix="/trips", tags=["Trips"])


@router.post("/start", response_model=TripRead, status_code=status.HTTP_201_CREATED)
def start_trip(payload: TripStart, db: Session = Depends(get_db)):
    user = db.get(User, payload.user_id)
    vehicle = db.get(Vehicle, payload.vehicle_id)
    station = db.get(Station, payload.start_station_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not station or not station.is_active:
        raise HTTPException(status_code=404, detail="Start station not found or inactive")
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if vehicle.status != VehicleStatus.READY:
        raise HTTPException(status_code=400, detail="Vehicle is not ready")
    if vehicle.station_id != payload.start_station_id:
        raise HTTPException(status_code=400, detail="Vehicle is not at the selected start station")
    if payload.estimated_distance_km is not None and not has_enough_battery(
        vehicle.battery_level,
        vehicle.estimated_range_km,
        payload.estimated_distance_km,
    ):
        raise HTTPException(status_code=400, detail="Vehicle battery is not enough for this route")

    trip = Trip(
        user_id=payload.user_id,
        vehicle_id=payload.vehicle_id,
        start_station_id=payload.start_station_id,
        battery_before_trip=vehicle.battery_level,
    )
    vehicle.status = VehicleStatus.RENTED
    vehicle.station_id = None

    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


@router.post("/{trip_id}/end", response_model=TripRead)
def end_trip(trip_id: int, payload: TripEnd, db: Session = Depends(get_db)):
    trip = db.get(Trip, trip_id)
    end_station = db.get(Station, payload.end_station_id)

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.status != TripStatus.ONGOING:
        raise HTTPException(status_code=400, detail="Trip is not ongoing")
    if not end_station or not end_station.is_active:
        raise HTTPException(status_code=404, detail="End station not found or inactive")

    end_time = datetime.now(timezone.utc)
    start_time = trip.start_time
    if start_time.tzinfo is None:
        start_time = start_time.replace(tzinfo=timezone.utc)

    duration_seconds = (end_time - start_time).total_seconds()
    duration_minutes = max(1, ceil(duration_seconds / 60))
    cost_vnd = estimate_trip_cost(duration_minutes)

    trip.end_station_id = payload.end_station_id
    trip.end_time = end_time
    trip.distance_km = payload.distance_km
    trip.duration_minutes = duration_minutes
    trip.cost_vnd = cost_vnd
    trip.status = TripStatus.COMPLETED

    vehicle = trip.vehicle
    vehicle.status = VehicleStatus.READY
    vehicle.station_id = payload.end_station_id
    battery_usage = calculate_battery_usage_percent(payload.distance_km, vehicle.estimated_range_km)
    vehicle.battery_level = max(0, round(vehicle.battery_level - battery_usage, 2))
    trip.battery_used_percent = battery_usage
    trip.battery_after_trip = vehicle.battery_level

    db.commit()
    db.refresh(trip)
    return trip


@router.get("/", response_model=list[TripRead])
def list_trips(db: Session = Depends(get_db)):
    return db.query(Trip).order_by(Trip.id.desc()).all()


@router.get("/users/{user_id}", response_model=list[TripRead])
def list_user_trips(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return db.query(Trip).filter(Trip.user_id == user_id).order_by(Trip.id.desc()).all()


@router.get("/{trip_id}", response_model=TripRead)
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip
