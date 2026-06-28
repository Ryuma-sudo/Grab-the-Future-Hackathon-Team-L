'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, Battery, Bell, Loader2, Route, Zap } from 'lucide-react';
import BatteryIndicator from '../../../components/ui/BatteryIndicator';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatVND, getStationVehicles } from '../../../lib/api';
import type { ApiVehicle } from '../../../lib/api';
import QRScanModal from './QRScanModal';
import BellRingModal from './BellRingModal';

const TRIP_BASE_FEE = 7000;

function getStatusLabel(status: ApiVehicle['status']) {
  if (status === 'ready') return 'Sẵn sàng';
  if (status === 'rented') return 'Đang dùng';
  if (status === 'charging') return 'Đang sạc';
  return 'Bảo trì';
}

export default function VehicleListClient() {
  const searchParams = useSearchParams();
  const stationId = Number(searchParams.get('from'));
  const destinationStationId = searchParams.get('to') ? Number(searchParams.get('to')) : null;
  const distParam = searchParams.get('dist');
  const distanceKm = distParam ? parseFloat(distParam) : null;

  const [vehicles, setVehicles] = useState<ApiVehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<ApiVehicle | null>(null);
  const [ringingVehicle, setRingingVehicle] = useState<ApiVehicle | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [sortBy, setSortBy] = useState<'battery' | 'range'>('battery');
  const [loading, setLoading] = useState(Boolean(stationId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stationId) {
      setVehicles([]);
      setLoading(false);
      setError('Vui lòng chọn trạm xuất phát trên bản đồ');
      return;
    }

    let isActive = true;
    setLoading(true);
    setError(null);
    setSelectedVehicle(null);

    getStationVehicles(stationId)
      .then((data) => { if (isActive) setVehicles(data); })
      .catch((err) => { if (isActive) setError(err instanceof Error ? err.message : 'Không thể tải danh sách xe'); })
      .finally(() => { if (isActive) setLoading(false); });

    return () => { isActive = false; };
  }, [stationId]);

  const filtered = useMemo(
    () =>
      [...vehicles].sort((a, b) =>
        sortBy === 'battery'
          ? b.battery_level - a.battery_level
          : b.estimated_range_km - a.estimated_range_km,
      ),
    [vehicles, sortBy],
  );

  const handleSelectVehicle = (vehicle: ApiVehicle, cantReach: boolean) => {
    if (vehicle.status !== 'ready' || cantReach) return;
    setSelectedVehicle(vehicle);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 size={18} className="animate-spin text-primary" />
          <span className="text-sm font-semibold">Đang tải danh sách xe...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 text-center">
        <div className="rounded-2xl border border-danger/30 bg-card p-5 shadow-card">
          <AlertTriangle size={24} className="text-danger mx-auto mb-2" />
          <p className="text-sm font-bold text-foreground">Không thể tải xe</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

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
            onClick={() => setSortBy('range')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
              sortBy === 'range' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'
            }`}
          >
            <Zap size={11} />
            Quãng đường xa nhất
          </button>
        </div>

        {distanceKm !== null && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Route size={10} className="text-primary" />
            Tới đích: <span className="font-bold text-foreground">{distanceKm} km</span>
            {' '}— xe mờ không đủ pin để đến nơi
          </div>
        )}
      </div>

      {/* Vehicle list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 pb-32">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <p className="text-sm font-bold text-foreground">Trạm này không có xe</p>
            <p className="text-xs text-muted-foreground mt-1">Vui lòng chọn trạm khác trên bản đồ.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((vehicle) => {
              const isSelected = selectedVehicle?.id === vehicle.id;
              const isLowBattery = vehicle.battery_level <= 20;
              const isCritical = vehicle.battery_level <= 5;
              const isUnavailable = vehicle.status !== 'ready';
              const cantReach = distanceKm !== null && vehicle.estimated_range_km < distanceKm;
              const isDisabled = isUnavailable || cantReach;

              return (
                <div
                  key={vehicle.id}
                  onClick={() => handleSelectVehicle(vehicle, cantReach)}
                  className={`vehicle-card-hover rounded-2xl border-2 p-4 transition-all duration-200 ${
                    isDisabled
                      ? 'opacity-50 cursor-not-allowed border-border bg-muted/30'
                      : isSelected
                      ? 'border-primary bg-secondary/40 shadow-card-lg cursor-pointer'
                      : 'border-border bg-card hover:border-primary/40 cursor-pointer'
                  }`}
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDisabled ? 'bg-muted' : isSelected ? 'bg-primary/20' : 'bg-muted'}`}>
                        <svg viewBox="0 0 24 24" className={`w-7 h-7 ${isSelected && !isDisabled ? 'text-primary' : 'text-muted-foreground'}`} fill="none" stroke="currentColor" strokeWidth="1.8">
                          <circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" />
                          <path d="M6 17h2l4-8h2l2 5H6" /><path d="M14 9l1-4h3" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{vehicle.code}</p>
                        <p className="text-xs text-muted-foreground">Xe tay ga điện • ID #{vehicle.id}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {isUnavailable ? (
                        <StatusBadge variant="busy" label={getStatusLabel(vehicle.status)} />
                      ) : cantReach ? (
                        <StatusBadge variant="low-battery" label="Pin không đủ" />
                      ) : isCritical ? (
                        <StatusBadge variant="low-battery" label="Pin cạn" />
                      ) : isLowBattery ? (
                        <StatusBadge variant="low-battery" label="Pin yếu" />
                      ) : (
                        <StatusBadge variant="available" />
                      )}

                      {/* Bell / locate button */}
                      {!isUnavailable && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setRingingVehicle(vehicle); }}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-medium active:scale-90 hover:bg-amber-100 transition-all duration-150"
                        >
                          <Bell size={11} />
                          Tìm xe
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Battery bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Pin</span>
                      <BatteryIndicator percent={vehicle.battery_level} size="sm" />
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full battery-bar ${
                          vehicle.battery_level <= 5 ? 'bg-danger' : vehicle.battery_level <= 20 ? 'bg-warning' : 'bg-primary'
                        }`}
                        style={{ width: `${vehicle.battery_level}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className={`flex flex-col items-center rounded-xl p-2 ${cantReach ? 'bg-red-50' : 'bg-muted'}`}>
                      <div className="flex items-center gap-1 mb-0.5">
                        <Route size={10} className={cantReach ? 'text-danger' : 'text-muted-foreground'} />
                        <span className={`text-xs font-bold tabular-nums ${cantReach ? 'text-danger' : 'text-foreground'}`}>
                          {vehicle.estimated_range_km} km
                        </span>
                      </div>
                      <span className="text-[9px] text-muted-foreground">Còn đi được</span>
                    </div>
                    <div className="flex flex-col items-center bg-primary/8 rounded-xl p-2">
                      <span className="text-xs font-bold text-primary tabular-nums">{formatVND(TRIP_BASE_FEE)}</span>
                      <span className="text-[9px] text-muted-foreground">5 phút đầu</span>
                    </div>
                    <div className="flex flex-col items-center bg-muted rounded-xl p-2">
                      <span className="text-xs font-bold text-foreground tabular-nums">{formatVND(1000)}</span>
                      <span className="text-[9px] text-muted-foreground">/phút sau</span>
                    </div>
                  </div>

                  {/* Insufficient range warning */}
                  {cantReach && (
                    <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                      <AlertTriangle size={13} className="text-danger flex-shrink-0" />
                      <p className="text-[10px] text-danger font-medium">
                        Pin không đủ đến đích — cần {distanceKm} km, xe chỉ đi được {vehicle.estimated_range_km} km.
                      </p>
                    </div>
                  )}

                  {/* Selected indicator */}
                  {isSelected && !isDisabled && (
                    <div className="mt-3 flex items-center justify-center gap-2 py-2 bg-primary/10 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-primary pulse-dot" />
                      <span className="text-xs font-bold text-primary">Đã chọn xe này</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      {selectedVehicle && (
        <div className="fixed bottom-16 left-0 right-0 px-4 pb-3 z-30 max-w-lg mx-auto fade-in-up">
          <div className="bg-card rounded-2xl shadow-bottom-sheet border border-border p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Xe đã chọn</p>
                <p className="text-sm font-bold text-foreground truncate">{selectedVehicle.code}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Giá khởi điểm</p>
                <p className="text-sm font-bold text-primary tabular-nums">{formatVND(TRIP_BASE_FEE)} / 5 phút</p>
              </div>
              <BatteryIndicator percent={selectedVehicle.battery_level} size="sm" />
            </div>
            <button
              onClick={() => setShowQR(true)}
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
          startStationId={stationId}
          destinationStationId={destinationStationId}
          onClose={() => setShowQR(false)}
        />
      )}

      {ringingVehicle && (
        <BellRingModal
          vehicle={ringingVehicle as any}
          onClose={() => setRingingVehicle(null)}
        />
      )}
    </div>
  );
}
