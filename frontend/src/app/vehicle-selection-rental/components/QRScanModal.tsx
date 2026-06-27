'use client';

import React, { useState, useEffect } from 'react';
import { X, Zap, CheckCircle, Loader2, FlashlightIcon, RotateCcw } from 'lucide-react';
import type { Vehicle } from '../../../lib/mockData';
import { getVehicleTypeLabel, formatVND } from '../../../lib/mockData';
import BatteryIndicator from '../../../components/ui/BatteryIndicator';
import { useRouter } from 'next/navigation';

interface QRScanModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

type ScanState = 'scanning' | 'success' | 'error';

export default function QRScanModal({ vehicle, onClose }: QRScanModalProps) {
  const [scanState, setScanState] = useState<ScanState>('scanning');
  const [countdown, setCountdown] = useState(3);
  const router = useRouter();

  // Simulate QR scan after 2.5 seconds
  useEffect(() => {
    if (scanState !== 'scanning') return;
    const timer = setTimeout(() => {
      setScanState('success');
    }, 2500);
    return () => clearTimeout(timer);
  }, [scanState]);

  // Countdown after success
  useEffect(() => {
    if (scanState !== 'success') return;
    if (countdown === 0) {
      router.push('/active-trip');
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [scanState, countdown, router]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl shadow-bottom-sheet fade-in-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground">Quét mã QR</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {getVehicleTypeLabel(vehicle.type)} • Ô {vehicle.slotNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted active:scale-95 transition-all duration-150"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Vehicle summary */}
        <div className="px-5 py-3 bg-secondary/40 flex items-center gap-3 border-b border-border">
          <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-primary" fill="currentColor" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">{vehicle.model}</p>
            <p className="text-xs text-muted-foreground">{formatVND(vehicle.pricePerMinute)}/phút</p>
          </div>
          <BatteryIndicator percent={vehicle.batteryPercent} size="sm" />
        </div>

        {/* QR Scanner area */}
        <div className="px-5 py-6">
          {scanState === 'scanning' && (
            <div className="flex flex-col items-center">
              {/* Camera viewfinder */}
              <div className="relative w-56 h-56 mb-5">
                {/* Dark overlay with hole */}
                <div className="absolute inset-0 bg-slate-900/80 rounded-2xl" />
                {/* Center viewfinder */}
                <div className="absolute inset-6 bg-transparent qr-scanner-frame">
                  {/* Corner brackets via pseudo-elements */}
                  <div className="absolute top-0 left-0 w-7 h-7 border-t-[3px] border-l-[3px] border-primary rounded-tl" />
                  <div className="absolute top-0 right-0 w-7 h-7 border-t-[3px] border-r-[3px] border-primary rounded-tr" />
                  <div className="absolute bottom-0 left-0 w-7 h-7 border-b-[3px] border-l-[3px] border-primary rounded-bl" />
                  <div className="absolute bottom-0 right-0 w-7 h-7 border-b-[3px] border-r-[3px] border-primary rounded-br" />
                  {/* Scan line */}
                  <div className="scan-line absolute left-0 right-0 h-0.5 bg-primary/80 shadow-lg" />
                  {/* Mock QR pattern */}
                  <div className="absolute inset-4 grid grid-cols-7 grid-rows-7 gap-0.5 opacity-30">
                    {Array.from({ length: 49 }).map((_, i) => (
                      <div
                        key={`qr-cell-${i}`}
                        className={`rounded-[1px] ${
                          [0,1,2,3,4,5,6,7,13,14,20,21,27,28,34,35,41,42,43,44,45,46,47,48].includes(i)
                            ? 'bg-white' :'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Scanning indicator */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                  <div className="flex items-center gap-2 bg-black/60 rounded-full px-3 py-1.5">
                    <Loader2 size={12} className="text-primary animate-spin" />
                    <span className="text-[10px] text-white font-medium">Đang quét...</span>
                  </div>
                </div>
              </div>

              <p className="text-sm font-semibold text-foreground mb-1">
                Hướng camera vào mã QR trên xe
              </p>
              <p className="text-xs text-muted-foreground text-center mb-5 max-w-xs">
                Mã QR ở trên ghi đông hoặc sườn xe. Đảm bảo đủ ánh sáng để quét.
              </p>

              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-muted rounded-xl text-xs font-semibold text-muted-foreground active:scale-95 transition-all duration-150">
                  <FlashlightIcon size={14} />
                  Bật đèn pin
                </button>
                <button
                  onClick={() => setScanState('scanning')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-muted rounded-xl text-xs font-semibold text-muted-foreground active:scale-95 transition-all duration-150"
                >
                  <RotateCcw size={14} />
                  Nhập mã thủ công
                </button>
              </div>
            </div>
          )}

          {scanState === 'success' && (
            <div className="flex flex-col items-center py-4 fade-in-up">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={40} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">Thuê xe thành công!</h3>
              <p className="text-sm text-muted-foreground text-center mb-5">
                Xe đã được mở khóa. Hãy lấy xe tại ô <strong className="text-foreground">{vehicle.slotNumber}</strong> và xuất phát.
              </p>

              <div className="w-full bg-secondary/60 rounded-2xl p-4 mb-5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Xe</p>
                    <p className="text-sm font-bold text-foreground">{vehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Mã chuyến</p>
                    <p className="text-sm font-bold text-primary tabular-nums">#TR-20260627</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Bắt đầu</p>
                    <p className="text-sm font-bold text-foreground tabular-nums">15:43</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Giá</p>
                    <p className="text-sm font-bold text-foreground tabular-nums">{formatVND(vehicle.pricePerMinute)}/phút</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 size={12} className="animate-spin text-primary" />
                <span>Chuyển sang màn hình chuyến đi sau <strong className="text-primary tabular-nums">{countdown}s</strong>...</span>
              </div>
            </div>
          )}
        </div>

        {/* Safe area bottom */}
        <div className="h-4" />
      </div>
    </div>
  );
}