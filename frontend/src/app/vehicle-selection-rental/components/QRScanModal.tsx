'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Zap, CheckCircle, Loader2, RotateCcw } from 'lucide-react';
import type { Vehicle } from '../../../lib/mockData';
import { getVehicleTypeLabel, formatVND, TRIP_BASE_FEE } from '../../../lib/mockData';
import BatteryIndicator from '../../../components/ui/BatteryIndicator';
import { useRouter } from 'next/navigation';

interface QRScanModalProps {
  vehicle: Vehicle;
  fromId?: string | null;
  toId?: string | null;
  onClose: () => void;
}

type ScanState = 'scanning' | 'success';

export default function QRScanModal({ vehicle, fromId, toId, onClose }: QRScanModalProps) {
  const [scanState, setScanState] = useState<ScanState>('scanning');
  const [countdown, setCountdown] = useState(3);
  const router = useRouter();

  // Simulate QR scan success after 2.5 s
  useEffect(() => {
    if (scanState !== 'scanning') return;
    const t = setTimeout(() => setScanState('success'), 2500);
    return () => clearTimeout(t);
  }, [scanState]);

  // Countdown → navigate to active-trip with from/to params
  useEffect(() => {
    if (scanState !== 'success') return;
    if (countdown === 0) {
      const params = new URLSearchParams();
      if (fromId) params.set('from', fromId);
      if (toId) params.set('to', toId);
      const qs = params.toString();
      router.push(`/active-trip${qs ? `?${qs}` : ''}`);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [scanState, countdown, router, fromId, toId]);

  return (
    /* Full-screen overlay — sits above everything */
    <div className="fixed inset-0 z-[60] bg-background flex flex-col">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 bg-card border-b border-border">
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-muted active:scale-95 transition-all duration-150"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-foreground">Quét mã QR</h2>
          <p className="text-xs text-muted-foreground truncate">
            {getVehicleTypeLabel(vehicle.type)} • Ô {vehicle.slotNumber}
          </p>
        </div>
      </div>

      {/* ── Vehicle summary ── */}
      <div className="px-4 py-3 bg-secondary/40 flex items-center gap-3 border-b border-border">
        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
          <Zap size={18} className="text-primary" fill="currentColor" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">{vehicle.model}</p>
          <p className="text-xs text-muted-foreground">{formatVND(TRIP_BASE_FEE)} / 5 phút đầu</p>
        </div>
        <BatteryIndicator percent={vehicle.batteryPercent} size="sm" />
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        {scanState === 'scanning' && (
          <div className="flex flex-col items-center w-full">
            {/* Camera viewfinder */}
            <div className="relative w-64 h-64 mb-6">
              <div className="absolute inset-0 bg-slate-900/80 rounded-2xl" />
              <div className="absolute inset-8 bg-transparent">
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-primary rounded-tl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-primary rounded-tr" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-primary rounded-bl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-primary rounded-br" />
                {/* Scan line */}
                <div className="scan-line absolute left-0 right-0 h-0.5 bg-primary/80 shadow-lg" />
                {/* Mock QR pattern */}
                <div className="absolute inset-4 grid grid-cols-7 grid-rows-7 gap-0.5 opacity-30">
                  {Array.from({ length: 49 }).map((_, i) => (
                    <div
                      key={`qr-${i}`}
                      className={`rounded-[1px] ${
                        [0,1,2,3,4,5,6,7,13,14,20,21,27,28,34,35,41,42,43,44,45,46,47,48].includes(i)
                          ? 'bg-white' : 'bg-transparent'
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

            <p className="text-base font-semibold text-foreground mb-2 text-center">
              Hướng camera vào mã QR trên xe
            </p>
            <p className="text-sm text-muted-foreground text-center mb-8 max-w-xs">
              Mã QR ở trên ghi đông hoặc sườn xe. Đảm bảo đủ ánh sáng để quét.
            </p>

            <button
              onClick={() => setScanState('scanning')}
              className="flex items-center gap-2 px-5 py-3 bg-muted rounded-xl text-sm font-semibold text-muted-foreground active:scale-95 transition-all duration-150"
            >
              <RotateCcw size={15} />
              Nhập mã thủ công
            </button>
          </div>
        )}

        {scanState === 'success' && (
          <div className="flex flex-col items-center w-full fade-in-up">
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-5">
              <CheckCircle size={48} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Thuê xe thành công!</h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-xs">
              Xe đã được mở khóa. Lấy xe tại ô{' '}
              <strong className="text-foreground">{vehicle.slotNumber}</strong> và xuất phát.
            </p>

            <div className="w-full bg-secondary/60 rounded-2xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Xe</p>
                  <p className="text-sm font-bold text-foreground">{vehicle.model}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Mã chuyến</p>
                  <p className="text-sm font-bold text-primary tabular-nums">#TR-20260628</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Bắt đầu</p>
                  <p className="text-sm font-bold text-foreground tabular-nums">
                    {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Giá</p>
                  <p className="text-sm font-bold text-foreground tabular-nums">
                    {formatVND(TRIP_BASE_FEE)} / 5 phút đầu
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={14} className="animate-spin text-primary" />
              <span>
                Chuyển sang màn hình chuyến đi sau{' '}
                <strong className="text-primary tabular-nums">{countdown}s</strong>...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
