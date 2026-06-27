'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const TripLeafletInner = dynamic(() => import('./TripLeafletInner'), { ssr: false });

interface TripMapViewProps {
  batteryPercent: number;
  distanceKm: number;
}

const HANOI_CENTER: [number, number] = [21.0285, 105.8542];

export default function TripMapView({ batteryPercent }: TripMapViewProps) {
  const [userPosition, setUserPosition] = useState<[number, number]>(HANOI_CENTER);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className="flex-1 relative overflow-hidden" style={{ minHeight: '300px' }}>
      <TripLeafletInner userPosition={userPosition} batteryPercent={batteryPercent} />
    </div>
  );
}
