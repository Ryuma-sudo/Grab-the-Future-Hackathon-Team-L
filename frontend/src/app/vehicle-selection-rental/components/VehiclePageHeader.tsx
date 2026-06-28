import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface VehiclePageHeaderProps {
  stationName: string;
  stationAddress: string;
  availableCount: number;
  totalCount: number;
  distanceMeters: number;
  walkMinutes: number;
}

export default function VehiclePageHeader({
  stationName,
  stationAddress,
  availableCount,
  totalCount,
  distanceMeters,
  walkMinutes,
}: VehiclePageHeaderProps) {
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
          <h1 className="text-base font-bold text-foreground">Chọn xe</h1>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{stationName}</p>
          <p className="text-[10px] text-muted-foreground truncate">{stationAddress}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div className="bg-secondary rounded-xl p-2.5 text-center">
          <p className="text-lg font-bold text-primary tabular-nums">{availableCount}</p>
          <p className="text-[10px] text-secondary-foreground font-medium">Xe có sẵn</p>
        </div>
        <div className="bg-muted rounded-xl p-2.5 text-center">
          <p className="text-lg font-bold text-foreground tabular-nums">{totalCount}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Tổng xe</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-2.5 text-center">
          <p className="text-lg font-bold text-amber-600 tabular-nums">
            {distanceMeters >= 1000
              ? `${(distanceMeters / 1000).toFixed(1)}km`
              : `${distanceMeters}m`}
          </p>
          <p className="text-[10px] text-amber-600/70 font-medium">Cách bạn</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-2.5 text-center">
          <p className="text-lg font-bold text-blue-600 tabular-nums">{walkMinutes}</p>
          <p className="text-[10px] text-blue-600/70 font-medium">Phút đi bộ</p>
        </div>
      </div>
    </div>
  );
}
