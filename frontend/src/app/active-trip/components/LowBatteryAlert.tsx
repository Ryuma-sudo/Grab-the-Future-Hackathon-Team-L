'use client';

import React from 'react';
import { AlertTriangle, MapPin, X } from 'lucide-react';
import { useState } from 'react';

interface LowBatteryAlertProps {
  batteryPercent: number;
  rangeKm: number;
  onViewStations: () => void;
}

export default function LowBatteryAlert({ batteryPercent, rangeKm, onViewStations }: LowBatteryAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="absolute top-0 left-0 right-0 z-50 low-battery-alert">
      <div className="bg-danger text-white px-4 pt-14 pb-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold mb-0.5">
              Pin còn {batteryPercent.toFixed(1)}% — Gần hết!
            </p>
            <p className="text-[11px] text-white/80 mb-2">
              Xe chỉ còn đi được khoảng <strong className="text-white tabular-nums">{rangeKm.toFixed(1)} km</strong>. Hãy trả xe tại trạm gần nhất ngay.
            </p>
            <button
              onClick={onViewStations}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 active:scale-95 transition-all duration-150 rounded-xl px-3 py-1.5 text-xs font-bold"
            >
              <MapPin size={11} />
              Xem trạm gần nhất
            </button>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-xl hover:bg-white/20 active:scale-95 transition-all duration-150 flex-shrink-0"
          >
            <X size={14} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}