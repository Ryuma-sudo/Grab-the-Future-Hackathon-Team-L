'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import LowBatteryAlert from './LowBatteryAlert';
import TripMapView from './TripMapView';
import TripStatsBar from './TripStatsBar';
import EndTripModal from './EndTripModal';
import TripTopBar from './TripTopBar';
import NearbyStationSheet from './NearbyStationSheet';

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

export default function ActiveTripClient() {
  const router = useRouter();
  const [showEndModal, setShowEndModal] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [trip, setTrip] = useState<TripState>({
    startTime: Date.now(),
    elapsedSeconds: 0,
    distanceKm: 0,
    currentCost: 0,
    batteryPercent: 64,
    estimatedRangeKm: 38,
    vehicleModel: 'VinFast Feliz S',
    pricePerMinute: 1500,
    tripId: 'TR-20260627',
    showLowBatteryAlert: false,
    showNearbyStations: false,
  });

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTrip((prev) => {
        const newElapsed = prev.elapsedSeconds + 1;
        const newDistanceKm = Math.round((newElapsed / 60) * 12 * 10) / 10; // ~12 km/h
        const newCost = Math.round((newElapsed / 60) * prev.pricePerMinute);
        // Battery drains ~0.3% per km
        const newBattery = Math.max(0, prev.batteryPercent - (newDistanceKm - prev.distanceKm) * 0.3);
        const newBatteryRounded = Math.round(newBattery * 10) / 10;
        const newRange = Math.round(newBatteryRounded * 0.6 * 10) / 10;
        const showLowBattery = newBatteryRounded <= 5;
        const showNearby = showLowBattery;

        return {
          ...prev,
          elapsedSeconds: newElapsed,
          distanceKm: newDistanceKm,
          currentCost: newCost,
          batteryPercent: newBatteryRounded,
          estimatedRangeKm: newRange,
          showLowBatteryAlert: showLowBattery,
          showNearbyStations: showNearby,
        };
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleEndTrip = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setShowEndModal(true);
  };

  const handleConfirmEnd = () => {
    router.push('/');
  };

  return (
    <div className="relative flex flex-col h-screen bg-background overflow-hidden">
      {/* Low battery alert */}
      {trip.showLowBatteryAlert && (
        <LowBatteryAlert
          batteryPercent={trip.batteryPercent}
          rangeKm={trip.estimatedRangeKm}
          onViewStations={() => setTrip((p) => ({ ...p, showNearbyStations: true }))}
        />
      )}

      {/* Top bar */}
      <TripTopBar
        tripId={trip.tripId}
        vehicleModel={trip.vehicleModel}
        batteryPercent={trip.batteryPercent}
      />

      {/* Map */}
      <TripMapView
        batteryPercent={trip.batteryPercent}
        distanceKm={trip.distanceKm}
      />

      {/* Stats bar */}
      <TripStatsBar trip={trip} onEndTrip={handleEndTrip} />

      {/* Nearby stations sheet when low battery */}
      {trip.showNearbyStations && (
        <NearbyStationSheet
          onClose={() => setTrip((p) => ({ ...p, showNearbyStations: false }))}
        />
      )}

      {/* End trip modal */}
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