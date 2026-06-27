'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Navigation, Zap, MapPin, X, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ApiStation } from './LeafletMapComponent';

const LeafletMap = dynamic(() => import('./LeafletMapComponent'), { ssr: false });

type FlowStep = 'idle' | 'departure-selected' | 'choose-destination-prompt' | 'picking-destination';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export default function MapView() {
  const router = useRouter();
  const [stations, setStations] = useState<ApiStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<FlowStep>('idle');
  const [departureStation, setDepartureStation] = useState<ApiStation | null>(null);
  const [destinationStation, setDestinationStation] = useState<ApiStation | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/stations`)
      .then((r) => r.json())
      .then((data: ApiStation[]) => setStations(data.filter((s) => s.is_active)))
      .catch(() => setStations([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true },
    );
  }, []);

  const handleStationClick = useCallback(
    (station: ApiStation) => {
      if (step === 'picking-destination') {
        setDestinationStation(station);
        router.push(`/vehicle-selection-rental?from=${departureStation?.id}&to=${station.id}`);
        return;
      }
      if (departureStation?.id === station.id && step === 'departure-selected') {
        setDepartureStation(null);
        setStep('idle');
        return;
      }
      setDepartureStation(station);
      setDestinationStation(null);
      setStep('departure-selected');
    },
    [step, departureStation, router],
  );

  const handleChooseDeparture = () => setStep('choose-destination-prompt');
  const handleNoDestination = () => router.push(`/vehicle-selection-rental?from=${departureStation?.id}`);
  const handleChooseDestination = () => setStep('picking-destination');
  const handleCancelPrompt = () => setStep('departure-selected');
  const handleCancelPickingDestination = () => setStep('choose-destination-prompt');
  const handleReset = () => { setDepartureStation(null); setDestinationStation(null); setStep('idle'); };
  const handleRecenter = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition([pos.coords.latitude, pos.coords.longitude]);
        setRecenterTrigger((t) => t + 1);
      },
      () => {},
      { enableHighAccuracy: true },
    );
  };

  return (
    <div className="flex-1 relative overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* Leaflet Map */}
      <div className="absolute inset-0">
        {!loading && (
          <LeafletMap
            stations={stations}
            step={step}
            departureId={departureStation?.id}
            destinationId={destinationStation?.id}
            onStationClick={handleStationClick}
            userPosition={userPosition}
            recenterTrigger={recenterTrigger}
          />
        )}
        {loading && (
          <div className="flex items-center justify-center h-full bg-muted/30">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Departure station info card */}
      {step === 'departure-selected' && departureStation && (
        <div className="absolute bottom-24 left-4 right-4 z-[1000] fade-in-up">
          <div className="bg-card rounded-2xl shadow-card-lg p-3 border border-border">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{departureStation.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{departureStation.address}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleReset(); }}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X size={12} className="text-muted-foreground" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="text-center">
                <p className="text-base font-bold text-primary tabular-nums">{departureStation.available_vehicle_count}</p>
                <p className="text-[9px] text-muted-foreground">xe có sẵn</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-base font-bold text-foreground tabular-nums">{departureStation.total_vehicle_count}</p>
                <p className="text-[9px] text-muted-foreground">tổng xe</p>
              </div>
              {departureStation.average_battery_level !== null && (
                <>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center">
                    <p className="text-base font-bold text-foreground tabular-nums">
                      {Math.round(departureStation.average_battery_level)}%
                    </p>
                    <p className="text-[9px] text-muted-foreground">pin TB</p>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); handleChooseDeparture(); }}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-primary text-white rounded-xl text-[12px] font-semibold active:scale-95 transition-all duration-150"
            >
              <Zap size={12} fill="white" />
              Chọn trạm xuất phát
            </button>
          </div>
        </div>
      )}

      {/* Choose destination prompt modal */}
      {step === 'choose-destination-prompt' && departureStation && (
        <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-black/30">
          <div className="bg-card rounded-2xl shadow-card-lg p-5 mx-6 w-full max-w-xs fade-in-up">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-bold text-foreground">Trạm xuất phát</p>
              <button onClick={handleCancelPrompt} className="p-1 rounded-lg hover:bg-muted transition-colors">
                <X size={14} className="text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-primary font-semibold mb-4 truncate">{departureStation.name}</p>
            <p className="text-xs text-muted-foreground mb-3">Bạn có muốn chọn trạm đến không?</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleChooseDestination}
                className="w-full flex items-center justify-between px-4 py-3 bg-secondary text-secondary-foreground rounded-xl text-sm font-semibold active:scale-95 transition-all duration-150"
              >
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-primary" />
                  <span>Chọn trạm đến</span>
                </div>
                <ChevronRight size={15} className="text-muted-foreground" />
              </button>
              <button
                onClick={handleNoDestination}
                className="w-full flex items-center justify-between px-4 py-3 bg-primary text-white rounded-xl text-sm font-semibold active:scale-95 transition-all duration-150"
              >
                <div className="flex items-center gap-2">
                  <Zap size={15} fill="white" />
                  <span>Không chọn trạm đến</span>
                </div>
                <ChevronRight size={15} className="text-white/70" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Picking destination banner */}
      {step === 'picking-destination' && departureStation && (
        <div className="absolute top-16 left-4 right-4 z-[1000] fade-in-up">
          <div className="bg-card rounded-2xl shadow-card-lg p-3 border-2 border-primary/30 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground">Chọn trạm đến</p>
              <p className="text-[10px] text-muted-foreground truncate">Nhấn vào trạm để xem giá ước tính</p>
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

      {/* My location button */}
      <button
        onClick={handleRecenter}
        className="absolute bottom-24 right-4 z-[1000] bg-card rounded-2xl p-3 shadow-card-lg active:scale-95 transition-all duration-150"
      >
        <Navigation size={20} className="text-primary" />
      </button>
    </div>
  );
}
