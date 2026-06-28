def clamp_score(value: float) -> float:
    return max(0.0, min(1.0, value))


def compute_availability_score(model_score: float | None = None) -> float:
    """
    Placeholder for a future availability prediction model.

    Later this can be replaced by a model such as Random Forest using features like
    time of day, weekday, station history, nearby events, and weather.
    """
    if model_score is not None:
        return clamp_score(model_score)
    return 0.75


def compute_access_score(distance_to_station_m: float, max_access_distance_m: float) -> float:
    if max_access_distance_m <= 0:
        return 0.0
    return clamp_score(1 - distance_to_station_m / max_access_distance_m)


def compute_battery_score(battery_after_trip_percent: float) -> float:
    return clamp_score(battery_after_trip_percent / 100)


def compute_route_score(duration_min: float, max_expected_duration_min: float = 30) -> float:
    if max_expected_duration_min <= 0:
        return 0.0
    return clamp_score(1 - duration_min / max_expected_duration_min)


def compute_start_station_score(
    availability_flag: bool,
    battery_flag: bool,
    availability_score: float,
    access_score: float,
    battery_score: float,
    route_score: float,
) -> float:
    if not availability_flag or not battery_flag:
        return 0.0

    score = (
        30 * availability_score
        + 25 * access_score
        + 25 * battery_score
        + 20 * route_score
    )
    return round(score, 2)
