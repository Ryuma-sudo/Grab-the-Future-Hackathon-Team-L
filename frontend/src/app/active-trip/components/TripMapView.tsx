'use client';

import React from 'react';
import { MapPin, Zap } from 'lucide-react';

interface TripMapViewProps {
  batteryPercent: number;
  distanceKm: number;
}

export default function TripMapView({ batteryPercent, distanceKm }: TripMapViewProps) {
  // User moves along route as distance increases
  const progress = Math.min(distanceKm / 5, 1); // normalize over 5km route
  const userLat = 50 - progress * 22;
  const userLng = 50 + progress * 8;

  return (
    <div className="flex-1 relative map-container map-grid overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* Roads */}
      <div className="map-road-h map-road-major" style={{ top: '35%', left: 0, right: 0 }} />
      <div className="map-road-h" style={{ top: '55%', left: '10%', right: '5%' }} />
      <div className="map-road-h" style={{ top: '70%', left: '20%', right: '15%' }} />
      <div className="map-road-v map-road-major" style={{ left: '48%', top: 0, bottom: 0 }} />
      <div className="map-road-v" style={{ left: '25%', top: '10%', bottom: '20%' }} />
      <div className="map-road-v" style={{ left: '70%', top: '20%', bottom: '10%' }} />

      {/* Blocks */}
      <div className="map-block absolute" style={{ top: '15%', left: '10%', width: '12%', height: '8%' }} />
      <div className="map-block absolute" style={{ top: '15%', left: '25%', width: '18%', height: '12%' }} />
      <div className="map-block-green absolute" style={{ top: '45%', left: '55%', width: '20%', height: '18%' }} />
      <div className="map-block absolute" style={{ top: '60%', left: '30%', width: '14%', height: '8%' }} />
      <div className="map-block absolute" style={{ top: '20%', left: '62%', width: '16%', height: '10%' }} />

      {/* Route path */}
      <svg
        className="route-line absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="1" />
          </linearGradient>
        </defs>
        {/* Completed route */}
        <polyline
          points={`50,50 ${50 + progress * 4},${50 - progress * 11} ${userLng},${userLat}`}
          fill="none"
          stroke="#16a34a"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Remaining route */}
        <polyline
          points={`${userLng},${userLat} ${userLng + 2},${userLat - 6} 58,28`}
          fill="none"
          stroke="#16a34a"
          strokeWidth="0.8"
          strokeDasharray="2,1.5"
          opacity="0.5"
        />
        {/* Origin marker */}
        <circle cx="50" cy="50" r="1.5" fill="#16a34a" opacity="0.5" />
        {/* Destination marker */}
        <circle cx="58" cy="28" r="2" fill="#f59e0b" />
        <circle cx="58" cy="28" r="3.5" fill="#f59e0b" opacity="0.2" />
      </svg>

      {/* Origin station */}
      <div
        className="absolute z-10"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <div className="flex flex-col items-center">
          <div className="px-2 py-1 bg-muted/80 rounded-lg border border-border">
            <span className="text-[9px] font-bold text-muted-foreground">Điểm xuất phát</span>
          </div>
        </div>
      </div>

      {/* Destination station */}
      <div
        className="absolute z-20"
        style={{ left: '58%', top: '28%', transform: 'translate(-50%, -100%)' }}
      >
        <div className="flex flex-col items-center">
          <div className="px-2.5 py-1.5 bg-accent text-white rounded-xl shadow-pin flex items-center gap-1">
            <MapPin size={10} />
            <span className="text-[10px] font-bold">Trạm đích</span>
          </div>
          <div className="w-0 h-0" style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '6px solid #f59e0b' }} />
        </div>
      </div>

      {/* User location (moving) */}
      <div
        className="absolute z-30 transition-all duration-1000"
        style={{ left: `${userLng}%`, top: `${userLat}%`, transform: 'translate(-50%, -50%)' }}
      >
        <div className="relative">
          <div className="w-6 h-6 bg-primary rounded-full border-3 border-white shadow-lg z-10 relative flex items-center justify-center border-[3px]">
            <Zap size={10} className="text-white" fill="white" />
          </div>
          <div className="absolute inset-0 w-6 h-6 bg-primary/30 rounded-full animate-ping" />
        </div>
      </div>

      {/* Battery warning overlay when critical */}
      {batteryPercent <= 5 && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(239,68,68,0.08) 100%)' }} />
      )}

      {/* Map attribution */}
      <div className="absolute bottom-2 right-2 bg-white/70 rounded px-1.5 py-0.5">
        <span className="text-[8px] text-muted-foreground">EV Rental Maps</span>
      </div>
    </div>
  );
}