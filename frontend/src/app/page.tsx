import React from 'react';
import MobileLayout from '../components/MobileLayout';
import MapView from './components/MapView';
import MapTopBar from './components/MapTopBar';

export default function MapStationFinderPage() {
  return (
    <MobileLayout>
      <div className="relative flex flex-col h-screen">
        <MapTopBar />
        <MapView />
      </div>
    </MobileLayout>
  );
}