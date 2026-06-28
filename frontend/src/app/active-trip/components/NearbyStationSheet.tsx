'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Clock, Loader2, MapPin, Navigation, X, Zap } from 'lucide-react';
import {
  calculateDistanceMeters,
  formatDistance,
  getStations,
} from '../../../lib/api';
import type { ApiStation } from '../../../lib/api';

const SIMULATED_POSITION = {
  latitude: 10.82,
  longitude: 106.76,
};

interface NearbyStationSheetProps {
  onClose: () => void;
}

function getDistance(station: ApiStation) {
  return calculateDistanceMeters(SIMULATED_POSITION, {
    latitude: station.latitude,
    longitude: station.longitude,
  });
}

export default function NearbyStationSheet({ onClose }: NearbyStationSheetProps) {
  const [stations, setStations] = useState<ApiStation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    getStations()
      .then((data) => {
        if (isActive) setStations(data.filter((station) => station.is_active));
      })
      .catch(() => {
        if (isActive) setStations([]);
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const returnStations = useMemo(
    () =>
      [...stations]
        .filter((station) => (station.total_vehicle_count ?? 0) < station.capacity)
        .sort((first, second) => getDistance(first) - getDistance(second))
        .slice(0, 4),
    [stations],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl shadow-bottom-sheet fade-in-up">
        <div className="flex flex-col items-center pt-3 pb-2">
          <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
        </div>

        <div className="px-5 pb-3 border-b border-border flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle size={14} className="text-danger" />
              </div>
              <h2 className="text-base font-bold text-foreground">Nearby return stations</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Battery is low, choose a nearby station to return.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted active:scale-95 transition-all duration-150"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className="px-4 py-3 flex flex-col gap-3 max-h-[50vh] overflow-y-auto pb-8">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs">Loading stations...</span>
            </div>
          ) : (
            returnStations.map((station, index) => {
              const distance = getDistance(station);
              const freeSlots = Math.max(0, station.capacity - (station.total_vehicle_count ?? 0));

              return (
                <div
                  key={station.id}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-150 ${
                    index === 0
                      ? 'border-danger/30 bg-red-50'
                      : 'border-border bg-card hover:border-primary/30 hover:bg-secondary/20'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                      index === 0 ? 'bg-danger text-white' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-bold text-foreground truncate">{station.name}</p>
                      {index === 0 && (
                        <span className="text-[10px] font-bold text-danger bg-red-100 px-2 py-0.5 rounded-full flex-shrink-0 ml-1">
                          Nearest
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate mb-1.5">{station.address}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <MapPin size={9} />
                        <span className="tabular-nums">{formatDistance(distance)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock size={9} />
                        <span className="tabular-nums">{Math.max(1, Math.ceil(distance / 80))} min</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-primary font-medium">
                        <Zap size={9} fill="currentColor" />
                        <span className="tabular-nums">{freeSlots} slots</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-all duration-150 shadow-pin">
                    <Navigation size={14} className="text-white" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
