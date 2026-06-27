from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, computed_field

from app.models.trip import TripStatus
from app.schemas.station import StationRead
from app.schemas.user import UserRead
from app.schemas.vehicle import VehicleRead


class TripStart(BaseModel):
    user_id: int
    vehicle_id: int
    start_station_id: int
    estimated_distance_km: Optional[float] = Field(default=None, ge=0)


class TripEnd(BaseModel):
    end_station_id: int
    distance_km: float = Field(..., ge=0)


class TripPriceBreakdown(BaseModel):
    first_5_minutes_fee_vnd: float
    included_minutes: int
    extra_minutes: int
    extra_minute_fee_vnd: float
    extra_fee_vnd: float
    total_cost_vnd: float


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
    battery_before_trip: Optional[float]
    battery_after_trip: Optional[float]
    battery_used_percent: Optional[float]
    user: UserRead
    vehicle: VehicleRead
    start_station: StationRead
    end_station: Optional[StationRead]

    @computed_field
    @property
    def price_breakdown(self) -> Optional[TripPriceBreakdown]:
        if self.duration_minutes is None or self.cost_vnd is None:
            return None

        first_5_minutes_fee = 7_000
        extra_minute_fee = 1_000
        extra_minutes = max(0, self.duration_minutes - 5)
        extra_fee = extra_minutes * extra_minute_fee

        return TripPriceBreakdown(
            first_5_minutes_fee_vnd=first_5_minutes_fee,
            included_minutes=5,
            extra_minutes=extra_minutes,
            extra_minute_fee_vnd=extra_minute_fee,
            extra_fee_vnd=extra_fee,
            total_cost_vnd=self.cost_vnd,
        )

    model_config = ConfigDict(from_attributes=True)

