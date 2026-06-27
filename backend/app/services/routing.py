import requests
from typing import Dict, Any, List

OSRM_URL = "http://router.project-osrm.org"  # public OSRM server

def calculate_route(start_lat: float, start_lng: float,
                    end_lat: float, end_lng: float,
                    battery_level: int,
                    stations: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    AI định tuyến với OSM + OSRM:
    - Tính route từ điểm A → B
    - Nếu pin yếu, gợi ý trạm gần nhất
    """

    # 1. Gọi OSRM để lấy route
    route_url = f"{OSRM_URL}/route/v1/driving/{start_lng},{start_lat};{end_lng},{end_lat}?overview=full&geometries=geojson"
    response = requests.get(route_url)
    data = response.json()

    if "routes" not in data or len(data["routes"]) == 0:
        return {"status": "error", "message": "Không tìm thấy route"}

    route_info = data["routes"][0]
    distance_km = route_info["distance"] / 1000
    duration_min = route_info["duration"] / 60

    # 2. Kiểm tra pin
    if battery_level < 30:
        # Gợi ý trạm gần nhất (theo khoảng cách Euclidean đơn giản)
        nearest_station = min(
            stations,
            key=lambda s: abs(s["latitude"] - start_lat) + abs(s["longitude"] - start_lng)
        )
        return {
            "status": "low_battery",
            "suggestion": f"Đi tới trạm {nearest_station['name']}",
            "station": nearest_station
        }

    # 3. Trả về route
    return {
        "status": "ok",
        "distance_km": round(distance_km, 2),
        "duration_min": round(duration_min, 1),
        "route_summary": f"{round(distance_km,2)} km, {round(duration_min,1)} phút",
        "geometry": route_info["geometry"]  # polyline để vẽ trên Leaflet
    }
