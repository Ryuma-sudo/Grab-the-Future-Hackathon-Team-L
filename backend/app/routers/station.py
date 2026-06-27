from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import get_db
from app.models.station import Station
from app.models.vehicle import Vehicle, VehicleStatus
from app.schemas.station import StationAvailability, StationCreate, StationRead, StationUpdate
from app.schemas.vehicle import VehicleRead


router = APIRouter(prefix="/stations", tags=["Stations"])


def build_station_availability(station: Station) -> StationAvailability:
    vehicles = station.vehicles
    total_vehicle_count = len(vehicles)
    ready_vehicles = [vehicle for vehicle in vehicles if vehicle.status == VehicleStatus.READY]
    average_battery = None
    if vehicles:
        average_battery = round(sum(vehicle.battery_level for vehicle in vehicles) / len(vehicles), 2)

    return StationAvailability(
        id=station.id,
        name=station.name,
        address=station.address,
        latitude=station.latitude,
        longitude=station.longitude,
        capacity=station.capacity,
        is_active=station.is_active,
        total_vehicle_count=total_vehicle_count,
        available_vehicle_count=len(ready_vehicles),
        average_battery_level=average_battery,
    )


@router.post("/", response_model=StationRead, status_code=status.HTTP_201_CREATED)
def create_station(payload: StationCreate, db: Session = Depends(get_db)):
    station = Station(**payload.model_dump())
    db.add(station)
    db.commit()
    db.refresh(station)
    return station


@router.get("/", response_model=list[StationAvailability])
def list_stations(db: Session = Depends(get_db)):
    stations = db.query(Station).order_by(Station.id.desc()).all()
    return [build_station_availability(station) for station in stations]


@router.get("/{station_id}", response_model=StationAvailability)
def get_station(station_id: int, db: Session = Depends(get_db)):
    station = db.get(Station, station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    return build_station_availability(station)


@router.put("/{station_id}", response_model=StationRead)
def update_station(station_id: int, payload: StationUpdate, db: Session = Depends(get_db)):
    station = db.get(Station, station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(station, field, value)

    db.commit()
    db.refresh(station)
    return station


@router.delete("/{station_id}")
def delete_station(station_id: int, db: Session = Depends(get_db)):
    station = db.get(Station, station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    station.is_active = False
    db.commit()
    return {"message": "Station deactivated successfully"}


@router.get("/{station_id}/vehicles", response_model=list[VehicleRead])
def list_station_vehicles(station_id: int, db: Session = Depends(get_db)):
    station = db.get(Station, station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    return db.query(Vehicle).filter(Vehicle.station_id == station_id).all()
