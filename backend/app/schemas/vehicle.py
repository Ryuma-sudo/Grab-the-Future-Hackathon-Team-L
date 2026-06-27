from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.vehicle import VehicleStatus


class VehicleBase(BaseModel):
    code: str = Field(..., min_length=2, max_length=50)
    station_id: Optional[int] = None
    battery_level: float = Field(default=100.0, ge=0, le=100)
    estimated_range_km: float = Field(default=45.0, ge=0)
    status: VehicleStatus = VehicleStatus.READY


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    code: Optional[str] = Field(default=None, min_length=2, max_length=50)
    station_id: Optional[int] = None
    battery_level: Optional[float] = Field(default=None, ge=0, le=100)
    estimated_range_km: Optional[float] = Field(default=None, ge=0)
    status: Optional[VehicleStatus] = None


class VehicleStatusUpdate(BaseModel):
    status: VehicleStatus
    station_id: Optional[int] = None
    battery_level: Optional[float] = Field(default=None, ge=0, le=100)


class VehicleRead(VehicleBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
