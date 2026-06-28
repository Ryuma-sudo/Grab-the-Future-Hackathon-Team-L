'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, FlashlightIcon, Loader2, RotateCcw, X, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import BatteryIndicator from '../../../components/ui/BatteryIndicator';
import { formatVND } from '../../../lib/api';
import type { ApiVehicle } from '../../../lib/api';

interface QRScanModalProps {
  vehicle: ApiVehicle;
  startStationId: number;
  destinationStationId: number | null;
  onClose: () => void;
}

type ScanState = 'scanning' | 'success';

export default function QRScanModal({
  vehicle,
  startStationId,
  destinationStationId,
  onClose,
}: QRScanModalProps) {
  const [scanState, setScanState] = useState<ScanState>('scanning');
  const [countdown, setCountdown] = useState(2);
  const router = useRouter();

  useEffect(() => {
    if (scanState !== 'scanning') return;
    const timer = setTimeout(() => {
      setScanState('success');
    }, 1800);
    return () => clearTimeout(timer);
  }, [scanState]);

  useEffect(() => {
    if (scanState !== 'success') return;
    if (countdown === 0) {
      const params = new URLSearchParams({
        from: String(startStationId),
        vehicle: String(vehicle.id),
      });
      if (destinationStationId) {
        params.set('to', String(destinationStationId));
      }
      router.push(`/active-trip?${params.toString()}`);
      return;
    }
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [scanState, countdown, router, startStationId, destinationStationId, vehicle.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl shadow-bottom-sheet fade-in-up overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground">Quet ma QR</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Xe may dien - ID #{vehicle.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted active:scale-95 transition-all duration-150"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="px-5 py-3 bg-secondary/40 flex items-center gap-3 border-b border-border">
          <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-primary" fill="currentColor" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">EV Scooter {vehicle.code}</p>
            <p className="text-xs text-muted-foreground">
              {formatVND(7000)} first 5 min, then {formatVND(1000)}/min
            </p>
          </div>
          <BatteryIndicator percent={vehicle.battery_level} size="sm" />
        </div>

        <div className="px-5 py-6">
          {scanState === 'scanning' && (
            <div className="flex flex-col items-center">
              <div className="relative w-56 h-56 mb-5">
                <div className="absolute inset-0 bg-slate-900/80 rounded-2xl" />
                <div className="absolute inset-6 bg-transparent qr-scanner-frame">
                  <div className="absolute top-0 left-0 w-7 h-7 border-t-[3px] border-l-[3px] border-primary rounded-tl" />
                  <div className="absolute top-0 right-0 w-7 h-7 border-t-[3px] border-r-[3px] border-primary rounded-tr" />
                  <div className="absolute bottom-0 left-0 w-7 h-7 border-b-[3px] border-l-[3px] border-primary rounded-bl" />
                  <div className="absolute bottom-0 right-0 w-7 h-7 border-b-[3px] border-r-[3px] border-primary rounded-br" />
                  <div className="scan-line absolute left-0 right-0 h-0.5 bg-primary/80 shadow-lg" />
                  <div className="absolute inset-4 grid grid-cols-7 grid-rows-7 gap-0.5 opacity-30">
                    {Array.from({ length: 49 }).map((_, index) => (
                      <div
                        key={`qr-cell-${index}`}
                        className={`rounded-[1px] ${
                          [0, 1, 2, 3, 4, 5, 6, 7, 13, 14, 20, 21, 27, 28, 34, 35, 41, 42, 43, 44, 45, 46, 47, 48].includes(index)
                            ? 'bg-white'
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                  <div className="flex items-center gap-2 bg-black/60 rounded-full px-3 py-1.5">
                    <Loader2 size={12} className="text-primary animate-spin" />
                    <span className="text-[10px] text-white font-medium">Dang quet...</span>
                  </div>
                </div>
              </div>

              <p className="text-sm font-semibold text-foreground mb-1">
                Huong camera vao QR tren xe
              </p>
              <p className="text-xs text-muted-foreground text-center mb-5 max-w-xs">
                Demo se mo khoa xe va chay simulation trong 5 giay.
              </p>

              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-muted rounded-xl text-xs font-semibold text-muted-foreground active:scale-95 transition-all duration-150">
                  <FlashlightIcon size={14} />
                  Bat den
                </button>
                <button
                  onClick={() => setScanState('scanning')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-muted rounded-xl text-xs font-semibold text-muted-foreground active:scale-95 transition-all duration-150"
                >
                  <RotateCcw size={14} />
                  Nhap ma
                </button>
              </div>
            </div>
          )}

          {scanState === 'success' && (
            <div className="flex flex-col items-center py-4 fade-in-up">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={40} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">Mo khoa thanh cong</h3>
              <p className="text-sm text-muted-foreground text-center mb-5">
                Xe da san sang. Simulation se bat dau ngay sau day.
              </p>

              <div className="w-full bg-secondary/60 rounded-2xl p-4 mb-5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Xe</p>
                    <p className="text-sm font-bold text-foreground">EV Scooter {vehicle.code}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Pin</p>
                    <p className="text-sm font-bold text-primary tabular-nums">{vehicle.battery_level}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Range</p>
                    <p className="text-sm font-bold text-foreground tabular-nums">{vehicle.estimated_range_km} km</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Gia</p>
                    <p className="text-sm font-bold text-foreground tabular-nums">{formatVND(7000)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 size={12} className="animate-spin text-primary" />
                <span>Chuyen sang simulation sau <strong className="text-primary tabular-nums">{countdown}s</strong>...</span>
              </div>
            </div>
          )}
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
