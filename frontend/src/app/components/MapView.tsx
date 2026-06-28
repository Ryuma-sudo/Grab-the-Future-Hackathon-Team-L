'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ChevronRight, Loader2, MapPin, Navigation, X, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  calculateDistanceMeters,
  estimateTripCost,
  formatVND,
  getRoute,
  getStations,
  recommendStartStation,
} from '../../lib/api';
import type { ApiStation, CoordinatePayload } from '../../lib/api';

type FlowStep =
  | 'idle'
  | 'departure-selected'
  | 'choose-destination-prompt'
  | 'picking-destination'
  | 'destination-selected'
  | 'recommended-start-selected'
  | 'picking-user-location';

interface RouteEstimate {
  station: ApiStation;
  distanceKm: number;
  durationMin: number;
  estimatedCost: number;
}

type LeafletApi = any;

declare global {
  interface Window {
    L?: LeafletApi;
  }
}

const DEFAULT_USER_POSITION: CoordinatePayload = {
  latitude: 10.8702,
  longitude: 106.8032,
};

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

function stationCoordinate(station: ApiStation): CoordinatePayload {
  return {
    latitude: station.latitude,
    longitude: station.longitude,
  };
}

function calcEstimate(from: ApiStation, to: ApiStation): RouteEstimate {
  const distanceKm = calculateDistanceMeters(stationCoordinate(from), stationCoordinate(to)) / 1000;
  const durationMin = Math.max(1, Math.ceil(distanceKm * 3.2));

  return {
    station: to,
    distanceKm: Math.round(distanceKm * 10) / 10,
    durationMin,
    estimatedCost: estimateTripCost(durationMin),
  };
}

function getAvailableVehicles(station: ApiStation) {
  return station.available_vehicle_count ?? 0;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function stationMarkerHtml(
  station: ApiStation,
  options: {
    isDeparture: boolean;
    isDestination: boolean;
    isPickingDestination: boolean;
    estimate?: RouteEstimate;
  },
) {
  const isAvailable = getAvailableVehicles(station) > 0;
  const label = options.isPickingDestination && options.estimate
    ? formatVND(options.estimate.estimatedCost)
    : String(getAvailableVehicles(station));
  const modifier = options.isDestination
    ? 'destination'
    : options.isDeparture
      ? 'departure'
      : isAvailable
        ? 'available'
        : 'empty';

  return `
    <button class="leaflet-station-marker leaflet-station-marker--${modifier}" type="button" title="${escapeHtml(station.name)}">
      <span class="leaflet-station-marker__icon">${options.isDestination ? 'D' : 'EV'}</span>
      <span class="leaflet-station-marker__label">${escapeHtml(label)}</span>
    </button>
  `;
}

export default function MapView() {
  const router = useRouter();
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const leafletRef = useRef<LeafletApi | null>(null);

  const [stations, setStations] = useState<ApiStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [step, setStep] = useState<FlowStep>('idle');
  const [userPosition, setUserPosition] = useState<CoordinatePayload>(DEFAULT_USER_POSITION);
  const [departureStation, setDepartureStation] = useState<ApiStation | null>(null);
  const [destinationStation, setDestinationStation] = useState<ApiStation | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<CoordinatePayload[]>([]);
  const [accessRouteCoordinates, setAccessRouteCoordinates] = useState<CoordinatePayload[]>([]);

  const destinationEstimates: RouteEstimate[] = useMemo(
    () =>
      departureStation
        ? stations
            .filter((station) => station.id !== departureStation.id)
            .map((station) => calcEstimate(departureStation, station))
        : [],
    [departureStation, stations],
  );

  const handleStationClick = (station: ApiStation) => {
    if (step === 'picking-user-location') return;
    if (step === 'recommended-start-selected' || recommendationLoading) return;

    if (step === 'picking-destination' || step === 'destination-selected') {
      if (departureStation?.id === station.id) return;
      setDestinationStation(station);
      setStep('destination-selected');
      return;
    }

    if (departureStation?.id === station.id && step === 'departure-selected') {
      setDepartureStation(null);
      setStep('idle');
      return;
    }

    setDepartureStation(station);
    setStep('departure-selected');
    setDestinationStation(null);
    setRouteCoordinates([]);
    setAccessRouteCoordinates([]);
  };

  useEffect(() => {
    let isActive = true;

    getStations()
      .then((data) => {
        if (!isActive) return;
        setStations(data.filter((station) => station.is_active));
        setError(null);
      })
      .catch((err) => {
        if (!isActive) return;
        setError(err instanceof Error ? err.message : 'Cannot load stations');
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!departureStation || !destinationStation) {
      setRouteCoordinates([]);
      return;
    }

    let isActive = true;

    getRoute({
      origin: {
        latitude: departureStation.latitude,
        longitude: departureStation.longitude,
      },
      destination: {
        latitude: destinationStation.latitude,
        longitude: destinationStation.longitude,
      },
      battery_level: 100,
      stations: [],
    })
      .then((route) => {
        if (!isActive) return;
        if (route.status === 'ok' && route.geometry?.coordinates?.length) {
          setRouteCoordinates(
            route.geometry.coordinates.map(([longitude, latitude]) => ({
              latitude,
              longitude,
            })),
          );
          return;
        }

        setRouteCoordinates([
          stationCoordinate(departureStation),
          stationCoordinate(destinationStation),
        ]);
      })
      .catch(() => {
        if (!isActive) return;
        setRouteCoordinates([
          stationCoordinate(departureStation),
          stationCoordinate(destinationStation),
        ]);
      });

    return () => {
      isActive = false;
    };
  }, [departureStation, destinationStation]);

  useEffect(() => {
    let isActive = true;

    loadLeaflet()
      .then((leaflet) => {
        if (!isActive || !mapElementRef.current || mapRef.current) return;

        leafletRef.current = leaflet;
        const map = leaflet.map(mapElementRef.current, {
          center: [userPosition.latitude, userPosition.longitude],
          zoom: 15,
          zoomControl: false,
        });

        leaflet
          .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
          })
          .addTo(map);

        markerLayerRef.current = leaflet.layerGroup().addTo(map);
        routeLayerRef.current = leaflet.layerGroup().addTo(map);

        const userIcon = leaflet.divIcon({
          className: 'leaflet-user-marker',
          html: '<span></span>',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        userMarkerRef.current = leaflet
          .marker([userPosition.latitude, userPosition.longitude], { icon: userIcon })
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
  }, [userPosition.latitude, userPosition.longitude]);

  const handleRecommendForDestination = async (destination: ApiStation) => {
    setRecommendationLoading(true);
    setRecommendationError(null);
    setDepartureStation(null);
    setDestinationStation(destination);
    setRouteCoordinates([]);
    setAccessRouteCoordinates([]);

    try {
      const station = await recommendStartStation({
        origin: userPosition,
        destination: stationCoordinate(destination),
        max_access_distance_m: 2500,
        max_expected_duration_min: 30,
      });

      setDepartureStation(station);
      setStep('recommended-start-selected');

      try {
        const route = await getRoute({
          origin: userPosition,
          destination: stationCoordinate(station),
          battery_level: 100,
          stations: [],
        });

        if (route.status === 'ok' && route.geometry?.coordinates?.length) {
          setAccessRouteCoordinates(
            route.geometry.coordinates.map(([longitude, latitude]) => ({
              latitude,
              longitude,
            })),
          );
          return;
        }
      } catch {
        // Keep a direct access route if routing service is unavailable.
      }

      setAccessRouteCoordinates([userPosition, stationCoordinate(station)]);
    } catch (err) {
      setDepartureStation(null);
      setDestinationStation(null);
      setStep('idle');
      setRecommendationError(err instanceof Error ? err.message : 'Cannot recommend start station');
    } finally {
      setRecommendationLoading(false);
    }
  };

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = (event: any) => {
      if (step !== 'picking-user-location') return;

      const nextPosition = {
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      };
      setUserPosition(nextPosition);
      setAccessRouteCoordinates([]);
      setRouteCoordinates([]);
      setRecommendationError(null);
      setStep('idle');
      map.setView([nextPosition.latitude, nextPosition.longitude], Math.max(map.getZoom(), 15), { animate: true });
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [step]);

  useEffect(() => {
    const leaflet = leafletRef.current;
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    const routeLayer = routeLayerRef.current;
    if (!leaflet || !map || !markerLayer || !routeLayer) return;

    markerLayer.clearLayers();
    routeLayer.clearLayers();
    userMarkerRef.current?.setLatLng([userPosition.latitude, userPosition.longitude]);

    const stationLatLngs: [number, number][] = [];

    stations.forEach((station) => {
      const isDeparture = departureStation?.id === station.id;
      const isDestination = destinationStation?.id === station.id;
      const isPickingDestination = step === 'picking-destination' || step === 'destination-selected';
      const estimate = destinationEstimates.find((item) => item.station.id === station.id);
      const icon = leaflet.divIcon({
        className: 'leaflet-station-marker-wrap',
        html: stationMarkerHtml(station, {
          isDeparture,
          isDestination,
          isPickingDestination,
          estimate,
        }),
        iconSize: [86, 34],
        iconAnchor: [43, 34],
      });

      const marker = leaflet.marker([station.latitude, station.longitude], { icon });
      marker.on('click', (event: any) => {
        event.originalEvent?.stopPropagation();
        handleStationClick(station);
      });
      marker.addTo(markerLayer);
      stationLatLngs.push([station.latitude, station.longitude]);
    });

    if (departureStation && destinationStation) {
      const routeLatLngs = routeCoordinates.length > 1
        ? routeCoordinates.map((coordinate) => [coordinate.latitude, coordinate.longitude])
        : [
            [departureStation.latitude, departureStation.longitude],
            [destinationStation.latitude, destinationStation.longitude],
          ];

      leaflet
        .polyline(routeLatLngs, { color: '#16a34a', weight: 5, opacity: 0.85, dashArray: '8 8' })
        .addTo(routeLayer);

      map.fitBounds(leaflet.latLngBounds(routeLatLngs), { padding: [90, 42], maxZoom: 16 });
    }

    if (step === 'recommended-start-selected' && departureStation && destinationStation) {
      const accessLatLngs = accessRouteCoordinates.length > 1
        ? accessRouteCoordinates.map((coordinate) => [coordinate.latitude, coordinate.longitude])
        : [
            [userPosition.latitude, userPosition.longitude],
            [departureStation.latitude, departureStation.longitude],
          ];

      leaflet
        .polyline(accessLatLngs, { color: '#2563eb', weight: 5, opacity: 0.82, dashArray: '8 8' })
        .addTo(routeLayer);

      map.fitBounds(
        leaflet.latLngBounds([
          ...accessLatLngs,
          [destinationStation.latitude, destinationStation.longitude],
        ]),
        { padding: [96, 42], maxZoom: 16 },
      );
    }

    if (stationLatLngs.length > 0 && !departureStation) {
      map.fitBounds(
        leaflet.latLngBounds([
          [userPosition.latitude, userPosition.longitude],
          ...stationLatLngs,
        ]),
        { padding: [42, 42], maxZoom: 16 },
      );
    }
  }, [
    accessRouteCoordinates,
    destinationEstimates,
    departureStation,
    destinationStation,
    routeCoordinates,
    router,
    stations,
    step,
    userPosition,
  ]);

  const handleChooseDeparture = () => {
    setStep('choose-destination-prompt');
  };

  const handleChooseAsDestination = () => {
    if (!departureStation) return;
    void handleRecommendForDestination(departureStation);
  };

  const handleNoDestination = () => {
    if (!departureStation) return;
    router.push(`/vehicle-selection-rental?from=${departureStation.id}`);
  };

  const handleChooseDestination = () => {
    setStep('picking-destination');
  };

  const handleCancelPrompt = () => {
    setStep('departure-selected');
  };

  const handleCancelPickingDestination = () => {
    setStep('choose-destination-prompt');
  };

  const handleChangeDestination = () => {
    setDestinationStation(null);
    setRouteCoordinates([]);
    setStep('picking-destination');
  };

  const handleConfirmDestination = () => {
    if (!departureStation || !destinationStation) return;
    router.push(`/vehicle-selection-rental?from=${departureStation.id}&to=${destinationStation.id}`);
  };

  const handleConfirmRecommendation = () => {
    if (!departureStation || !destinationStation) return;
    router.push(`/vehicle-selection-rental?from=${departureStation.id}&to=${destinationStation.id}`);
  };

  const handlePickUserLocation = () => {
    setDepartureStation(null);
    setDestinationStation(null);
    setRouteCoordinates([]);
    setAccessRouteCoordinates([]);
    setRecommendationError(null);
    setStep('picking-user-location');
  };

  const handleReset = () => {
    setDepartureStation(null);
    setDestinationStation(null);
    setRouteCoordinates([]);
    setAccessRouteCoordinates([]);
    setRecommendationError(null);
    setStep('idle');
  };

  const handleLocateUser = () => {
    mapRef.current?.setView([userPosition.latitude, userPosition.longitude], 16, { animate: true });
  };

  return (
    <div className="flex-1 relative overflow-hidden bg-background" style={{ minHeight: '100vh' }}>
      <div ref={mapElementRef} className="absolute inset-0 z-0" />

      {mapError && (
        <div className="absolute top-20 left-4 right-4 z-50 rounded-2xl bg-card border border-danger/30 p-3 shadow-card">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-danger" />
            <p className="text-xs font-semibold text-danger">{mapError}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/70">
          <div className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3 shadow-card border border-border">
            <Loader2 size={16} className="text-primary animate-spin" />
            <span className="text-xs font-semibold text-foreground">Loading stations...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-20 left-4 right-4 z-50 rounded-2xl bg-card border border-danger/30 p-3 shadow-card">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-danger" />
            <p className="text-xs font-semibold text-danger">{error}</p>
          </div>
        </div>
      )}

      {recommendationError && (
        <div className="absolute top-20 left-4 right-4 z-50 rounded-2xl bg-card border border-danger/30 p-3 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <AlertTriangle size={16} className="text-danger flex-shrink-0" />
              <p className="truncate text-xs font-semibold text-danger">{recommendationError}</p>
            </div>
            <button onClick={() => setRecommendationError(null)} className="p-1 rounded-lg hover:bg-muted">
              <X size={12} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {recommendationLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50">
          <div className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3 shadow-card border border-border">
            <Loader2 size={16} className="text-primary animate-spin" />
            <span className="text-xs font-semibold text-foreground">Finding best start station...</span>
          </div>
        </div>
      )}

      {!loading && !error && stations.length === 0 && (
        <div className="absolute inset-x-4 top-24 z-40 rounded-2xl bg-card border border-border p-4 shadow-card text-center">
          <p className="text-sm font-bold text-foreground">No stations yet</p>
          <p className="text-xs text-muted-foreground mt-1">Create stations from backend first.</p>
        </div>
      )}

      {step === 'picking-user-location' && (
        <div className="absolute top-16 left-4 right-4 z-40 fade-in-up">
          <div className="bg-card rounded-2xl shadow-card-lg p-3 border-2 border-info/30 flex items-center gap-3">
            <div className="w-8 h-8 bg-info/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Navigation size={16} className="text-info" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground">Ban dang o dau?</p>
              <p className="text-[10px] text-muted-foreground truncate">Cham len ban do de dat vi tri hien tai</p>
            </div>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-xl hover:bg-muted transition-colors flex-shrink-0"
            >
              <X size={14} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {step === 'departure-selected' && departureStation && (
        <div className="absolute left-4 right-4 bottom-28 z-40 fade-in-up">
          <div className="bg-card rounded-2xl shadow-card-lg p-3 border border-border">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{departureStation.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{departureStation.address}</p>
              </div>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  handleReset();
                }}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X size={12} className="text-muted-foreground" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="text-center">
                <p className="text-base font-bold text-primary tabular-nums">{getAvailableVehicles(departureStation)}</p>
                <p className="text-[9px] text-muted-foreground">ready vehicles</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-base font-bold text-foreground tabular-nums">
                  {departureStation.average_battery_level ?? '--'}%
                </p>
                <p className="text-[9px] text-muted-foreground">avg battery</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  handleChooseDeparture();
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-primary text-white rounded-xl text-[11px] font-semibold active:scale-95 transition-all duration-150"
              >
                <Zap size={12} fill="white" />
                Di tu day
              </button>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  handleChooseAsDestination();
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-secondary text-secondary-foreground rounded-xl text-[11px] font-semibold active:scale-95 transition-all duration-150"
              >
                <MapPin size={12} />
                Den day
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'choose-destination-prompt' && departureStation && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-card rounded-2xl shadow-card-lg p-5 mx-6 w-full max-w-xs fade-in-up">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-bold text-foreground">Tram xuat phat</p>
              <button
                onClick={handleCancelPrompt}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X size={14} className="text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-primary font-semibold mb-4 truncate">{departureStation.name}</p>

            <p className="text-xs text-muted-foreground mb-3">Ban co muon chon tram den khong?</p>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleChooseDestination}
                className="w-full flex items-center justify-between px-4 py-3 bg-secondary text-secondary-foreground rounded-xl text-sm font-semibold active:scale-95 transition-all duration-150"
              >
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-primary" />
                  <span>Chon tram den</span>
                </div>
                <ChevronRight size={15} className="text-muted-foreground" />
              </button>
              <button
                onClick={handleNoDestination}
                className="w-full flex items-center justify-between px-4 py-3 bg-primary text-white rounded-xl text-sm font-semibold active:scale-95 transition-all duration-150"
              >
                <div className="flex items-center gap-2">
                  <Zap size={15} fill="white" />
                  <span>Khong chon tram den</span>
                </div>
                <ChevronRight size={15} className="text-white/70" />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'picking-destination' && departureStation && (
        <div className="absolute top-16 left-4 right-4 z-40 fade-in-up">
          <div className="bg-card rounded-2xl shadow-card-lg p-3 border-2 border-primary/30 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground">Chon tram den</p>
              <p className="text-[10px] text-muted-foreground truncate">Nhan vao tram de xem gia uoc tinh</p>
            </div>
            <button
              onClick={handleCancelPickingDestination}
              className="p-1.5 rounded-xl hover:bg-muted transition-colors flex-shrink-0"
            >
              <X size={14} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {step === 'destination-selected' && departureStation && destinationStation && (
        <div className="absolute left-4 right-4 bottom-28 z-40 fade-in-up">
          <div className="bg-card rounded-2xl shadow-card-lg p-3 border border-border">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold text-muted-foreground">Tuyen da chon</p>
                <p className="mt-0.5 truncate text-xs font-bold text-foreground">
                  {departureStation.name} -&gt; {destinationStation.name}
                </p>
              </div>
              <button
                onClick={handleReset}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X size={12} className="text-muted-foreground" />
              </button>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-muted/60 px-3 py-2">
                <p className="text-[9px] text-muted-foreground">Gia uoc tinh</p>
                <p className="text-sm font-bold text-primary">
                  {formatVND(destinationEstimates.find((item) => item.station.id === destinationStation.id)?.estimatedCost ?? 7000)}
                </p>
              </div>
              <div className="rounded-xl bg-muted/60 px-3 py-2">
                <p className="text-[9px] text-muted-foreground">So diem route</p>
                <p className="text-sm font-bold text-foreground">{Math.max(routeCoordinates.length, 2)}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleChangeDestination}
                className="flex-1 rounded-xl bg-secondary px-3 py-2.5 text-xs font-semibold text-secondary-foreground active:scale-95 transition-all duration-150"
              >
                Doi tram den
              </button>
              <button
                onClick={handleConfirmDestination}
                className="flex-1 rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-white active:scale-95 transition-all duration-150"
              >
                Chon xe
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'recommended-start-selected' && departureStation && destinationStation && (
        <div className="absolute left-4 right-4 bottom-28 z-40 fade-in-up">
          <div className="bg-card rounded-2xl shadow-card-lg p-3 border border-border">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold text-muted-foreground">Recommended start station</p>
                <p className="mt-0.5 truncate text-xs font-bold text-foreground">{departureStation.name}</p>
                <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                  To {destinationStation.name}
                </p>
              </div>
              <button
                onClick={handleReset}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X size={12} className="text-muted-foreground" />
              </button>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-muted/60 px-3 py-2">
                <p className="text-[9px] text-muted-foreground">Ready vehicles</p>
                <p className="text-sm font-bold text-primary">{getAvailableVehicles(departureStation)}</p>
              </div>
              <div className="rounded-xl bg-muted/60 px-3 py-2">
                <p className="text-[9px] text-muted-foreground">Route points</p>
                <p className="text-sm font-bold text-foreground">{Math.max(accessRouteCoordinates.length, 2)}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 rounded-xl bg-secondary px-3 py-2.5 text-xs font-semibold text-secondary-foreground active:scale-95 transition-all duration-150"
              >
                Chon lai diem den
              </button>
              <button
                onClick={handleConfirmRecommendation}
                className="flex-1 rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-white active:scale-95 transition-all duration-150"
              >
                Chon xe
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleLocateUser}
        className="absolute bottom-24 right-4 z-30 bg-card rounded-2xl p-3 shadow-card-lg active:scale-95 transition-all duration-150"
      >
        <Navigation size={20} className="text-primary" />
      </button>

      <button
        onClick={handlePickUserLocation}
        className="absolute bottom-24 left-4 z-30 rounded-2xl bg-card px-3 py-2.5 shadow-card-lg border border-border active:scale-95 transition-all duration-150"
      >
        <span className="text-xs font-bold text-foreground">Ban dang o?</span>
      </button>

      <div className="absolute bottom-40 right-4 z-30 flex flex-col gap-1">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="bg-card rounded-xl w-10 h-10 flex items-center justify-center shadow-card text-foreground text-lg font-bold active:scale-95 transition-all duration-150 border border-border"
        >
          +
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="bg-card rounded-xl w-10 h-10 flex items-center justify-center shadow-card text-foreground text-lg font-bold active:scale-95 transition-all duration-150 border border-border"
        >
          -
        </button>
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

        .leaflet-station-marker-wrap {
          background: transparent;
          border: 0;
        }

        .leaflet-station-marker {
          align-items: center;
          background: #ffffff;
          border: 2px solid #16a34a;
          border-radius: 14px;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.18);
          color: #16a34a;
          cursor: pointer;
          display: inline-flex;
          font-size: 11px;
          font-weight: 800;
          gap: 5px;
          height: 28px;
          justify-content: center;
          min-width: 58px;
          padding: 0 10px;
          position: relative;
          white-space: nowrap;
        }

        .leaflet-station-marker::after {
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid #16a34a;
          bottom: -9px;
          content: '';
          left: 50%;
          position: absolute;
          transform: translateX(-50%);
        }

        .leaflet-station-marker--departure {
          background: #16a34a;
          color: #ffffff;
          transform: scale(1.08);
        }

        .leaflet-station-marker--destination {
          background: #f59e0b;
          border-color: #f59e0b;
          color: #ffffff;
        }

        .leaflet-station-marker--destination::after {
          border-top-color: #f59e0b;
        }

        .leaflet-station-marker--empty {
          border-color: #94a3b8;
          color: #64748b;
        }

        .leaflet-station-marker--empty::after {
          border-top-color: #94a3b8;
        }

        .leaflet-station-marker__icon {
          font-size: 9px;
          line-height: 1;
        }

        .leaflet-free-destination-marker {
          background: transparent;
          border: 0;
        }

        .leaflet-free-destination-marker span {
          background: #f59e0b;
          border: 3px solid #ffffff;
          border-radius: 999px;
          box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
          display: block;
          height: 20px;
          width: 20px;
        }

        .leaflet-user-marker {
          background: transparent;
          border: 0;
        }

        .leaflet-user-marker span {
          background: #3b82f6;
          border: 3px solid #ffffff;
          border-radius: 999px;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.45);
          display: block;
          height: 22px;
          position: relative;
          width: 22px;
        }

        .leaflet-user-marker span::after {
          animation: leaflet-user-pulse 1.8s infinite;
          background: rgba(59, 130, 246, 0.22);
          border-radius: 999px;
          content: '';
          inset: -10px;
          position: absolute;
        }

        @keyframes leaflet-user-pulse {
          0% {
            opacity: 0.8;
            transform: scale(0.7);
          }
          100% {
            opacity: 0;
            transform: scale(1.5);
          }
        }
      `}</style>
    </div>
  );
}
