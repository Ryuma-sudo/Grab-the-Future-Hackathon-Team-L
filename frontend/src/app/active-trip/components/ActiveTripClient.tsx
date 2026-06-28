'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, Loader2 } from 'lucide-react';
import EndTripModal from './EndTripModal';
import LowBatteryAlert from './LowBatteryAlert';
import NearbyStationSheet from './NearbyStationSheet';
import TripMapView from './TripMapView';
import TripStatsBar from './TripStatsBar';
import TripTopBar from './TripTopBar';
import {
  calculateDistanceMeters,
  estimateTripCost,
  getRoute,
  getStation,
  getVehicle,
} from '../../../lib/api';
import type { ApiStation, ApiVehicle, CoordinatePayload } from '../../../lib/api';

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
  startStationName: string;
  destinationStationName: string;
  progress: number;
  startCoordinate: CoordinatePayload;
  destinationCoordinate: CoordinatePayload;
  routeCoordinates: CoordinatePayload[];
}

const SIMULATION_DURATION_MS = 5000;

function buildInitialTrip(
  vehicle: ApiVehicle,
  startStation: ApiStation,
  destinationStation: ApiStation | null,
  routeCoordinates: CoordinatePayload[],
): TripState {
  const startCoordinate = {
    latitude: startStation.latitude,
    longitude: startStation.longitude,
  };
  const destinationCoordinate = destinationStation
    ? {
        latitude: destinationStation.latitude,
        longitude: destinationStation.longitude,
      }
    : routeCoordinates[routeCoordinates.length - 1] ?? startCoordinate;

  return {
    startTime: Date.now(),
    elapsedSeconds: 0,
    distanceKm: 0,
    currentCost: 0,
    batteryPercent: vehicle.battery_level,
    estimatedRangeKm: vehicle.estimated_range_km,
    vehicleModel: `EV Scooter ${vehicle.code}`,
    pricePerMinute: 1000,
    tripId: `SIM-${Date.now().toString().slice(-6)}`,
    showLowBatteryAlert: vehicle.battery_level <= 5,
    showNearbyStations: false,
    startStationName: startStation.name,
    destinationStationName: destinationStation?.name ?? 'Free ride destination',
    progress: 0,
    startCoordinate,
    destinationCoordinate,
    routeCoordinates: routeCoordinates.length > 1 ? routeCoordinates : [startCoordinate, destinationCoordinate],
  };
}

function getTripDistanceKm(startStation: ApiStation, destinationStation: ApiStation | null) {
  if (!destinationStation) return 1;

  return (
    calculateDistanceMeters(
      { latitude: startStation.latitude, longitude: startStation.longitude },
      { latitude: destinationStation.latitude, longitude: destinationStation.longitude },
    ) / 1000
  );
}

export default function ActiveTripClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startStationId = Number(searchParams.get('from'));
  const destinationStationId = searchParams.get('to') ? Number(searchParams.get('to')) : null;
  const vehicleId = Number(searchParams.get('vehicle'));
  const [showEndModal, setShowEndModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trip, setTrip] = useState<TripState | null>(null);
  const distanceRef = useRef(1);
  const batteryBeforeRef = useRef(100);
  const rangeRef = useRef(45);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoEndedRef = useRef(false);

  function fallbackRouteCoordinates(startStation: ApiStation, destinationStation: ApiStation | null) {
    const start = { latitude: startStation.latitude, longitude: startStation.longitude };
    const destination = destinationStation
      ? { latitude: destinationStation.latitude, longitude: destinationStation.longitude }
      : {
          latitude: startStation.latitude + 0.006,
          longitude: startStation.longitude + 0.004,
        };

    return [start, destination];
  }

  async function getSimulationRoute(
    startStation: ApiStation,
    destinationStation: ApiStation | null,
    vehicle: ApiVehicle,
  ) {
    if (!destinationStation) {
      return {
        distanceKm: getTripDistanceKm(startStation, null),
        coordinates: fallbackRouteCoordinates(startStation, null),
      };
    }

    try {
      const route = await getRoute({
        origin: { latitude: startStation.latitude, longitude: startStation.longitude },
        destination: { latitude: destinationStation.latitude, longitude: destinationStation.longitude },
        battery_level: vehicle.battery_level,
        stations: [],
      });

      if (route.status === 'ok' && route.geometry?.coordinates?.length) {
        return {
          distanceKm: route.distance_km ?? getTripDistanceKm(startStation, destinationStation),
          coordinates: route.geometry.coordinates.map(([longitude, latitude]) => ({
            latitude,
            longitude,
          })),
        };
      }
    } catch {
      // Simulation can still run with a direct fallback if routing is unavailable.
    }

    return {
      distanceKm: getTripDistanceKm(startStation, destinationStation),
      coordinates: fallbackRouteCoordinates(startStation, destinationStation),
    };
  }

  useEffect(() => {
    if (!startStationId || !vehicleId) {
      setError('Missing station or vehicle for simulation');
      setLoading(false);
      return;
    }

    let isActive = true;

    async function loadSimulationData() {
      try {
        setLoading(true);
        setError(null);

        const [startStation, destinationStation, vehicle] = await Promise.all([
          getStation(startStationId),
          destinationStationId ? getStation(destinationStationId) : Promise.resolve(null),
          getVehicle(vehicleId),
        ]);

        if (!isActive) return;

        const route = await getSimulationRoute(startStation, destinationStation, vehicle);
        distanceRef.current = Math.max(0.2, route.distanceKm);
        batteryBeforeRef.current = vehicle.battery_level;
        rangeRef.current = Math.max(1, vehicle.estimated_range_km);
        setTrip(buildInitialTrip(vehicle, startStation, destinationStation, route.coordinates));
      } catch (err) {
        if (isActive) {
          setError(err instanceof Error ? err.message : 'Cannot start simulation');
        }
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadSimulationData();

    return () => {
      isActive = false;
    };
  }, [startStationId, destinationStationId, vehicleId]);

  useEffect(() => {
    if (!trip || loading || error) return;

    const startedAt = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsedMs = Date.now() - startedAt;
      const progress = Math.min(elapsedMs / SIMULATION_DURATION_MS, 1);
      const elapsedSeconds = Math.ceil(elapsedMs / 1000);
      const distanceKm = Math.round(distanceRef.current * progress * 10) / 10;
      const batteryUsed = (distanceRef.current / rangeRef.current) * 100 * progress;
      const batteryPercent = Math.max(0, Math.round((batteryBeforeRef.current - batteryUsed) * 10) / 10);
      const estimatedRangeKm = Math.round(rangeRef.current * (batteryPercent / 100) * 10) / 10;

      setTrip((previous) => {
        if (!previous) return previous;
        return {
          ...previous,
          elapsedSeconds,
          distanceKm,
          currentCost: estimateTripCost(Math.max(1, elapsedSeconds / 60)),
          batteryPercent,
          estimatedRangeKm,
          showLowBatteryAlert: batteryPercent <= 5,
          showNearbyStations: previous.showNearbyStations || batteryPercent <= 5,
          progress,
        };
      });

      if (progress >= 1) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (!autoEndedRef.current) {
          autoEndedRef.current = true;
          setShowEndModal(true);
        }
      }
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [trip?.tripId, loading, error]);

  const handleEndTrip = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setShowEndModal(true);
  };

  const handleConfirmEnd = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="relative flex flex-col h-screen bg-background overflow-hidden items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 size={18} className="animate-spin text-primary" />
          <span className="text-sm font-semibold">Preparing simulation...</span>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="relative flex flex-col h-screen bg-background overflow-hidden items-center justify-center px-6 text-center">
        <div className="rounded-2xl bg-card border border-danger/30 p-5 shadow-card">
          <AlertTriangle size={24} className="text-danger mx-auto mb-2" />
          <p className="text-sm font-bold text-foreground">Cannot start trip simulation</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-screen bg-background overflow-hidden">
      {trip.showLowBatteryAlert && (
        <LowBatteryAlert
          batteryPercent={trip.batteryPercent}
          rangeKm={trip.estimatedRangeKm}
          onViewStations={() => setTrip((previous) => previous ? { ...previous, showNearbyStations: true } : previous)}
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
        progress={trip.progress}
        startStationName={trip.startStationName}
        destinationStationName={trip.destinationStationName}
        startCoordinate={trip.startCoordinate}
        destinationCoordinate={trip.destinationCoordinate}
        routeCoordinates={trip.routeCoordinates}
      />

      <TripStatsBar trip={trip} onEndTrip={handleEndTrip} />

      {trip.showNearbyStations && (
        <NearbyStationSheet
          onClose={() => setTrip((previous) => previous ? { ...previous, showNearbyStations: false } : previous)}
        />
      )}

      {showEndModal && (
        <EndTripModal
          trip={trip}
          onConfirm={handleConfirmEnd}
          onCancel={() => setShowEndModal(false)}
        />
      )}
    </div>
  );
}
