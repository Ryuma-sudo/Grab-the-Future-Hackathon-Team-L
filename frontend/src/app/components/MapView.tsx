'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Navigation, Zap, MapPin, X, ChevronRight, ArrowRight, Clock, Route } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ApiStation, FlowStep } from './LeafletMapComponent';
import { MOCK_STATIONS } from '../../lib/mockData';

const LeafletMap = dynamic(() => import('./LeafletMapComponent'), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

interface RouteInfo {
  distanceKm: number;
  durationMin: number;
  estimatedCost: number;
}

// Convert MOCK_STATIONS to ApiStation format for offline fallback
const FALLBACK_STATIONS: ApiStation[] = MOCK_STATIONS.map((s, i) => ({
  id: i + 1,
  name: s.name,
  address: s.address,
  latitude: s.lat,
  longitude: s.lng,
  capacity: s.totalVehicles,
  is_active: s.status !== 'closed',
  total_vehicle_count: s.totalVehicles,
  available_vehicle_count: s.availableVehicles,
  average_battery_level: null,
}));

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

async function fetchOsrmRoute(
  from: ApiStation,
  to: ApiStation,
): Promise<{ points: [number, number][]; distanceKm: number; durationMin: number }> {
  const url = `${OSRM_BASE}/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('OSRM error');
  const data = await res.json();
  const route = data.routes?.[0];
  if (!route) throw new Error('No route');

  // OSRM returns [lng, lat] — convert to Leaflet [lat, lng]
  const points: [number, number][] = (route.geometry.coordinates as [number, number][]).map(
    ([lng, lat]) => [lat, lng],
  );
  const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
  const durationMin = Math.round(route.duration / 60);
  return { points, distanceKm, durationMin };
}

export default function MapView() {
  const router = useRouter();
  const [stations, setStations] = useState<ApiStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<FlowStep>('idle');
  const [departureStation, setDepartureStation] = useState<ApiStation | null>(null);
  const [destinationStation, setDestinationStation] = useState<ApiStation | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  // Route state
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/stations`)
      .then((r) => r.json())
      .then((data: ApiStation[]) => {
        const active = data.filter((s) => s.is_active);
        setStations(active.length > 0 ? active : FALLBACK_STATIONS);
      })
      .catch(() => setStations(FALLBACK_STATIONS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true },
    );
  }, []);

  // Walk minutes from user → selected departure station
  const departureWalkMinutes = useMemo(() => {
    if (!departureStation) return null;
    if (userPosition) {
      const meters = haversineMeters(
        userPosition[0], userPosition[1],
        departureStation.latitude, departureStation.longitude,
      );
      return Math.max(1, Math.round(meters / 80));
    }
    return MOCK_STATIONS.find((s) => s.name === departureStation.name)?.walkMinutes ?? null;
  }, [departureStation, userPosition]);

  const handleStationClick = useCallback(
    async (station: ApiStation) => {
      if (step === 'picking-destination' && departureStation) {
        // Show route preview instead of navigating immediately
        setDestinationStation(station);
        setStep('route-preview');
        setRouteLoading(true);
        setRoutePoints([]);
        setRouteInfo(null);

        try {
          const { points, distanceKm, durationMin } = await fetchOsrmRoute(departureStation, station);
          setRoutePoints(points);
          // Estimate cost: duration by electric scooter (price per minute)
          const estimatedCost = durationMin * 1500;
          setRouteInfo({ distanceKm, durationMin, estimatedCost });
        } catch {
          // Fallback to straight-line estimate
          const meters = haversineMeters(
            departureStation.latitude, departureStation.longitude,
            station.latitude, station.longitude,
          );
          const distanceKm = Math.round((meters / 1000) * 10) / 10;
          const durationMin = Math.round(distanceKm * 4);
          setRoutePoints([
            [departureStation.latitude, departureStation.longitude],
            [station.latitude, station.longitude],
          ]);
          setRouteInfo({ distanceKm, durationMin, estimatedCost: durationMin * 1500 });
        } finally {
          setRouteLoading(false);
        }
        return;
      }

      if (step === 'route-preview') return; // map locked during preview

      if (departureStation?.id === station.id && step === 'departure-selected') {
        setDepartureStation(null);
        setStep('idle');
        return;
      }
      setDepartureStation(station);
      setDestinationStation(null);
      setStep('departure-selected');
    },
    [step, departureStation],
  );

  const handleChooseDeparture = () => setStep('choose-destination-prompt');
  const handleNoDestination = () =>
    router.push(`/vehicle-selection-rental?from=${departureStation?.id}`);
  const handleChooseDestination = () => setStep('picking-destination');
  const handleCancelPrompt = () => setStep('departure-selected');
  const handleCancelPickingDestination = () => setStep('choose-destination-prompt');

  const handleReset = () => {
    setDepartureStation(null);
    setDestinationStation(null);
    setRoutePoints([]);
    setRouteInfo(null);
    setStep('idle');
  };

  const handleBackToDestinationPick = () => {
    setDestinationStation(null);
    setRoutePoints([]);
    setRouteInfo(null);
    setStep('picking-destination');
  };

  const handleConfirmRoute = () => {
    router.push(
      `/vehicle-selection-rental?from=${departureStation?.id}&to=${destinationStation?.id}`,
    );
  };

  const handleRecenter = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition([pos.coords.latitude, pos.coords.longitude]);
        setRecenterTrigger((t) => t + 1);
      },
      () => {},
      { enableHighAccuracy: true },
    );
  };

  return (
    <div className="flex-1 relative overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* Leaflet Map */}
      <div className="absolute inset-0">
        {!loading && (
          <LeafletMap
            stations={stations}
            step={step}
            departureId={departureStation?.id}
            destinationId={destinationStation?.id}
            onStationClick={handleStationClick}
            userPosition={userPosition}
            recenterTrigger={recenterTrigger}
            routePoints={routePoints}
            routeLoading={routeLoading}
          />
        )}
        {loading && (
          <div className="flex items-center justify-center h-full bg-muted/30">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* ── DEPARTURE SELECTED card ── */}
      {step === 'departure-selected' && departureStation && (
        <div className="absolute bottom-24 left-4 right-4 z-[1000] fade-in-up">
          <div className="bg-card rounded-2xl shadow-card-lg p-3 border border-border">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{departureStation.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{departureStation.address}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleReset(); }}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X size={12} className="text-muted-foreground" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="text-center">
                <p className="text-base font-bold text-primary tabular-nums">
                  {departureStation.available_vehicle_count}
                </p>
                <p className="text-[9px] text-muted-foreground">xe có sẵn</p>
              </div>

              {departureWalkMinutes !== null && (
                <>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center">
                    <p className="text-base font-bold text-foreground tabular-nums">{departureWalkMinutes}</p>
                    <p className="text-[9px] text-muted-foreground">phút đi bộ</p>
                  </div>
                </>
              )}

              {departureStation.average_battery_level !== null && (
                <>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center">
                    <p className="text-base font-bold text-foreground tabular-nums">
                      {Math.round(departureStation.average_battery_level)}%
                    </p>
                    <p className="text-[9px] text-muted-foreground">pin TB</p>
                  </div>
                </>
              )}

              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-base font-bold text-foreground tabular-nums">
                  {departureStation.total_vehicle_count}
                </p>
                <p className="text-[9px] text-muted-foreground">tổng xe</p>
              </div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); handleChooseDeparture(); }}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-primary text-white rounded-xl text-[12px] font-semibold active:scale-95 transition-all duration-150"
            >
              <Zap size={12} fill="white" />
              Chọn trạm xuất phát
            </button>
          </div>
        </div>
      )}

      {/* ── CHOOSE DESTINATION PROMPT modal ── */}
      {step === 'choose-destination-prompt' && departureStation && (
        <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-black/30">
          <div className="bg-card rounded-2xl shadow-card-lg p-5 mx-6 w-full max-w-xs fade-in-up">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-bold text-foreground">Trạm xuất phát</p>
              <button onClick={handleCancelPrompt} className="p-1 rounded-lg hover:bg-muted transition-colors">
                <X size={14} className="text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-primary font-semibold mb-4 truncate">{departureStation.name}</p>
            <p className="text-xs text-muted-foreground mb-3">Bạn có muốn chọn trạm đến không?</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleChooseDestination}
                className="w-full flex items-center justify-between px-4 py-3 bg-secondary text-secondary-foreground rounded-xl text-sm font-semibold active:scale-95 transition-all duration-150"
              >
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-primary" />
                  <span>Chọn trạm đến</span>
                </div>
                <ChevronRight size={15} className="text-muted-foreground" />
              </button>
              <button
                onClick={handleNoDestination}
                className="w-full flex items-center justify-between px-4 py-3 bg-primary text-white rounded-xl text-sm font-semibold active:scale-95 transition-all duration-150"
              >
                <div className="flex items-center gap-2">
                  <Zap size={15} fill="white" />
                  <span>Không chọn trạm đến</span>
                </div>
                <ChevronRight size={15} className="text-white/70" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PICKING DESTINATION banner ── */}
      {step === 'picking-destination' && departureStation && (
        <div className="absolute top-16 left-4 right-4 z-[1000] fade-in-up">
          <div className="bg-card rounded-2xl shadow-card-lg p-3 border-2 border-primary/30 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground">Chọn trạm đến</p>
              <p className="text-[10px] text-muted-foreground truncate">Nhấn vào trạm để xem tuyến đường thực tế</p>
            </div>
            <button
              onClick={handleCancelPickingDestination}
              className="p-1.5 rounded-xl hover:bg-muted transition-colors flex-shrink-0"
            >
              <X size={14} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* ── ROUTE PREVIEW card ── */}
      {step === 'route-preview' && departureStation && destinationStation && (
        <div className="absolute bottom-24 left-4 right-4 z-[1000] fade-in-up">
          <div className="bg-card rounded-2xl shadow-card-lg border border-border overflow-hidden">
            {/* Route header */}
            <div className="px-4 pt-3 pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground">Xuất phát</p>
                  <p className="text-xs font-bold text-foreground truncate">{departureStation.name}</p>
                </div>
                <ArrowRight size={14} className="text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-[10px] text-muted-foreground">Trạm đến</p>
                  <p className="text-xs font-bold text-accent truncate">{destinationStation.name}</p>
                </div>
              </div>
            </div>

            {/* Route stats */}
            <div className="px-4 py-3">
              {routeLoading ? (
                <div className="flex items-center justify-center gap-2 py-1">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-muted-foreground">Đang tính tuyến đường...</p>
                </div>
              ) : routeInfo ? (
                <div className="flex items-center justify-around mb-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Route size={11} className="text-primary" />
                      <p className="text-sm font-bold text-foreground tabular-nums">{routeInfo.distanceKm} km</p>
                    </div>
                    <p className="text-[9px] text-muted-foreground">khoảng cách</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Clock size={11} className="text-primary" />
                      <p className="text-sm font-bold text-foreground tabular-nums">{routeInfo.durationMin} phút</p>
                    </div>
                    <p className="text-[9px] text-muted-foreground">thời gian xe</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center">
                    <p className="text-sm font-bold text-primary tabular-nums">
                      {formatVND(routeInfo.estimatedCost)}
                    </p>
                    <p className="text-[9px] text-muted-foreground">ước tính</p>
                  </div>
                </div>
              ) : null}

              <div className="flex gap-2">
                <button
                  onClick={handleBackToDestinationPick}
                  className="flex-1 py-2.5 rounded-xl border border-border text-xs font-semibold text-foreground active:scale-95 transition-all duration-150"
                >
                  Đổi trạm đến
                </button>
                <button
                  onClick={handleConfirmRoute}
                  disabled={routeLoading}
                  className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold active:scale-95 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Zap size={12} fill="white" />
                  Đặt xe ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My location button — hidden during route preview to avoid confusion */}
      {step !== 'route-preview' && (
        <button
          onClick={handleRecenter}
          className="absolute bottom-24 right-4 z-[1000] bg-card rounded-2xl p-3 shadow-card-lg active:scale-95 transition-all duration-150"
        >
          <Navigation size={20} className="text-primary" />
        </button>
      )}
    </div>
  );
}
