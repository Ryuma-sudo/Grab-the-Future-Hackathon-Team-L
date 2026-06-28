'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Zap } from 'lucide-react';
import type { CoordinatePayload } from '../../../lib/api';

type LeafletApi = any;

declare global {
  interface Window {
    L?: LeafletApi;
  }
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
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Leaflet can only load in the browser'));
  }

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

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-leaflet-js]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.L) resolve(window.L);
      });
      existingScript.addEventListener('error', () => reject(new Error('Cannot load Leaflet')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.dataset.leafletJs = 'true';
    script.onload = () => {
      if (!window.L) {
        reject(new Error('Leaflet loaded without map API'));
        return;
      }
      resolve(window.L);
    };
    script.onerror = () => reject(new Error('Cannot load Leaflet'));
    document.body.appendChild(script);
  });

  return leafletLoader;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function interpolateRoutePoint(routeCoordinates: CoordinatePayload[], progress: number): CoordinatePayload {
  if (routeCoordinates.length === 0) return { latitude: 0, longitude: 0 };
  if (routeCoordinates.length === 1) return routeCoordinates[0];

  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const targetIndex = clampedProgress * (routeCoordinates.length - 1);
  const leftIndex = Math.floor(targetIndex);
  const rightIndex = Math.min(leftIndex + 1, routeCoordinates.length - 1);
  const segmentProgress = targetIndex - leftIndex;
  const left = routeCoordinates[leftIndex];
  const right = routeCoordinates[rightIndex];

  return {
    latitude: left.latitude + (right.latitude - left.latitude) * segmentProgress,
    longitude: left.longitude + (right.longitude - left.longitude) * segmentProgress,
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
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const vehicleMarkerRef = useRef<any>(null);
  const leafletRef = useRef<LeafletApi | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const routeLatLngs = useMemo(
    () =>
      (routeCoordinates.length > 1 ? routeCoordinates : [startCoordinate, destinationCoordinate])
        .map((coordinate) => [coordinate.latitude, coordinate.longitude] as [number, number]),
    [destinationCoordinate, routeCoordinates, startCoordinate],
  );

  useEffect(() => {
    let isActive = true;

    loadLeaflet()
      .then((leaflet) => {
        if (!isActive || !mapElementRef.current || mapRef.current) return;

        leafletRef.current = leaflet;
        const map = leaflet.map(mapElementRef.current, {
          center: [startCoordinate.latitude, startCoordinate.longitude],
          zoom: 16,
          zoomControl: false,
        });

        leaflet
          .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
          })
          .addTo(map);

        routeLayerRef.current = leaflet.layerGroup().addTo(map);
        markerLayerRef.current = leaflet.layerGroup().addTo(map);

        const vehicleIcon = leaflet.divIcon({
          className: 'leaflet-trip-vehicle-marker',
          html: '<span>⚡</span>',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        vehicleMarkerRef.current = leaflet
          .marker([startCoordinate.latitude, startCoordinate.longitude], { icon: vehicleIcon })
          .addTo(map);

        mapRef.current = map;
        setMapError(null);
      })
      .catch((err) => {
        if (!isActive) return;
        setMapError(err instanceof Error ? err.message : 'Cannot load map');
      });

    return () => {
      isActive = false;
    };
  }, [startCoordinate.latitude, startCoordinate.longitude]);

  useEffect(() => {
    const leaflet = leafletRef.current;
    const map = mapRef.current;
    const routeLayer = routeLayerRef.current;
    const markerLayer = markerLayerRef.current;
    if (!leaflet || !map || !routeLayer || !markerLayer) return;

    routeLayer.clearLayers();
    markerLayer.clearLayers();

    leaflet
      .polyline(routeLatLngs, {
        color: '#16a34a',
        weight: 6,
        opacity: 0.82,
        lineCap: 'round',
        lineJoin: 'round',
      })
      .addTo(routeLayer);

    const completedPointCount = Math.max(2, Math.ceil(routeLatLngs.length * Math.min(Math.max(progress, 0), 1)));
    leaflet
      .polyline(routeLatLngs.slice(0, completedPointCount), {
        color: '#0f766e',
        weight: 7,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      })
      .addTo(routeLayer);

    const startIcon = leaflet.divIcon({
      className: 'leaflet-trip-station-label',
      html: `<span>${escapeHtml(startStationName)}</span>`,
      iconSize: [130, 28],
      iconAnchor: [65, 28],
    });
    const destinationIcon = leaflet.divIcon({
      className: 'leaflet-trip-destination-label',
      html: `<span>${escapeHtml(destinationStationName)}</span>`,
      iconSize: [150, 34],
      iconAnchor: [75, 34],
    });

    leaflet.marker([startCoordinate.latitude, startCoordinate.longitude], { icon: startIcon }).addTo(markerLayer);
    leaflet.marker([destinationCoordinate.latitude, destinationCoordinate.longitude], { icon: destinationIcon }).addTo(markerLayer);

    map.fitBounds(leaflet.latLngBounds(routeLatLngs), { padding: [70, 42], maxZoom: 17 });
  }, [
    destinationCoordinate.latitude,
    destinationCoordinate.longitude,
    destinationStationName,
    progress,
    routeLatLngs,
    startCoordinate.latitude,
    startCoordinate.longitude,
    startStationName,
  ]);

  useEffect(() => {
    const vehicleMarker = vehicleMarkerRef.current;
    if (!vehicleMarker) return;

    const currentPoint = interpolateRoutePoint(routeCoordinates, progress);
    vehicleMarker.setLatLng([currentPoint.latitude, currentPoint.longitude]);
  }, [progress, routeCoordinates]);

  return (
    <div className="flex-1 relative overflow-hidden bg-background" style={{ minHeight: '100vh' }}>
      <div ref={mapElementRef} className="absolute inset-0 z-0" />

      {mapError && (
        <div className="absolute left-4 right-4 top-20 z-40 rounded-2xl bg-card border border-danger/30 p-3 shadow-card">
          <p className="text-xs font-semibold text-danger">{mapError}</p>
        </div>
      )}

      {batteryPercent <= 5 && (
        <div className="absolute inset-0 pointer-events-none z-10" style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(239,68,68,0.08) 100%)' }} />
      )}

      <div className="absolute bottom-2 right-2 z-20 bg-white/80 rounded px-1.5 py-0.5">
        <span className="text-[8px] text-muted-foreground">OpenStreetMap route</span>
      </div>

      <style jsx global>{`
        .leaflet-container {
          width: 100%;
          height: 100%;
          font-family: inherit;
          background: #edf8f1;
        }

        .leaflet-control-attribution {
          font-size: 9px;
        }

        .leaflet-trip-vehicle-marker {
          background: transparent;
          border: 0;
        }

        .leaflet-trip-vehicle-marker span {
          align-items: center;
          background: #16a34a;
          border: 3px solid #ffffff;
          border-radius: 999px;
          box-shadow: 0 8px 20px rgba(22, 163, 74, 0.35);
          color: #ffffff;
          display: flex;
          font-size: 13px;
          font-weight: 900;
          height: 28px;
          justify-content: center;
          width: 28px;
        }

        .leaflet-trip-station-label,
        .leaflet-trip-destination-label {
          background: transparent;
          border: 0;
        }

        .leaflet-trip-station-label span,
        .leaflet-trip-destination-label span {
          align-items: center;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.14);
          display: flex;
          font-size: 10px;
          font-weight: 800;
          height: 26px;
          justify-content: center;
          overflow: hidden;
          padding: 0 8px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .leaflet-trip-station-label span {
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(22, 163, 74, 0.35);
          color: #166534;
        }

        .leaflet-trip-destination-label span {
          background: #f59e0b;
          color: #ffffff;
        }
      `}</style>
    </div>
  );
}
