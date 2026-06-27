from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.trip import TripStatus


class TripStart(BaseModel):
    user_id: int
    vehicle_id: int
    start_station_id: int
    estimated_distance_km: Optional[float] = Field(default=None, ge=0)


class TripEnd(BaseModel):
    end_station_id: int
    distance_km: float = Field(..., ge=0)


class TripRead(BaseModel):
    id: int
    user_id: int
    vehicle_id: int
    start_station_id: int
    end_station_id: Optional[int]
    status: TripStatus
    start_time: datetime
    end_time: Optional[datetime]
    distance_km: Optional[float]
    duration_minutes: Optional[int]
    cost_vnd: Optional[float]

    model_config = ConfigDict(from_attributes=True)

