'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, MapPin, Zap, Clock, Bike } from 'lucide-react';
import { MOCK_STATIONS, formatDistance } from '../../lib/mockData';
import StatusBadge from '../../components/ui/StatusBadge';
import Link from 'next/link';

export default function StationBottomSheet() {
  const [expanded, setExpanded] = useState(false);

  const nearbyStations = [...MOCK_STATIONS]?.sort((a, b) => a?.distance - b?.distance);

  return (
    <div
      className={`absolute left-0 right-0 bottom-0 z-40 bg-card rounded-t-3xl shadow-bottom-sheet bottom-sheet ${
        expanded ? 'max-h-[70vh]' : 'max-h-[220px]'
      } overflow-hidden flex flex-col`}
    >
      {/* Handle */}
      <button
        className="flex flex-col items-center pt-3 pb-2 active:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-10 h-1 bg-muted-foreground/20 rounded-full mb-2" />
        <div className="flex items-center justify-between w-full px-4">
          <div>
            <p className="text-sm font-bold text-foreground">Trạm gần bạn</p>
            <p className="text-xs text-muted-foreground">{nearbyStations?.length} trạm • Cập nhật vừa xong</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-primary bg-secondary px-2.5 py-1 rounded-full">
              {nearbyStations?.filter(s => s?.availableVehicles > 0)?.length} có xe
            </span>
            {expanded ? (
              <ChevronDown size={18} className="text-muted-foreground" />
            ) : (
              <ChevronUp size={18} className="text-muted-foreground" />
            )}
          </div>
        </div>
      </button>
      {/* Station list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-3">
          {nearbyStations?.map((station) => (
            <Link
              key={station?.id}
              href="/vehicle-selection-rental"
              className="flex items-center gap-3 p-3 rounded-2xl border border-border hover:border-primary/30 hover:bg-secondary/30 active:scale-[0.98] transition-all duration-150 cursor-pointer"
            >
              {/* Icon */}
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  station?.availableVehicles > 0 ? 'bg-secondary' : 'bg-muted'
                }`}
              >
                <Zap
                  size={20}
                  className={station?.availableVehicles > 0 ? 'text-primary' : 'text-muted-foreground'}
                  fill={station?.availableVehicles > 0 ? 'currentColor' : 'none'}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-sm font-bold text-foreground truncate">{station?.name}</p>
                  <StatusBadge
                    variant={
                      station?.status === 'closed' ?'maintenance'
                        : station?.availableVehicles === 0
                        ? 'busy' :'available'
                    }
                    label={
                      station?.status === 'closed' ?'Đóng cửa'
                        : station?.availableVehicles === 0
                        ? 'Hết xe'
                        : `${station?.availableVehicles} xe`
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground truncate mb-1.5">{station?.address}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin size={10} />
                    <span>{formatDistance(station?.distance)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock size={10} />
                    <span>{station?.walkMinutes} phút đi bộ</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Bike size={10} />
                    <span>{station?.totalVehicles} xe</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}