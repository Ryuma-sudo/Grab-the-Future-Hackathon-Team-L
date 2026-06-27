from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class StationBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    address: str = Field(..., min_length=3, max_length=255)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    capacity: int = Field(default=10, ge=1)


class StationCreate(StationBase):
    pass


class StationUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    address: Optional[str] = Field(default=None, min_length=3, max_length=255)
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    capacity: Optional[int] = Field(default=None, ge=1)
    is_active: Optional[bool] = None


class StationRead(StationBase):
    id: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class StationAvailability(StationRead):
    total_vehicle_count: int
    available_vehicle_count: int
    average_battery_level: Optional[float]
