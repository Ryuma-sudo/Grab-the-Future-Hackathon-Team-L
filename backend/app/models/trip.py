from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import relationship

from app.config import Base


class TripStatus(str, Enum):
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    start_station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    end_station_id = Column(Integer, ForeignKey("stations.id"), nullable=True)
    status = Column(SqlEnum(TripStatus), nullable=False, default=TripStatus.ONGOING)
    start_time = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    distance_km = Column(Float, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    cost_vnd = Column(Float, nullable=True)

    user = relationship("User", back_populates="trips")
    vehicle = relationship("Vehicle", back_populates="trips")
    start_station = relationship("Station", foreign_keys=[start_station_id])
    end_station = relationship("Station", foreign_keys=[end_station_id])
