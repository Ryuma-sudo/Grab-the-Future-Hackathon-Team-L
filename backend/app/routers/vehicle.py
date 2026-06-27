from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import get_db
from app.models.station import Station
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleRead, VehicleStatusUpdate, VehicleUpdate


router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


def ensure_station_exists(db: Session, station_id: int | None):
    if station_id is None:
        return
    station = db.get(Station, station_id)
    if not station or not station.is_active:
        raise HTTPException(status_code=404, detail="Station not found or inactive")


@router.post("/", response_model=VehicleRead, status_code=status.HTTP_201_CREATED)
def create_vehicle(payload: VehicleCreate, db: Session = Depends(get_db)):
    existing_vehicle = db.query(Vehicle).filter(Vehicle.code == payload.code).first()
    if existing_vehicle:
        raise HTTPException(status_code=400, detail="Vehicle code already exists")

    ensure_station_exists(db, payload.station_id)
    vehicle = Vehicle(**payload.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.get("/", response_model=list[VehicleRead])
def list_vehicles(db: Session = Depends(get_db)):
    return db.query(Vehicle).order_by(Vehicle.id.desc()).all()


@router.get("/{vehicle_id}", response_model=VehicleRead)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.put("/{vehicle_id}", response_model=VehicleRead)
def update_vehicle(vehicle_id: int, payload: VehicleUpdate, db: Session = Depends(get_db)):
    vehicle = db.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    data = payload.model_dump(exclude_unset=True)
    ensure_station_exists(db, data.get("station_id"))
    for field, value in data.items():
        setattr(vehicle, field, value)

    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.put("/{vehicle_id}/status", response_model=VehicleRead)
def update_vehicle_status(vehicle_id: int, payload: VehicleStatusUpdate, db: Session = Depends(get_db)):
    vehicle = db.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    ensure_station_exists(db, payload.station_id)
    vehicle.status = payload.status
    if payload.station_id is not None:
        vehicle.station_id = payload.station_id
    if payload.battery_level is not None:
        vehicle.battery_level = payload.battery_level

    db.commit()
    db.refresh(vehicle)
    return vehicle
