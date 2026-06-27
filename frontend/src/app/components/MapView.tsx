'use client';

import React, { useState } from 'react';
import { Navigation, Zap, MapPin, X, ChevronRight } from 'lucide-react';
import { MOCK_STATIONS, formatVND } from '../../lib/mockData';
import type { Station } from '../../lib/mockData';
import { useRouter } from 'next/navigation';

type FlowStep = 'idle' | 'departure-selected' | 'choose-destination-prompt' | 'picking-destination';

interface RouteEstimate {
  station: Station;
  distanceKm: number;
  durationMin: number;
  estimatedCost: number;
}

function calcEstimate(from: Station, to: Station): RouteEstimate {
  const distKm =
    Math.round(
      Math.sqrt(
        Math.pow((to.lat - from.lat) * 1.1, 2) + Math.pow((to.lng - from.lng) * 1.1, 2)
      ) *
        0.4 *
        10
    ) / 10;
  const dur = Math.round(distKm * 4);
  const cost = dur * 1500;
  return { station: to, distanceKm: distKm, durationMin: dur, estimatedCost: cost };
}

export default function MapView() {
  const router = useRouter();
  const [step, setStep] = useState<FlowStep>('idle');
  const [departureStation, setDepartureStation] = useState<Station | null>(null);
  const [destinationStation, setDestinationStation] = useState<Station | null>(null);

  const userPosition = { lat: 50, lng: 55 };

  // Estimates from departure to all other stations
  const destinationEstimates: RouteEstimate[] = departureStation
    ? MOCK_STATIONS.filter((s) => s.id !== departureStation.id).map((s) =>
        calcEstimate(departureStation, s)
      )
    : [];

  const handleStationClick = (station: Station) => {
    if (step === 'picking-destination') {
      // Selecting destination station
      setDestinationStation(station);
      router.push(
        `/vehicle-selection-rental?from=${departureStation?.id}&to=${station.id}`
      );
      return;
    }
    // Normal: select departure
    if (departureStation?.id === station.id && step === 'departure-selected') {
      // Deselect
      setDepartureStation(null);
      setStep('idle');
      return;
    }
    setDepartureStation(station);
    setStep('departure-selected');
    setDestinationStation(null);
  };

  const handleChooseDeparture = () => {
    setStep('choose-destination-prompt');
  };

  const handleNoDestination = () => {
    router.push(`/vehicle-selection-rental?from=${departureStation?.id}`);
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

  const handleReset = () => {
    setDepartureStation(null);
    setDestinationStation(null);
    setStep('idle');
  };

  return (
    <div className="flex-1 relative map-container map-grid overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* Roads */}
      <div className="map-road-h map-road-major" style={{ top: '35%', left: 0, right: 0 }} />
      <div className="map-road-h" style={{ top: '55%', left: '10%', right: '5%' }} />
      <div className="map-road-h" style={{ top: '70%', left: '20%', right: '15%' }} />
      <div className="map-road-v map-road-major" style={{ left: '48%', top: 0, bottom: 0 }} />
      <div className="map-road-v" style={{ left: '25%', top: '10%', bottom: '20%' }} />
      <div className="map-road-v" style={{ left: '70%', top: '20%', bottom: '10%' }} />

      {/* Map blocks (buildings) */}
      <div className="map-block absolute" style={{ top: '15%', left: '10%', width: '12%', height: '8%' }} />
      <div className="map-block absolute" style={{ top: '15%', left: '25%', width: '18%', height: '12%' }} />
      <div className="map-block-green absolute" style={{ top: '45%', left: '55%', width: '20%', height: '18%' }} />
      <div className="map-block absolute" style={{ top: '60%', left: '30%', width: '14%', height: '8%' }} />
      <div className="map-block absolute" style={{ top: '20%', left: '62%', width: '16%', height: '10%' }} />
      <div className="map-block-green absolute" style={{ top: '72%', left: '62%', width: '22%', height: '14%' }} />
      <div className="map-block absolute" style={{ top: '8%', left: '52%', width: '10%', height: '6%' }} />

      {/* Route line when destination is picked */}
      {step === 'picking-destination' && departureStation && destinationStation && (
        <svg
          className="route-line absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="3" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#16a34a" />
            </marker>
          </defs>
          <polyline
            points={`${departureStation.lng},${departureStation.lat} ${(departureStation.lng + destinationStation.lng) / 2},${(departureStation.lat + destinationStation.lat) / 2 - 5} ${destinationStation.lng},${destinationStation.lat}`}
            fill="none"
            stroke="#16a34a"
            strokeWidth="0.8"
            strokeDasharray="2,1"
            markerEnd="url(#arrowhead)"
          />
        </svg>
      )}

      {/* User location */}
      <div
        className="absolute z-20"
        style={{ left: `${userPosition.lng}%`, top: `${userPosition.lat}%`, transform: 'translate(-50%, -50%)' }}
      >
        <div className="relative">
          <div className="w-5 h-5 bg-info rounded-full border-2 border-white shadow-lg z-10 relative" />
          <div className="absolute inset-0 w-5 h-5 bg-info/30 rounded-full animate-ping" />
          <div className="absolute -inset-3 bg-info/10 rounded-full" />
        </div>
      </div>

      {/* Station pins */}
      {MOCK_STATIONS.map((station) => {
        const isDeparture = departureStation?.id === station.id;
        const isDestination = destinationStation?.id === station.id;
        const isAvailable = station.status === 'open' && station.availableVehicles > 0;
        const estimate = destinationEstimates.find((e) => e.station.id === station.id);
        const isPickingDest = step === 'picking-destination';
        const isHiddenInPickDest = isPickingDest && isDeparture;

        if (isHiddenInPickDest) return null;

        return (
          <div
            key={station.id}
            className={`station-pin ${isDeparture ? 'active' : ''}`}
            style={{ left: `${station.lng}%`, top: `${station.lat}%` }}
            onClick={() => handleStationClick(station)}
          >
            <div className="relative flex flex-col items-center cursor-pointer">
              <div
                className={`px-2.5 py-1.5 rounded-xl shadow-pin flex items-center gap-1.5 transition-all duration-150 ${
                  isDestination
                    ? 'bg-accent text-white'
                    : isDeparture
                    ? 'bg-primary text-white scale-110'
                    : isAvailable
                    ? 'bg-card border-2 border-primary text-primary' :'bg-card border-2 border-muted-foreground/30 text-muted-foreground'
                }`}
              >
                {isDestination ? (
                  <MapPin size={12} />
                ) : (
                  <Zap size={12} fill="currentColor" />
                )}
                {isPickingDest && estimate ? (
                  <span className="text-[10px] font-bold tabular-nums">{formatVND(estimate.estimatedCost)}</span>
                ) : (
                  <span className="text-[11px] font-bold tabular-nums">{station.availableVehicles}</span>
                )}
              </div>
              {/* Pin tail */}
              <div
                className="w-0 h-0 -mt-[1px]"
                style={{
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderTop: `7px solid ${
                    isDestination
                      ? '#f59e0b'
                      : isDeparture
                      ? '#16a34a'
                      : isAvailable
                      ? '#16a34a' :'#94a3b8'
                  }`,
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Departure station popup */}
      {step === 'departure-selected' && departureStation && (
        <div
          className="absolute z-40 fade-in-up"
          style={{
            left: `${Math.min(Math.max(departureStation.lng, 20), 70)}%`,
            top: `${Math.max(departureStation.lat - 18, 12)}%`,
            transform: 'translateX(-50%)',
            minWidth: '220px',
          }}
        >
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
                <p className="text-base font-bold text-primary tabular-nums">{departureStation.availableVehicles}</p>
                <p className="text-[9px] text-muted-foreground">xe có sẵn</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-base font-bold text-foreground tabular-nums">{departureStation.walkMinutes}</p>
                <p className="text-[9px] text-muted-foreground">phút đi bộ</p>
              </div>
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

      {/* Choose destination prompt popup */}
      {step === 'choose-destination-prompt' && departureStation && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-card rounded-2xl shadow-card-lg p-5 mx-6 w-full max-w-xs fade-in-up">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-bold text-foreground">Trạm xuất phát</p>
              <button
                onClick={handleCancelPrompt}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
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
        <div className="absolute top-16 left-4 right-4 z-40 fade-in-up">
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
      <button className="absolute bottom-24 right-4 z-30 bg-card rounded-2xl p-3 shadow-card-lg active:scale-95 transition-all duration-150">
        <Navigation size={20} className="text-primary" />
      </button>

      {/* Zoom controls */}
      <div className="absolute bottom-40 right-4 z-30 flex flex-col gap-1">
        <button className="bg-card rounded-xl w-10 h-10 flex items-center justify-center shadow-card text-foreground text-lg font-bold active:scale-95 transition-all duration-150 border border-border">
          +
        </button>
        <button className="bg-card rounded-xl w-10 h-10 flex items-center justify-center shadow-card text-foreground text-lg font-bold active:scale-95 transition-all duration-150 border border-border">
          −
        </button>
      </div>
    </div>
  );
}