'use client';

import React, { useState } from 'react';
import { Clock, Route, Wallet, Zap, ChevronUp, Square } from 'lucide-react';
import type { TripState } from './ActiveTripClient';
import { formatVND } from '../../../lib/api';
import BatteryIndicator from '../../../components/ui/BatteryIndicator';

interface TripStatsBarProps {
  trip: TripState;
  onEndTrip: () => void;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function TripStatsBar({ trip, onEndTrip }: TripStatsBarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`absolute left-0 right-0 bottom-0 bg-card rounded-t-3xl shadow-bottom-sheet border-t border-border bottom-sheet transition-all duration-350 ${
        expanded ? 'max-h-[65vh]' : 'max-h-[200px]'
      } overflow-hidden flex flex-col z-40`}
    >
      {/* Handle */}
      <button
        className="flex flex-col items-center pt-3 pb-1 active:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-10 h-1 bg-muted-foreground/20 rounded-full mb-2" />
        <div className="flex items-center gap-2 px-4">
          <div className="w-2 h-2 rounded-full bg-primary pulse-dot" />
          <span className="text-xs font-bold text-foreground">Chuyến đi đang diễn ra</span>
          <ChevronUp
            size={14}
            className={`text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Main stats */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="flex flex-col items-center bg-muted rounded-xl p-2.5">
            <Clock size={14} className="text-muted-foreground mb-1" />
            <span className="text-sm font-bold text-foreground tabular-nums trip-counter">
              {formatElapsed(trip.elapsedSeconds)}
            </span>
            <span className="text-[9px] text-muted-foreground">Thời gian</span>
          </div>
          <div className="flex flex-col items-center bg-muted rounded-xl p-2.5">
            <Route size={14} className="text-muted-foreground mb-1" />
            <span className="text-sm font-bold text-foreground tabular-nums trip-counter">
              {trip.distanceKm.toFixed(1)}
            </span>
            <span className="text-[9px] text-muted-foreground">km</span>
          </div>
          <div className="flex flex-col items-center bg-primary/10 rounded-xl p-2.5">
            <Wallet size={14} className="text-primary mb-1" />
            <span className="text-sm font-bold text-primary tabular-nums trip-counter">
              {formatVND(trip.currentCost)}
            </span>
            <span className="text-[9px] text-muted-foreground">Chi phí</span>
          </div>
          <div className={`flex flex-col items-center rounded-xl p-2.5 ${trip.batteryPercent <= 5 ? 'bg-red-50' : trip.batteryPercent <= 20 ? 'bg-amber-50' : 'bg-muted'}`}>
            <Zap
              size={14}
              className={`mb-1 ${trip.batteryPercent <= 5 ? 'text-danger' : trip.batteryPercent <= 20 ? 'text-warning' : 'text-muted-foreground'}`}
            />
            <BatteryIndicator percent={Math.round(trip.batteryPercent)} size="sm" showLabel={false} />
            <span className={`text-[9px] tabular-nums font-bold ${trip.batteryPercent <= 5 ? 'text-danger' : trip.batteryPercent <= 20 ? 'text-warning' : 'text-muted-foreground'}`}>
              {trip.batteryPercent.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Range remaining */}
        <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-3 py-2 mb-3">
          <Zap size={12} className="text-primary flex-shrink-0" fill="currentColor" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Còn đi được</span>
              <span className="text-xs font-bold text-foreground tabular-nums">{trip.estimatedRangeKm.toFixed(1)} km</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full battery-bar ${
                  trip.batteryPercent <= 5 ? 'bg-danger' : trip.batteryPercent <= 20 ? 'bg-warning' : 'bg-primary'
                }`}
                style={{ width: `${Math.max(2, trip.batteryPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* End trip button */}
        <button
          onClick={onEndTrip}
          className="w-full py-3.5 bg-foreground text-background rounded-2xl text-sm font-bold active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
        >
          <Square size={14} fill="currentColor" />
          Kết thúc chuyến & Trả xe
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 fade-in-up">
          <div className="border-t border-border pt-3">
            <p className="text-xs font-bold text-foreground mb-3">Chi tiết chuyến đi</p>
            <div className="flex flex-col gap-2.5">
              {[
                { label: 'Mã chuyến', value: `#${trip.tripId}` },
                { label: 'Xe', value: trip.vehicleModel },
                { label: 'Tram xuat phat', value: trip.startStationName },
                { label: 'Tram den', value: trip.destinationStationName },
                { label: 'Gia sau 5 phut', value: `${formatVND(trip.pricePerMinute)}/phut` },
                { label: 'Simulation', value: `${Math.round(trip.progress * 100)}%` },
              ].map((row) => (
                <div key={`detail-${row.label}`} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{row.label}</span>
                  <span className="text-xs font-semibold text-foreground tabular-nums">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
