'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, Battery, Loader2, Route, Zap } from 'lucide-react';
import BatteryIndicator from '../../../components/ui/BatteryIndicator';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatVND, getStationVehicles } from '../../../lib/api';
import type { ApiVehicle } from '../../../lib/api';
import QRScanModal from './QRScanModal';

function getVehicleLabel(vehicle: ApiVehicle) {
  return `EV Scooter ${vehicle.code}`;
}

function getStatusLabel(status: ApiVehicle['status']) {
  if (status === 'ready') return 'Available';
  if (status === 'rented') return 'Dang thue';
  if (status === 'charging') return 'Dang sac';
  return 'Bao tri';
}

export default function VehicleListClient() {
  const searchParams = useSearchParams();
  const stationId = Number(searchParams.get('from'));
  const destinationStationId = searchParams.get('to') ? Number(searchParams.get('to')) : null;
  const [vehicles, setVehicles] = useState<ApiVehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<ApiVehicle | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [sortBy, setSortBy] = useState<'battery' | 'range'>('battery');
  const [loading, setLoading] = useState(Boolean(stationId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stationId) {
      setVehicles([]);
      setLoading(false);
      setError('Please choose a start station first');
      return;
    }

    let isActive = true;
    setLoading(true);
    setError(null);
    setSelectedVehicle(null);

    getStationVehicles(stationId)
      .then((data) => {
        if (isActive) setVehicles(data);
      })
      .catch((err) => {
        if (isActive) {
          setError(err instanceof Error ? err.message : 'Cannot load vehicles');
        }
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [stationId]);

  const filtered = useMemo(
    () =>
      [...vehicles].sort((first, second) =>
        sortBy === 'battery'
          ? second.battery_level - first.battery_level
          : second.estimated_range_km - first.estimated_range_km,
      ),
    [vehicles, sortBy],
  );

  const handleSelectVehicle = (vehicle: ApiVehicle) => {
    if (vehicle.status !== 'ready') return;
    setSelectedVehicle(vehicle);
  };

  const handleStartRental = () => {
    if (!selectedVehicle) return;
    setShowQR(true);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 size={18} className="animate-spin text-primary" />
          <span className="text-sm font-semibold">Loading vehicles...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 text-center">
        <div className="rounded-2xl border border-danger/30 bg-card p-5 shadow-card">
          <AlertTriangle size={24} className="text-danger mx-auto mb-2" />
          <p className="text-sm font-bold text-foreground">Cannot load vehicles</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-4 py-3 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sap xep:</span>
          <button
            onClick={() => setSortBy('battery')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
              sortBy === 'battery' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'
            }`}
          >
            <Battery size={11} />
            Pin cao nhat
          </button>
          <button
            onClick={() => setSortBy('range')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
              sortBy === 'range' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'
            }`}
          >
            <Route size={11} />
            Range cao nhat
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 pb-32">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <p className="text-sm font-bold text-foreground">No vehicles at this station</p>
            <p className="text-xs text-muted-foreground mt-1">Choose another station on the map.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((vehicle) => {
              const isSelected = selectedVehicle?.id === vehicle.id;
              const isLowBattery = vehicle.battery_level <= 20;
              const isCritical = vehicle.battery_level <= 5;
              const isUnavailable = vehicle.status !== 'ready';

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
                        <p className="text-sm font-bold text-foreground">{getVehicleLabel(vehicle)}</p>
                        <p className="text-xs text-muted-foreground">Xe may dien - ID #{vehicle.id}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {isUnavailable ? (
                        <StatusBadge variant="busy" label={getStatusLabel(vehicle.status)} />
                      ) : isCritical ? (
                        <StatusBadge variant="low-battery" label="Pin can" />
                      ) : isLowBattery ? (
                        <StatusBadge variant="low-battery" label="Pin yeu" />
                      ) : (
                        <StatusBadge variant="available" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Pin</span>
                        <BatteryIndicator percent={vehicle.battery_level} size="sm" />
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full battery-bar ${
                            vehicle.battery_level <= 5
                              ? 'bg-danger'
                              : vehicle.battery_level <= 20
                                ? 'bg-warning'
                                : 'bg-primary'
                          }`}
                          style={{ width: `${vehicle.battery_level}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center bg-muted rounded-xl p-2">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Route size={10} className="text-muted-foreground" />
                        <span className="text-xs font-bold text-foreground tabular-nums">{vehicle.estimated_range_km} km</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground">Range toi da</span>
                    </div>
                    <div className="flex flex-col items-center bg-muted rounded-xl p-2">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Zap size={10} className="text-muted-foreground" />
                        <span className="text-xs font-bold text-foreground tabular-nums">{formatVND(7000)}</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground">5 phut dau</span>
                    </div>
                    <div className="flex flex-col items-center bg-muted rounded-xl p-2">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Zap size={10} className="text-muted-foreground" />
                        <span className="text-xs font-bold text-foreground tabular-nums">{formatVND(1000)}</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground">phut tiep</span>
                    </div>
                  </div>

                  {isCritical && !isUnavailable && (
                    <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                      <AlertTriangle size={13} className="text-danger flex-shrink-0" />
                      <p className="text-[10px] text-danger font-medium">
                        Pin gan can, khong khuyen nghi chon xe nay.
                      </p>
                    </div>
                  )}

                  {isSelected && (
                    <div className="mt-3 flex items-center justify-center gap-2 py-2 bg-primary/10 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-primary pulse-dot" />
                      <span className="text-xs font-bold text-primary">Da chon xe nay</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedVehicle && (
        <div className="fixed bottom-16 left-0 right-0 px-4 pb-3 z-30 max-w-lg mx-auto fade-in-up">
          <div className="bg-card rounded-2xl shadow-bottom-sheet border border-border p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Xe da chon</p>
                <p className="text-sm font-bold text-foreground truncate">{getVehicleLabel(selectedVehicle)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Gia</p>
                <p className="text-sm font-bold text-primary tabular-nums">
                  {formatVND(7000)} / 5 phut
                </p>
              </div>
              <BatteryIndicator percent={selectedVehicle.battery_level} size="sm" />
            </div>
            <button
              onClick={handleStartRental}
              className="w-full py-3.5 bg-primary text-white rounded-2xl text-sm font-bold active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 shadow-pin"
            >
              <Zap size={16} fill="white" />
              Quet QR de bat dau simulate
            </button>
          </div>
        </div>
      )}

      {showQR && selectedVehicle && stationId && (
        <QRScanModal
          vehicle={selectedVehicle}
          startStationId={stationId}
          destinationStationId={destinationStationId}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}
