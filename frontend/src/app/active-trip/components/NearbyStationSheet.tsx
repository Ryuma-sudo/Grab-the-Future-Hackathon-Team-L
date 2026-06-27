'use client';

import React from 'react';
import { X, MapPin, Clock, Zap, Navigation, AlertTriangle } from 'lucide-react';
import { MOCK_STATIONS, formatDistance } from '../../../lib/mockData';

interface NearbyStationSheetProps {
  onClose: () => void;
}

export default function NearbyStationSheet({ onClose }: NearbyStationSheetProps) {
  // Sort by distance, show closest ones for return
  const returnStations = [...MOCK_STATIONS]
    .filter((s) => s.status !== 'closed' && s.availableVehicles < s.totalVehicles)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl shadow-bottom-sheet fade-in-up">
        {/* Handle */}
        <div className="flex flex-col items-center pt-3 pb-2">
          <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pb-3 border-b border-border flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle size={14} className="text-danger" />
              </div>
              <h2 className="text-base font-bold text-foreground">Trạm trả xe gần nhất</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Pin sắp hết — hãy trả xe tại một trong các trạm dưới đây
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted active:scale-95 transition-all duration-150"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Station list */}
        <div className="px-4 py-3 flex flex-col gap-3 max-h-[50vh] overflow-y-auto pb-8">
          {returnStations.map((station, idx) => (
            <div
              key={station.id}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-150 ${
                idx === 0
                  ? 'border-danger/30 bg-red-50' :'border-border bg-card hover:border-primary/30 hover:bg-secondary/20'
              }`}
            >
              {/* Rank badge */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                  idx === 0 ? 'bg-danger text-white' : 'bg-muted text-muted-foreground'
                }`}
              >
                {idx + 1}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-sm font-bold text-foreground truncate">{station.name}</p>
                  {idx === 0 && (
                    <span className="text-[10px] font-bold text-danger bg-red-100 px-2 py-0.5 rounded-full flex-shrink-0 ml-1">
                      Gần nhất
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground truncate mb-1.5">{station.address}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <MapPin size={9} />
                    <span className="tabular-nums">{formatDistance(station.distance)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock size={9} />
                    <span className="tabular-nums">{station.walkMinutes} phút</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-primary font-medium">
                    <Zap size={9} fill="currentColor" />
                    <span className="tabular-nums">{station.totalVehicles - station.availableVehicles} chỗ trống</span>
                  </div>
                </div>
              </div>

              {/* Navigate button */}
              <button className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-all duration-150 shadow-pin">
                <Navigation size={14} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}