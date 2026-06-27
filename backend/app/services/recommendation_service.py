from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.station import Station
from app.models.vehicle import Vehicle

from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
)

from app.services.routing import calculate_route


class RecommendationService:

    def recommend_route(
        self,
        payload: RecommendationRequest,
        db: Session,
    ) -> RecommendationResponse:

        # -----------------------------
        # 1. Lấy xe
        # -----------------------------
        vehicle = db.get(Vehicle, payload.vehicle_id)

        if vehicle is None:
            raise HTTPException(
                status_code=404,
                detail="Vehicle not found",
            )

        # -----------------------------
        # 2. Lấy danh sách trạm
        # -----------------------------
        stations = db.query(Station).all()

        station_data = [
            {
                "id": station.id,
                "name": station.name,
                "latitude": station.latitude,
                "longitude": station.longitude,
            }
            for station in stations
        ]

        # -----------------------------
        # 3. Gọi OSRM
        # -----------------------------
        route = calculate_route(
            start_lat=payload.origin.latitude,
            start_lng=payload.origin.longitude,
            end_lat=payload.destination.latitude,
            end_lng=payload.destination.longitude,
            battery_level=int(vehicle.battery_level),
            stations=station_data,
        )

        # -----------------------------
        # Nếu pin quá yếu
        # -----------------------------
        if route["status"] != "ok":

            raise HTTPException(
                status_code=400,
                detail=route,
            )

        # -----------------------------
        # 4. Battery Prediction
        # -----------------------------
        battery_before = vehicle.battery_level

        estimated_usage = route["distance_km"] * 2

        battery_after = max(
            0,
            battery_before - estimated_usage,
        )

        # -----------------------------
        # 5. AI Score
        # -----------------------------
        score = 100

        reasons = []

        if battery_after > 50:
            score += 5
            reasons.append("Enough battery for the trip")

        elif battery_after < 20:
            score -= 20
            reasons.append("Battery will be low after arrival")

        if route["distance_km"] < 5:
            score += 5
            reasons.append("Ideal distance for e-bike")

        if route["duration_min"] < 15:
            score += 5
            reasons.append("Fast travel time")

        score = min(score, 100)

        # -----------------------------
        # 6. Eco Report
        # -----------------------------
        co2_saved = round(
            route["distance_km"] * 0.192,
            2,
        )

        # -----------------------------
        # 7. Return
        # -----------------------------
        return RecommendationResponse(
            score=score,
            estimated_distance=route["distance_km"],
            estimated_duration=route["duration_min"],
            battery_before=battery_before,
            battery_after=battery_after,
            co2_saved=co2_saved,
            recommendation="AI Recommended Route",
            reasons=reasons,
            geometry=route["geometry"],
        )