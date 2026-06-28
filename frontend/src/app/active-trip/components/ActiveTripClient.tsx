'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import LowBatteryAlert from './LowBatteryAlert';
import TripMapView from './TripMapView';
import TripStatsBar from './TripStatsBar';
import EndTripModal from './EndTripModal';
import TripTopBar from './TripTopBar';
import NearbyStationSheet from './NearbyStationSheet';
import { MOCK_STATIONS, calculateTripCost } from '../../../lib/mockData';

export interface TripState {
  startTime: number;
  elapsedSeconds: number;
  distanceKm: number;
  currentCost: number;
  batteryPercent: number;
  estimatedRangeKm: number;
  vehicleModel: string;
  pricePerMinute: number;
  tripId: string;
  showLowBatteryAlert: boolean;
  showNearbyStations: boolean;
}

interface ApiStation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

interface ActiveTripClientProps {
  fromStationId?: string;
  toStationId?: string;
  vehicleModel?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

// Fallback stations lookup (index+1 = ID)
const FALLBACK: ApiStation[] = MOCK_STATIONS.map((s, i) => ({
  id: i + 1,
  name: s.name,
  latitude: s.lat,
  longitude: s.lng,
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

function buildCumulative(pts: [number, number][]): number[] {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    const d = haversineMeters(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]);
    cum.push(cum[i - 1] + d);
  }
  return cum;
}

function interpolate(
  pts: [number, number][],
  cum: number[],
  fraction: number,
): [number, number] {
  const total = cum[cum.length - 1];
  const target = Math.min(fraction * total, total);
  for (let i = 1; i < pts.length; i++) {
    if (cum[i] >= target) {
      const seg = (target - cum[i - 1]) / (cum[i] - cum[i - 1]);
      return [
        pts[i - 1][0] + seg * (pts[i][0] - pts[i - 1][0]),
        pts[i - 1][1] + seg * (pts[i][1] - pts[i - 1][1]),
      ];
    }
  }
  return pts[pts.length - 1];
}

export default function ActiveTripClient({ fromStationId, toStationId, vehicleModel }: ActiveTripClientProps) {
  const router = useRouter();
  const [showEndModal, setShowEndModal] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Route state (only when toStationId is set)
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const [routeCumulative, setRouteCumulative] = useState<number[]>([]);
  const [routeDistanceKm, setRouteDistanceKm] = useState<number>(0);
  const [destinationPos, setDestinationPos] = useState<[number, number] | null>(null);
  const [departurePos, setDeparturePos] = useState<[number, number] | null>(null);

  const [trip, setTrip] = useState<TripState>({
    startTime: Date.now(),
    elapsedSeconds: 0,
    distanceKm: 0,
    currentCost: 0,
    batteryPercent: 64,
    estimatedRangeKm: 38,
    vehicleModel: vehicleModel ?? 'Yadea G5',
    pricePerMinute: 1000,
    tripId: 'TR-20260628',
    showLowBatteryAlert: false,
    showNearbyStations: false,
  });

  // ── Fetch route if destination is set ──────────────────────────────────────
  useEffect(() => {
    if (!fromStationId || !toStationId) return;

    const load = async () => {
      try {
        // 1. Get stations (backend → fallback)
        let stations: ApiStation[] = FALLBACK;
        try {
          const res = await fetch(`${API_BASE}/stations`);
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) stations = data;
        } catch { /* use fallback */ }

        const fromId = parseInt(fromStationId, 10);
        const toId = parseInt(toStationId, 10);
        const fromSt = stations.find((s) => s.id === fromId);
        const toSt = stations.find((s) => s.id === toId);
        if (!fromSt || !toSt) return;

        setDeparturePos([fromSt.latitude, fromSt.longitude]);
        setDestinationPos([toSt.latitude, toSt.longitude]);

        // 2. Fetch OSRM route
        const url = `${OSRM_BASE}/${fromSt.longitude},${fromSt.latitude};${toSt.longitude},${toSt.latitude}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        const route = data.routes?.[0];
        if (!route) return;

        const pts: [number, number][] = (route.geometry.coordinates as [number, number][]).map(
          ([lng, lat]) => [lat, lng],
        );
        const cum = buildCumulative(pts);
        const distKm = Math.round((route.distance / 1000) * 10) / 10;

        setRoutePoints(pts);
        setRouteCumulative(cum);
        setRouteDistanceKm(distKm);
      } catch { /* silently ignore — no route shown */ }
    };

    load();
  }, [fromStationId, toStationId]);

  // ── Realtime trip ticker ───────────────────────────────────────────────────
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTrip((prev) => {
        const newElapsed = prev.elapsedSeconds + 1;
        // Simulate 30 km/h for visible demo progress (vs realistic 12)
        const newDistanceKm = Math.round((newElapsed / 3600) * 30 * 100) / 100;
        const newCost = calculateTripCost(newElapsed / 60);
        const newBattery = Math.max(0, prev.batteryPercent - (newDistanceKm - prev.distanceKm) * 0.3);
        const newBatteryRounded = Math.round(newBattery * 10) / 10;
        const newRange = Math.round(newBatteryRounded * 0.6 * 10) / 10;
        const showLowBattery = newBatteryRounded <= 5;

        return {
          ...prev,
          elapsedSeconds: newElapsed,
          distanceKm: newDistanceKm,
          currentCost: newCost,
          batteryPercent: newBatteryRounded,
          estimatedRangeKm: newRange,
          showLowBatteryAlert: showLowBattery,
          showNearbyStations: showLowBattery,
        };
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // ── Compute simulated position along OSRM route ───────────────────────────
  const simulatedPosition = useMemo<[number, number] | null>(() => {
    if (routePoints.length < 2 || routeDistanceKm === 0) return departurePos;
    const fraction = Math.min(1, trip.distanceKm / routeDistanceKm);
    return interpolate(routePoints, routeCumulative, fraction);
  }, [routePoints, routeCumulative, routeDistanceKm, trip.distanceKm, departurePos]);

  const handleEndTrip = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setShowEndModal(true);
  };

  return (
    <div className="relative flex flex-col h-screen bg-background overflow-hidden">
      {trip.showLowBatteryAlert && (
        <LowBatteryAlert
          batteryPercent={trip.batteryPercent}
          rangeKm={trip.estimatedRangeKm}
          onViewStations={() => setTrip((p) => ({ ...p, showNearbyStations: true }))}
        />
      )}

      <TripTopBar
        tripId={trip.tripId}
        vehicleModel={trip.vehicleModel}
        batteryPercent={trip.batteryPercent}
      />

      <TripMapView
        batteryPercent={trip.batteryPercent}
        distanceKm={trip.distanceKm}
        simulatedPosition={simulatedPosition}
        routePoints={routePoints}
        destinationPosition={destinationPos}
        hasDestination={!!toStationId}
      />

      <TripStatsBar trip={trip} onEndTrip={handleEndTrip} />

      {trip.showNearbyStations && (
        <NearbyStationSheet onClose={() => setTrip((p) => ({ ...p, showNearbyStations: false }))} />
      )}

      {showEndModal && (
        <EndTripModal
          trip={trip}
          onConfirm={() => router.push('/')}
          onCancel={() => setShowEndModal(false)}
        />
      )}
    </div>
  );
}
