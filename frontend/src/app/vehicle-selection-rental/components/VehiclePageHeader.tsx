'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Info, Loader2, MapPin } from 'lucide-react';
import { getStation } from '../../../lib/api';
import type { ApiStation } from '../../../lib/api';

export default function VehiclePageHeader() {
  const searchParams = useSearchParams();
  const stationId = Number(searchParams.get('from'));
  const [station, setStation] = useState<ApiStation | null>(null);
  const [loading, setLoading] = useState(Boolean(stationId));

  useEffect(() => {
    if (!stationId) {
      setLoading(false);
      return;
    }

    let isActive = true;
    setLoading(true);

    getStation(stationId)
      .then((data) => {
        if (isActive) setStation(data);
      })
      .catch(() => {
        if (isActive) setStation(null);
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [stationId]);

  return (
    <div className="bg-card border-b border-border px-4 pt-12 pb-4 sticky top-0 z-20">
      <div className="flex items-center gap-3 mb-3">
        <Link
          href="/"
          className="p-2 rounded-xl hover:bg-muted active:scale-95 transition-all duration-150"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-foreground">Chon xe</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin size={11} className="text-primary flex-shrink-0" />
            <p className="text-xs text-muted-foreground truncate">
              {loading ? 'Dang tai tram...' : station ? `${station.name} - ${station.address}` : 'Chua chon tram'}
            </p>
          </div>
        </div>
        <button className="p-2 rounded-xl hover:bg-muted active:scale-95 transition-all duration-150">
          {loading ? (
            <Loader2 size={18} className="text-muted-foreground animate-spin" />
          ) : (
            <Info size={18} className="text-muted-foreground" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-secondary rounded-xl p-2.5 text-center">
          <p className="text-lg font-bold text-primary tabular-nums">
            {station?.available_vehicle_count ?? 0}
          </p>
          <p className="text-[10px] text-secondary-foreground font-medium">Xe ready</p>
        </div>
        <div className="bg-muted rounded-xl p-2.5 text-center">
          <p className="text-lg font-bold text-foreground tabular-nums">
            {station?.total_vehicle_count ?? 0}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium">Tong xe</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-2.5 text-center">
          <p className="text-lg font-bold text-amber-600 tabular-nums">
            {station?.average_battery_level ?? '--'}%
          </p>
          <p className="text-[10px] text-amber-600/70 font-medium">Pin TB</p>
        </div>
      </div>
    </div>
  );
}
