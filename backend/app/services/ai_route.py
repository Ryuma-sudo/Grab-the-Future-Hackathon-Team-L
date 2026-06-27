def station_recommendation_score(
    available_vehicle_count: int,
    average_battery_level: float | None,
    distance_to_station_km: float,
) -> float:
    availability_score = min(available_vehicle_count / 10, 1)
    battery_score = (average_battery_level or 0) / 100
    distance_score = max(0, 1 - distance_to_station_km / 3)
    return round(
        availability_score * 0.4
        + battery_score * 0.4
        + distance_score * 0.2,
        3,
    )

