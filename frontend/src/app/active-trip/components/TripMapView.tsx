'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const TripLeafletInner = dynamic(() => import('./TripLeafletInner'), { ssr: false });

interface TripMapViewProps {
  batteryPercent: number;
  distanceKm: number;
}

const DHQG_CENTER: [number, number] = [10.8703, 106.8025];

export default function TripMapView({ batteryPercent }: TripMapViewProps) {
  const [userPosition, setUserPosition] = useState<[number, number]>(DHQG_CENTER);

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
