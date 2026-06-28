const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://grab-the-future-hackathon-team-l.onrender.com';

export interface ApiUser {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  created_at: string;
}

export interface LoginResponse {
  message: string;
  user: ApiUser;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  phone?: string | null;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ApiStation {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  is_active: boolean;
  total_vehicle_count?: number;
  available_vehicle_count?: number;
  average_battery_level?: number | null;
}

export type ApiVehicleStatus = 'ready' | 'rented' | 'charging' | 'maintenance';

export interface ApiVehicle {
  id: number;
  code: string;
  station_id: number | null;
  battery_level: number;
  estimated_range_km: number;
  status: ApiVehicleStatus;
}

export type ApiTripStatus = 'ongoing' | 'completed' | 'cancelled';

export interface TripPriceBreakdown {
  first_5_minutes_fee_vnd: number;
  included_minutes: number;
  extra_minutes: number;
  extra_minute_fee_vnd: number;
  extra_fee_vnd: number;
  total_cost_vnd: number;
}

export interface ApiTrip {
  id: number;
  user_id: number;
  vehicle_id: number;
  start_station_id: number;
  end_station_id: number | null;
  status: ApiTripStatus;
  start_time: string;
  end_time: string | null;
  distance_km: number | null;
  duration_minutes: number | null;
  cost_vnd: number | null;
  battery_before_trip: number | null;
  battery_after_trip: number | null;
  battery_used_percent: number | null;
  user: ApiUser;
  vehicle: ApiVehicle;
  start_station: ApiStation;
  end_station: ApiStation | null;
  price_breakdown: TripPriceBreakdown | null;
}

export interface TripStartPayload {
  user_id: number;
  vehicle_id: number;
  start_station_id: number;
  estimated_distance_km?: number;
}

export interface TripEndPayload {
  end_station_id: number;
  distance_km: number;
}

export interface CoordinatePayload {
  latitude: number;
  longitude: number;
}

export interface RouteStationPayload {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export interface RoutePayload {
  origin: CoordinatePayload;
  destination: CoordinatePayload;
  battery_level: number;
  stations: RouteStationPayload[];
}

export interface RouteGeometry {
  type: 'LineString';
  coordinates: [number, number][];
}

export interface RouteResponse {
  status: 'ok' | 'low_battery' | 'error';
  distance_km?: number;
  duration_min?: number;
  route_summary?: string;
  geometry?: RouteGeometry;
  suggestion?: string;
  station?: RouteStationPayload;
  message?: string;
}

export interface RecommendStartStationPayload {
  origin: CoordinatePayload;
  destination: CoordinatePayload;
  max_access_distance_m?: number;
  max_expected_duration_min?: number;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let message = `API error ${response.status}`;
    try {
      const data = await response.json();
      if (typeof data.detail === 'string') {
        message = data.detail;
      }
    } catch {
      // Keep the status-based fallback message.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function loginUser(payload: LoginPayload) {
  return apiFetch<LoginResponse>('/users/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function registerUser(payload: RegisterPayload) {
  return apiFetch<ApiUser>('/users/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getStations() {
  return apiFetch<ApiStation[]>('/stations/');
}

export function getStation(stationId: number) {
  return apiFetch<ApiStation>(`/stations/${stationId}`);
}

export function getStationVehicles(stationId: number) {
  return apiFetch<ApiVehicle[]>(`/stations/${stationId}/vehicles`);
}

export function getVehicle(vehicleId: number) {
  return apiFetch<ApiVehicle>(`/vehicles/${vehicleId}`);
}

export function startTrip(payload: TripStartPayload) {
  return apiFetch<ApiTrip>('/trips/start', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function endTrip(tripId: number, payload: TripEndPayload) {
  return apiFetch<ApiTrip>(`/trips/${tripId}/end`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getTrip(tripId: number) {
  return apiFetch<ApiTrip>(`/trips/${tripId}`);
}

export function getRoute(payload: RoutePayload) {
  return apiFetch<RouteResponse>('/routing', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function recommendStartStation(payload: RecommendStartStationPayload) {
  return apiFetch<ApiStation>('/recommend/start-station', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

export function calculateDistanceMeters(
  from: CoordinatePayload,
  to: CoordinatePayload,
): number {
  const earthRadiusM = 6_371_000;
  const phi1 = (from.latitude * Math.PI) / 180;
  const phi2 = (to.latitude * Math.PI) / 180;
  const deltaPhi = ((to.latitude - from.latitude) * Math.PI) / 180;
  const deltaLambda = ((to.longitude - from.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;

  return earthRadiusM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function estimateTripCost(durationMinutes: number): number {
  const firstFiveMinutesFee = 7000;
  const extraMinuteFee = 1000;
  const extraMinutes = Math.max(0, Math.ceil(durationMinutes) - 5);
  return firstFiveMinutesFee + extraMinutes * extraMinuteFee;
}
