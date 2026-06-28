'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { CoordinatePayload } from '../../../lib/api';

type LeafletApi = any;

declare global {
  interface Window { L?: LeafletApi; }
}

interface TripMapViewProps {
  batteryPercent: number;
  distanceKm: number;
  progress: number;
  startStationName: string;
  destinationStationName: string;
  startCoordinate: CoordinatePayload;
  destinationCoordinate: CoordinatePayload;
  routeCoordinates: CoordinatePayload[];
}

let leafletLoader: Promise<LeafletApi> | null = null;

function loadLeaflet(): Promise<LeafletApi> {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'));
  if (window.L) return Promise.resolve(window.L);
  if (leafletLoader) return leafletLoader;

  leafletLoader = new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-leaflet-css]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.dataset.leafletCss = 'true';
      document.head.appendChild(link);
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-leaflet-js]');
    if (existing) {
      existing.addEventListener('load', () => { if (window.L) resolve(window.L); });
      existing.addEventListener('error', () => reject(new Error('Cannot load Leaflet')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.dataset.leafletJs = 'true';
    script.onload = () => { if (window.L) resolve(window.L); else reject(new Error('No Leaflet API')); };
    script.onerror = () => reject(new Error('Cannot load Leaflet'));
    document.body.appendChild(script);
  });

  return leafletLoader;
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function interpolatePoint(coords: CoordinatePayload[], progress: number): CoordinatePayload {
  if (coords.length === 0) return { latitude: 0, longitude: 0 };
  if (coords.length === 1) return coords[0];
  const p = Math.min(Math.max(progress, 0), 1);
  const idx = p * (coords.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, coords.length - 1);
  const t = idx - lo;
  return {
    latitude: coords[lo].latitude + (coords[hi].latitude - coords[lo].latitude) * t,
    longitude: coords[lo].longitude + (coords[hi].longitude - coords[lo].longitude) * t,
  };
}

export default function TripMapView({
  batteryPercent,
  progress,
  startStationName,
  destinationStationName,
  startCoordinate,
  destinationCoordinate,
  routeCoordinates,
}: TripMapViewProps) {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const vehicleMarkerRef = useRef<any>(null);
  const leafletRef = useRef<LeafletApi | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const routeLatLngs = useMemo(() => {
    const coords = routeCoordinates.length > 1
      ? routeCoordinates
      : [startCoordinate, destinationCoordinate];
    return coords.map((c) => [c.latitude, c.longitude] as [number, number]);
  }, [routeCoordinates, startCoordinate, destinationCoordinate]);

  // Init map once
  useEffect(() => {
    let active = true;
    loadLeaflet()
      .then((L) => {
        if (!active || !mapElRef.current || mapRef.current) return;
        leafletRef.current = L;

        const map = L.map(mapElRef.current, {
          center: [startCoordinate.latitude, startCoordinate.longitude],
          zoom: 16,
          zoomControl: false,
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        routeLayerRef.current = L.layerGroup().addTo(map);
        markerLayerRef.current = L.layerGroup().addTo(map);

        const vehicleIcon = L.divIcon({
          className: 'leaflet-trip-vehicle-marker',
          html: '<span>⚡</span>',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        vehicleMarkerRef.current = L.marker(
          [startCoordinate.latitude, startCoordinate.longitude],
          { icon: vehicleIcon },
        ).addTo(map);

        mapRef.current = map;
      })
      .catch((err) => { if (active) setMapError(err.message); });

    return () => { active = false; };
  }, [startCoordinate.latitude, startCoordinate.longitude]); // eslint-disable-line

  // Update route + markers when routeLatLngs changes
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const routeLayer = routeLayerRef.current;
    const markerLayer = markerLayerRef.current;
    if (!L || !map || !routeLayer || !markerLayer) return;

    routeLayer.clearLayers();
    markerLayer.clearLayers();

    // Full route (grey-green)
    L.polyline(routeLatLngs, { color: '#16a34a', weight: 6, opacity: 0.82, lineCap: 'round', lineJoin: 'round' })
      .addTo(routeLayer);

    // Completed portion (darker)
    const completedCount = Math.max(2, Math.ceil(routeLatLngs.length * Math.min(Math.max(progress, 0), 1)));
    L.polyline(routeLatLngs.slice(0, completedCount), { color: '#0f766e', weight: 7, opacity: 0.95, lineCap: 'round', lineJoin: 'round' })
      .addTo(routeLayer);

    const startIcon = L.divIcon({
      className: 'leaflet-trip-station-label',
      html: `<span>${esc(startStationName)}</span>`,
      iconSize: [140, 28], iconAnchor: [70, 28],
    });
    const destIcon = L.divIcon({
      className: 'leaflet-trip-destination-label',
      html: `<span>${esc(destinationStationName)}</span>`,
      iconSize: [160, 34], iconAnchor: [80, 34],
    });
    L.marker([startCoordinate.latitude, startCoordinate.longitude], { icon: startIcon }).addTo(markerLayer);
    L.marker([destinationCoordinate.latitude, destinationCoordinate.longitude], { icon: destIcon }).addTo(markerLayer);

    map.fitBounds(L.latLngBounds(routeLatLngs), { padding: [70, 42], maxZoom: 17 });
  }, [routeLatLngs, startStationName, destinationStationName, startCoordinate, destinationCoordinate, progress]); // eslint-disable-line

  // Animate vehicle marker along route
  useEffect(() => {
    const marker = vehicleMarkerRef.current;
    if (!marker) return;
    const pt = interpolatePoint(routeCoordinates.length > 1 ? routeCoordinates : [startCoordinate, destinationCoordinate], progress);
    marker.setLatLng([pt.latitude, pt.longitude]);
  }, [progress, routeCoordinates, startCoordinate, destinationCoordinate]);

  return (
    <div className="flex-1 relative overflow-hidden bg-background z-0" style={{ minHeight: '100vh' }}>
      <div ref={mapElRef} className="absolute inset-0 z-0" />

      {mapError && (
        <div className="absolute left-4 right-4 top-20 z-40 rounded-2xl bg-card border border-danger/30 p-3 shadow-card">
          <p className="text-xs font-semibold text-danger">{mapError}</p>
        </div>
      )}

      {batteryPercent <= 5 && (
        <div className="absolute inset-0 pointer-events-none z-10" style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(239,68,68,0.08) 100%)' }} />
      )}

      <div className="absolute bottom-2 right-2 z-20 bg-white/80 rounded px-1.5 py-0.5">
        <span className="text-[8px] text-muted-foreground">© OpenStreetMap</span>
      </div>

      <style jsx global>{`
        .leaflet-container { width: 100%; height: 100%; background: #edf8f1; }
        .leaflet-control-attribution { font-size: 9px; }
        .leaflet-trip-vehicle-marker { background: transparent; border: 0; }
        .leaflet-trip-vehicle-marker span {
          align-items: center; background: #16a34a; border: 3px solid #fff;
          border-radius: 999px; box-shadow: 0 8px 20px rgba(22,163,74,.35);
          color: #fff; display: flex; font-size: 13px; font-weight: 900;
          height: 28px; justify-content: center; width: 28px;
        }
        .leaflet-trip-station-label, .leaflet-trip-destination-label { background: transparent; border: 0; }
        .leaflet-trip-station-label span, .leaflet-trip-destination-label span {
          align-items: center; border-radius: 12px; box-shadow: 0 8px 20px rgba(15,23,42,.14);
          display: flex; font-size: 10px; font-weight: 800; height: 26px;
          justify-content: center; overflow: hidden; padding: 0 8px;
          text-overflow: ellipsis; white-space: nowrap;
        }
        .leaflet-trip-station-label span { background: rgba(255,255,255,.92); border: 1px solid rgba(22,163,74,.35); color: #166534; }
        .leaflet-trip-destination-label span { background: #f59e0b; color: #fff; }
      `}</style>
    </div>
  );
}
