from fastapi import FastAPI

from app.config import Base, engine
from app.models import station, user, vehicle
from app.routers import station as station_router
from app.routers import user as user_router
from app.routers import vehicle as vehicle_router
from app.routers import routing as ai_router


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Grab Last-Mile E-Motorbike API",
    description="Backend API for metro/bus + e-motorbike last-mile rental service.",
    version="0.1.0",
)

app.include_router(user_router.router)
app.include_router(vehicle_router.router)
app.include_router(station_router.router)
app.include_router(ai_router.router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "grab-last-mile-api"}
