from typing import Any, Dict, List

import requests


OSRM_URL = "http://router.project-osrm.org"


def calculate_route(
    start_lat: float,
    start_lng: float,
    end_lat: float,
    end_lng: float,
    battery_level: int,
    stations: List[Dict[str, Any]],
) -> Dict[str, Any]:
    route_url = (
        f"{OSRM_URL}/route/v1/driving/"
        f"{start_lng},{start_lat};{end_lng},{end_lat}"
        "?overview=full&geometries=geojson"
    )

    try:
        response = requests.get(route_url, timeout=10)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException:
        return {"status": "error", "message": "Route service is unavailable"}

    if "routes" not in data or not data["routes"]:
        return {"status": "error", "message": "Route not found"}

    route_info = data["routes"][0]
    distance_km = route_info["distance"] / 1000
    duration_min = route_info["duration"] / 60

    if battery_level < 30 and stations:
        nearest_station = min(
            stations,
            key=lambda station: abs(station["latitude"] - start_lat)
            + abs(station["longitude"] - start_lng),
        )
        return {
            "status": "low_battery",
            "suggestion": f"Go to station {nearest_station['name']}",
            "station": nearest_station,
        }

    return {
        "status": "ok",
        "distance_km": round(distance_km, 2),
        "duration_min": round(duration_min, 1),
        "route_summary": f"{round(distance_km, 2)} km, {round(duration_min, 1)} minutes",
        "geometry": route_info["geometry"],
    }
