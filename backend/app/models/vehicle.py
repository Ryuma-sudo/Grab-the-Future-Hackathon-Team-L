from enum import Enum

from sqlalchemy import Column, Float, ForeignKey, Integer, String
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import relationship

from app.config import Base


class VehicleStatus(str, Enum):
    READY = "ready"
    RENTED = "rented"
    CHARGING = "charging"
    MAINTENANCE = "maintenance"


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=True)
    battery_level = Column(Float, nullable=False, default=100.0)
    estimated_range_km = Column(Float, nullable=False, default=45.0)
    status = Column(SqlEnum(VehicleStatus), nullable=False, default=VehicleStatus.READY)

    station = relationship("Station", back_populates="vehicles")
