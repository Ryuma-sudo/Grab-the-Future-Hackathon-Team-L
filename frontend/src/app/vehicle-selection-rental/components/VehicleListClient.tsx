'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MOCK_VEHICLES, formatVND } from '../../../lib/mockData';
import type { Vehicle } from '../../../lib/mockData';
import { Zap, Battery, Route, Clock, AlertTriangle } from 'lucide-react';
import BatteryIndicator from '../../../components/ui/BatteryIndicator';
import StatusBadge from '../../../components/ui/StatusBadge';
import QRScanModal from './QRScanModal';

export default function VehicleListClient() {
  const searchParams = useSearchParams();
  const fromId = searchParams.get('from');
  const toId = searchParams.get('to');

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [sortBy, setSortBy] = useState<'battery' | 'price'>('battery');

  // Only show electric scooters from station-001
  const stationVehicles = MOCK_VEHICLES.filter(
    (v) => v.stationId === 'station-001' && v.type === 'scooter'
  );

  const filtered = [...stationVehicles].sort((a, b) =>
    sortBy === 'battery' ? b.batteryPercent - a.batteryPercent : a.pricePerMinute - b.pricePerMinute
  );

  const handleSelectVehicle = (vehicle: Vehicle) => {
    if (vehicle.status !== 'available') return;
    setSelectedVehicle(vehicle);
  };

  const handleStartRental = () => {
    if (!selectedVehicle) return;
    setShowQR(true);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Sort bar */}
      <div className="px-4 py-3 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sắp xếp:</span>
          <button
            onClick={() => setSortBy('battery')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
              sortBy === 'battery' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'
            }`}
          >
            <Battery size={11} />
            Pin cao nhất
          </button>
          <button
            onClick={() => setSortBy('price')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
              sortBy === 'price' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'
            }`}
          >
            <Zap size={11} />
            Giá thấp nhất
          </button>
        </div>
      </div>

      {/* Vehicle list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 pb-32">
        <div className="flex flex-col gap-3">
          {filtered.map((vehicle) => {
            const isSelected = selectedVehicle?.id === vehicle.id;
            const isLowBattery = vehicle.batteryPercent <= 20;
            const isCritical = vehicle.batteryPercent <= 5;
            const isUnavailable = vehicle.status !== 'available';

            return (
              <div
                key={vehicle.id}
                onClick={() => handleSelectVehicle(vehicle)}
                className={`vehicle-card-hover rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                  isUnavailable
                    ? 'opacity-60 cursor-not-allowed border-border bg-muted/30'
                    : isSelected
                    ? 'border-primary bg-secondary/40 shadow-card-lg'
                    : 'border-border bg-card hover:border-primary/40'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-primary/20' : 'bg-muted'
                      }`}
                    >
                      <svg viewBox="0 0 24 24" className={`w-7 h-7 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} fill="none" stroke="currentColor" strokeWidth="1.8">
                        <circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" />
                        <path d="M6 17h2l4-8h2l2 5H6" />
                        <path d="M14 9l1-4h3" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{vehicle.model}</p>
                      <p className="text-xs text-muted-foreground">Xe tay ga điện • Ô {vehicle.slotNumber}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    {isUnavailable ? (
                      <StatusBadge variant="busy" label="Không có" />
                    ) : isCritical ? (
                      <StatusBadge variant="low-battery" label="Pin cạn" />
                    ) : isLowBattery ? (
                      <StatusBadge variant="low-battery" label="Pin yếu" />
                    ) : (
                      <StatusBadge variant="available" />
                    )}
                  </div>
                </div>

                {/* Battery and range */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Pin</span>
                      <BatteryIndicator percent={vehicle.batteryPercent} size="sm" />
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full battery-bar ${
                          vehicle.batteryPercent <= 5
                            ? 'bg-danger'
                            : vehicle.batteryPercent <= 20
                            ? 'bg-warning' :'bg-primary'
                        }`}
                        style={{ width: `${vehicle.batteryPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center bg-muted rounded-xl p-2">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Route size={10} className="text-muted-foreground" />
                      <span className="text-xs font-bold text-foreground tabular-nums">{vehicle.estimatedRangeKm} km</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground">Còn đi được</span>
                  </div>
                  <div className="flex flex-col items-center bg-muted rounded-xl p-2">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Clock size={10} className="text-muted-foreground" />
                      <span className="text-xs font-bold text-foreground tabular-nums">{formatVND(vehicle.pricePerMinute)}</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground">mỗi phút</span>
                  </div>
                  <div className="flex flex-col items-center bg-muted rounded-xl p-2">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Zap size={10} className="text-muted-foreground" />
                      <span className="text-xs font-bold text-foreground tabular-nums">{vehicle.lastCharged}</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground">Sạc lần cuối</span>
                  </div>
                </div>

                {/* Critical battery warning */}
                {isCritical && !isUnavailable && (
                  <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                    <AlertTriangle size={13} className="text-danger flex-shrink-0" />
                    <p className="text-[10px] text-danger font-medium">
                      Pin gần cạn — chỉ đủ đi ~{vehicle.estimatedRangeKm} km. Không khuyến nghị chọn xe này.
                    </p>
                  </div>
                )}

                {/* Selected indicator */}
                {isSelected && (
                  <div className="mt-3 flex items-center justify-center gap-2 py-2 bg-primary/10 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-primary pulse-dot" />
                    <span className="text-xs font-bold text-primary">Đã chọn xe này</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      {selectedVehicle && (
        <div className="fixed bottom-16 left-0 right-0 px-4 pb-3 z-30 max-w-lg mx-auto fade-in-up">
          <div className="bg-card rounded-2xl shadow-bottom-sheet border border-border p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Xe đã chọn</p>
                <p className="text-sm font-bold text-foreground truncate">{selectedVehicle.model}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Giá</p>
                <p className="text-sm font-bold text-primary tabular-nums">
                  {formatVND(selectedVehicle.pricePerMinute)}/phút
                </p>
              </div>
              <BatteryIndicator percent={selectedVehicle.batteryPercent} size="sm" />
            </div>
            <button
              onClick={handleStartRental}
              className="w-full py-3.5 bg-primary text-white rounded-2xl text-sm font-bold active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 shadow-pin"
            >
              <Zap size={16} fill="white" />
              Quét mã QR để thuê xe
            </button>
          </div>
        </div>
      )}

      {showQR && selectedVehicle && (
        <QRScanModal
          vehicle={selectedVehicle}
          fromId={fromId}
          toId={toId}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}