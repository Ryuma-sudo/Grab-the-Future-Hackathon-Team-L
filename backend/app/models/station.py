from sqlalchemy import Boolean, Column, Float, Integer, String
from sqlalchemy.orm import relationship

from app.config import Base


class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity = Column(Integer, nullable=False, default=10)
    is_active = Column(Boolean, nullable=False, default=True)

    vehicles = relationship("Vehicle", back_populates="station")
