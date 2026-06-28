'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { TripLeafletInnerProps } from './TripLeafletInner';

const TripLeafletInner = dynamic<TripLeafletInnerProps>(
  () => import('./TripLeafletInner'),
  { ssr: false },
);

interface TripMapViewProps {
  batteryPercent: number;
  distanceKm: number;
  simulatedPosition?: [number, number] | null;
  routePoints?: [number, number][];
  destinationPosition?: [number, number] | null;
  hasDestination?: boolean;
}

const DHQG_CENTER: [number, number] = [10.8703, 106.8025];

export default function TripMapView({
  batteryPercent,
  simulatedPosition,
  routePoints = [],
  destinationPosition,
  hasDestination = false,
}: TripMapViewProps) {
  const [gpsPosition, setGpsPosition] = useState<[number, number]>(DHQG_CENTER);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setGpsPosition([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Use simulated position when we have a route, otherwise real GPS
  const displayPosition = hasDestination && simulatedPosition ? simulatedPosition : gpsPosition;

  return (
    <div className="flex-1 relative z-0 overflow-hidden" style={{ minHeight: '300px' }}>
      <TripLeafletInner
        userPosition={displayPosition}
        batteryPercent={batteryPercent}
        routePoints={routePoints}
        destinationPosition={destinationPosition}
      />
    </div>
  );
}
