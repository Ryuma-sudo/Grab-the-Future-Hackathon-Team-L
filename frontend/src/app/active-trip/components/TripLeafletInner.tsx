'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface TripLeafletInnerProps {
  userPosition: [number, number];
  batteryPercent: number;
}

const vehicleIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:28px;height:28px;">
      <div style="
        width:28px;height:28px;
        background:#16a34a;
        border-radius:50%;
        border:3px solid #ffffff;
        box-shadow:0 2px 8px rgba(22,163,74,0.5);
        position:relative;z-index:2;
        display:flex;align-items:center;justify-content:center;
      ">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 2L4.09 12.41C3.72 12.83 4 13.5 4.55 13.5H11v7.91c0 .7.82 1.04 1.29.56L21.29 12c.36-.42.08-1.09-.46-1.09H15V2.59c0-.7-.82-1.04-1.29-.56z"/>
        </svg>
      </div>
      <div style="
        position:absolute;top:0;left:0;
        width:28px;height:28px;
        background:rgba(22,163,74,0.3);
        border-radius:50%;
        animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
      "></div>
    </div>
    <style>@keyframes ping{0%{transform:scale(1);opacity:1}100%{transform:scale(2.2);opacity:0}}</style>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function FollowUser({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: true });
  }, [map, position]);
  return null;
}

export default function TripLeafletInner({ userPosition, batteryPercent }: TripLeafletInnerProps) {
  return (
    <div className="relative w-full h-full">
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
        <FollowUser position={userPosition} />
        <Marker position={userPosition} icon={vehicleIcon} />
      </MapContainer>

      {/* Battery warning overlay */}
      {batteryPercent <= 5 && (
        <div
          className="absolute inset-0 pointer-events-none z-[500]"
          style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(239,68,68,0.1) 100%)' }}
        />
      )}

      <div className="absolute bottom-2 right-2 z-[500] bg-white/70 rounded px-1.5 py-0.5">
        <span className="text-[8px] text-muted-foreground">© OpenStreetMap</span>
      </div>
    </div>
  );
}
