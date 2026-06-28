'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface TripLeafletInnerProps {
  userPosition: [number, number];
  batteryPercent: number;
  routePoints?: [number, number][];
  destinationPosition?: [number, number] | null;
}

// Moving vehicle icon
const vehicleIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:34px;height:34px;">
      <div style="
        width:34px;height:34px;
        background:#16a34a;
        border-radius:50%;
        border:3px solid #ffffff;
        box-shadow:0 3px 12px rgba(22,163,74,0.55);
        position:relative;z-index:2;
        display:flex;align-items:center;justify-content:center;
      ">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 2L4.09 12.41C3.72 12.83 4 13.5 4.55 13.5H11v7.91c0 .7.82 1.04 1.29.56L21.29 12c.36-.42.08-1.09-.46-1.09H15V2.59c0-.7-.82-1.04-1.29-.56z"/>
        </svg>
      </div>
      <div style="
        position:absolute;top:0;left:0;
        width:34px;height:34px;
        background:rgba(22,163,74,0.22);
        border-radius:50%;
        animation:vping 1.5s cubic-bezier(0,0,0.2,1) infinite;
      "></div>
    </div>
    <style>@keyframes vping{0%{transform:scale(1);opacity:1}100%{transform:scale(2.4);opacity:0}}</style>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

// Destination pin
const destIcon = L.divIcon({
  className: '',
  html: `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="
        padding:5px 12px;
        background:#f59e0b;
        border-radius:12px;
        box-shadow:0 2px 8px rgba(0,0,0,0.2);
        white-space:nowrap;
        display:flex;align-items:center;gap:5px;
      ">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <span style="font-size:11px;font-weight:700;color:#ffffff;font-family:system-ui,sans-serif;">Trạm đích</span>
      </div>
      <div style="
        width:0;height:0;
        border-left:5px solid transparent;
        border-right:5px solid transparent;
        border-top:7px solid #f59e0b;
        margin-top:-1px;
      "></div>
    </div>
  `,
  iconSize: [100, 36],
  iconAnchor: [50, 36],
});

function FollowVehicle({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: true });
  }, [map, position]);
  return null;
}

export default function TripLeafletInner({
  userPosition,
  batteryPercent,
  routePoints = [],
  destinationPosition,
}: TripLeafletInnerProps) {
  const hasRoute = routePoints.length >= 2;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapContainer
        center={userPosition}
        zoom={16}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        <FollowVehicle position={userPosition} />

        {/* Full navigation route — green solid line */}
        {hasRoute && (
          <Polyline
            positions={routePoints}
            pathOptions={{
              color: '#16a34a',
              weight: 5,
              opacity: 0.85,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}

        {/* Destination marker */}
        {destinationPosition && (
          <Marker position={destinationPosition} icon={destIcon} />
        )}

        {/* Moving vehicle */}
        <Marker position={userPosition} icon={vehicleIcon} />
      </MapContainer>

      {/* Battery critical red glow */}
      {batteryPercent <= 5 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 500,
            background: 'radial-gradient(circle at center, transparent 30%, rgba(239,68,68,0.12) 100%)',
          }}
        />
      )}

      <div style={{ position: 'absolute', bottom: 8, right: 8, zIndex: 500, background: 'rgba(255,255,255,0.7)', borderRadius: 4, padding: '2px 6px' }}>
        <span style={{ fontSize: 8, color: '#64748b' }}>© OpenStreetMap</span>
      </div>
    </div>
  );
}
