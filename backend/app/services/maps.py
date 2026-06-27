def estimate_trip_cost(duration_minutes: int) -> float:
    first_5_minutes_fee = 7_000
    extra_minute_fee = 1_000
    extra_minutes = max(0, duration_minutes - 5)
    return first_5_minutes_fee + extra_minutes * extra_minute_fee


def calculate_battery_usage_percent(distance_km: float, estimated_range_km: float) -> float:
    if estimated_range_km <= 0:
        return 100
    return round((distance_km / estimated_range_km) * 100, 2)


def has_enough_battery(battery_level: float, estimated_range_km: float, distance_km: float) -> bool:
    return battery_level - 5 >= calculate_battery_usage_percent(distance_km, estimated_range_km)


