'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronDown, Shield } from 'lucide-react';
import BatteryIndicator from '../../../components/ui/BatteryIndicator';
import StatusBadge from '../../../components/ui/StatusBadge';

interface TripTopBarProps {
  tripId: string;
  vehicleModel: string;
  batteryPercent: number;
}

export default function TripTopBar({ tripId, vehicleModel, batteryPercent }: TripTopBarProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-30 px-4 pt-12 pb-3 pointer-events-none">
      <div className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-card-lg px-4 py-3 pointer-events-auto border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center">
              <Shield size={16} className="text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground">{vehicleModel}</p>
                <StatusBadge variant="active" label="Đang thuê" />
              </div>
              <p className="text-[10px] text-muted-foreground">Mã chuyến #{tripId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BatteryIndicator percent={batteryPercent} size="md" />
            <Link
              href="/"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}