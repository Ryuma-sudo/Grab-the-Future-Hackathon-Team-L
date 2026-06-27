'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface ApiStation {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  is_active: boolean;
  total_vehicle_count: number;
  available_vehicle_count: number;
  average_battery_level: number | null;
}

type FlowStep = 'idle' | 'departure-selected' | 'choose-destination-prompt' | 'picking-destination';

interface LeafletMapComponentProps {
  stations: ApiStation[];
  step: FlowStep;
  departureId?: number;
  destinationId?: number;
  onStationClick: (station: ApiStation) => void;
  userPosition?: [number, number] | null;
  recenterTrigger?: number;
}

const HANOI_CENTER: [number, number] = [21.0285, 105.8542];

function createStationIcon(count: number, isDeparture: boolean, isDestination: boolean) {
  let bg = count > 0 ? '#ffffff' : '#f1f5f9';
  let border = count > 0 ? '#16a34a' : '#cbd5e1';
  let color = count > 0 ? '#16a34a' : '#94a3b8';
  let tailColor = count > 0 ? '#16a34a' : '#cbd5e1';
  let scale = 'scale(1)';

  if (isDeparture) {
    bg = '#16a34a'; border = '#16a34a'; color = '#ffffff'; tailColor = '#16a34a'; scale = 'scale(1.15)';
  }
  if (isDestination) {
    bg = '#f59e0b'; border = '#f59e0b'; color = '#ffffff'; tailColor = '#f59e0b';
  }

  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;transform:${scale};transform-origin:bottom center;">
        <div style="
          padding:5px 10px;
          background:${bg};
          border:2px solid ${border};
          border-radius:12px;
          box-shadow:0 2px 8px rgba(0,0,0,0.18);
          display:flex;align-items:center;gap:5px;
          white-space:nowrap;
        ">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L4.09 12.41C3.72 12.83 4 13.5 4.55 13.5H11v7.91c0 .7.82 1.04 1.29.56L21.29 12c.36-.42.08-1.09-.46-1.09H15V2.59c0-.7-.82-1.04-1.29-.56z"/>
          </svg>
          <span style="font-size:11px;font-weight:700;color:${color};font-family:system-ui,sans-serif;">${count}</span>
        </div>
        <div style="
          width:0;height:0;
          border-left:5px solid transparent;
          border-right:5px solid transparent;
          border-top:7px solid ${tailColor};
          margin-top:-1px;
        "></div>
      </div>
    `,
    iconSize: [50, 32],
    iconAnchor: [25, 32],
  });
}

function createEstimateIcon(costLabel: string) {
  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="
          padding:5px 10px;
          background:#16a34a;
          border-radius:12px;
          box-shadow:0 2px 8px rgba(0,0,0,0.18);
          white-space:nowrap;
        ">
          <span style="font-size:10px;font-weight:700;color:#ffffff;font-family:system-ui,sans-serif;">${costLabel}</span>
        </div>
        <div style="
          width:0;height:0;
          border-left:5px solid transparent;
          border-right:5px solid transparent;
          border-top:7px solid #16a34a;
          margin-top:-1px;
        "></div>
      </div>
    `,
    iconSize: [80, 32],
    iconAnchor: [40, 32],
  });
}

function createUserIcon() {
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:20px;height:20px;">
        <div style="
          width:20px;height:20px;
          background:#3b82f6;
          border-radius:50%;
          border:3px solid #ffffff;
          box-shadow:0 2px 8px rgba(59,130,246,0.5);
          position:relative;z-index:2;
        "></div>
        <div style="
          position:absolute;top:0;left:0;
          width:20px;height:20px;
          background:rgba(59,130,246,0.3);
          border-radius:50%;
          animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
        "></div>
      </div>
      <style>@keyframes ping{0%{transform:scale(1);opacity:1}100%{transform:scale(2.5);opacity:0}}</style>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function RecenterMap({ position, trigger }: { position: [number, number]; trigger?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 15, { animate: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);
  return null;
}

function calcCostLabel(from: ApiStation, to: ApiStation): string {
  const R = 6371;
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.latitude * Math.PI) / 180) *
      Math.cos((to.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dur = Math.round(distKm * 4);
  const cost = dur * 1500;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(cost);
}

export default function LeafletMapComponent({
  stations,
  step,
  departureId,
  destinationId,
  onStationClick,
  userPosition,
  recenterTrigger,
}: LeafletMapComponentProps) {
  const departureStation = stations.find((s) => s.id === departureId);

  const routePoints: [number, number][] =
    step === 'picking-destination' && departureStation && destinationId
      ? (() => {
          const dest = stations.find((s) => s.id === destinationId);
          if (!dest) return [];
          return [
            [departureStation.latitude, departureStation.longitude],
            [dest.latitude, dest.longitude],
          ];
        })()
      : [];

  return (
    <MapContainer
      center={userPosition ?? HANOI_CENTER}
      zoom={15}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {/* Recenter when requested */}
      {userPosition && <RecenterMap position={userPosition} trigger={recenterTrigger} />}

      {/* Route polyline */}
      {routePoints.length === 2 && (
        <Polyline
          positions={routePoints}
          pathOptions={{ color: '#16a34a', weight: 4, dashArray: '8 6', opacity: 0.85 }}
        />
      )}

      {/* Station markers */}
      {stations.map((station) => {
        if (!station.is_active) return null;
        const isDeparture = station.id === departureId;
        const isDestination = station.id === destinationId;
        const isPickingDest = step === 'picking-destination';

        if (isPickingDest && isDeparture) return null;

        const icon =
          isPickingDest && departureStation && !isDeparture
            ? createEstimateIcon(calcCostLabel(departureStation, station))
            : createStationIcon(station.available_vehicle_count, isDeparture, isDestination);

        return (
          <Marker
            key={station.id}
            position={[station.latitude, station.longitude]}
            icon={icon}
            eventHandlers={{ click: () => onStationClick(station) }}
          />
        );
      })}

      {/* User location marker */}
      {userPosition && (
        <Marker position={userPosition} icon={createUserIcon()} />
      )}
    </MapContainer>
  );
}
