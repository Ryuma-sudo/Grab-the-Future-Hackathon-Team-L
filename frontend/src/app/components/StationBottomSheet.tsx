'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Bike, ChevronDown, ChevronUp, Clock, Loader2, MapPin, Zap } from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '../../components/ui/StatusBadge';
import {
  calculateDistanceMeters,
  formatDistance,
  getStations,
} from '../../lib/api';
import type { ApiStation } from '../../lib/api';

const USER_POSITION = {
  latitude: 10.8702,
  longitude: 106.8032,
};

function getStationDistance(station: ApiStation) {
  return calculateDistanceMeters(USER_POSITION, {
    latitude: station.latitude,
    longitude: station.longitude,
  });
}

export default function StationBottomSheet() {
  const [expanded, setExpanded] = useState(false);
  const [stations, setStations] = useState<ApiStation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    getStations()
      .then((data) => {
        if (isActive) {
          setStations(data.filter((station) => station.is_active));
        }
      })
      .catch(() => {
        if (isActive) {
          setStations([]);
        }
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const nearbyStations = useMemo(
    () =>
      [...stations].sort(
        (first, second) => getStationDistance(first) - getStationDistance(second),
      ),
    [stations],
  );

  return (
    <div
      className={`absolute left-0 right-0 bottom-0 z-40 bg-card rounded-t-3xl shadow-bottom-sheet bottom-sheet ${
        expanded ? 'max-h-[70vh]' : 'max-h-[220px]'
      } overflow-hidden flex flex-col`}
    >
      <button
        className="flex flex-col items-center pt-3 pb-2 active:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-10 h-1 bg-muted-foreground/20 rounded-full mb-2" />
        <div className="flex items-center justify-between w-full px-4">
          <div>
            <p className="text-sm font-bold text-foreground">Tram gan ban</p>
            <p className="text-xs text-muted-foreground">
              {loading ? 'Dang cap nhat' : `${nearbyStations.length} tram`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-primary bg-secondary px-2.5 py-1 rounded-full">
              {nearbyStations.filter((station) => (station.available_vehicle_count ?? 0) > 0).length} co xe
            </span>
            {expanded ? (
              <ChevronDown size={18} className="text-muted-foreground" />
            ) : (
              <ChevronUp size={18} className="text-muted-foreground" />
            )}
          </div>
        </div>
      </button>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-xs">Loading stations...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {nearbyStations.map((station) => {
              const availableVehicles = station.available_vehicle_count ?? 0;
              const totalVehicles = station.total_vehicle_count ?? 0;
              const distance = getStationDistance(station);

              return (
                <Link
                  key={station.id}
                  href={`/vehicle-selection-rental?from=${station.id}`}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-border hover:border-primary/30 hover:bg-secondary/30 active:scale-[0.98] transition-all duration-150 cursor-pointer"
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      availableVehicles > 0 ? 'bg-secondary' : 'bg-muted'
                    }`}
                  >
                    <Zap
                      size={20}
                      className={availableVehicles > 0 ? 'text-primary' : 'text-muted-foreground'}
                      fill={availableVehicles > 0 ? 'currentColor' : 'none'}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-bold text-foreground truncate">{station.name}</p>
                      <StatusBadge
                        variant={availableVehicles === 0 ? 'busy' : 'available'}
                        label={availableVehicles === 0 ? 'Het xe' : `${availableVehicles} xe`}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-1.5">{station.address}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin size={10} />
                        <span>{formatDistance(distance)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock size={10} />
                        <span>{Math.max(1, Math.ceil(distance / 80))} phut</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Bike size={10} />
                        <span>{totalVehicles} xe</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
