'use client';

import React, { useState } from 'react';
import { CheckCircle, X, Star, MapPin, Clock, Route, Wallet, Zap } from 'lucide-react';
import type { TripState } from './ActiveTripClient';
import { formatVND } from '../../../lib/mockData';

interface EndTripModalProps {
  trip: TripState;
  onConfirm: () => void;
  onCancel: () => void;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h} giờ ${m} phút ${s} giây`;
  }
  return `${m} phút ${s} giây`;
}

export default function EndTripModal({ trip, onConfirm, onCancel }: EndTripModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = () => {
    setConfirming(true);
    setTimeout(() => {
      onConfirm();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl shadow-bottom-sheet fade-in-up overflow-hidden">
        {/* Header */}
        <div className="flex flex-col items-center pt-4 pb-3 border-b border-border px-5">
          <div className="w-10 h-1 bg-muted-foreground/20 rounded-full mb-3" />
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-secondary rounded-xl flex items-center justify-center">
                <CheckCircle size={16} className="text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Kết thúc chuyến đi</h2>
                <p className="text-[10px] text-muted-foreground">Xác nhận trả xe tại trạm</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 rounded-xl hover:bg-muted active:scale-95 transition-all duration-150"
            >
              <X size={18} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="px-5 py-4 overflow-y-auto max-h-[70vh]">
          {/* Trip summary */}
          <div className="bg-secondary/40 rounded-2xl p-4 mb-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Tóm tắt chuyến đi</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-card rounded-xl flex items-center justify-center">
                  <Clock size={14} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Thời gian</p>
                  <p className="text-sm font-bold text-foreground tabular-nums">{formatElapsed(trip.elapsedSeconds)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-card rounded-xl flex items-center justify-center">
                  <Route size={14} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Quãng đường</p>
                  <p className="text-sm font-bold text-foreground tabular-nums">{trip.distanceKm.toFixed(1)} km</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-card rounded-xl flex items-center justify-center">
                  <Zap size={14} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Pin còn lại</p>
                  <p className="text-sm font-bold text-foreground tabular-nums">{trip.batteryPercent.toFixed(0)}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Wallet size={14} className="text-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Tổng chi phí</p>
                  <p className="text-sm font-bold text-primary tabular-nums">{formatVND(trip.currentCost)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Return station */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-2xl mb-4">
            <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center">
              <MapPin size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground">Trạm Hồ Hoàn Kiếm</p>
              <p className="text-[10px] text-muted-foreground">12 Đinh Tiên Hoàng, Hoàn Kiếm</p>
            </div>
            <span className="text-[10px] font-bold text-primary bg-secondary px-2 py-1 rounded-full">Điểm trả</span>
          </div>

          {/* Rating */}
          <div className="mb-4">
            <p className="text-xs font-bold text-foreground mb-2">Đánh giá chuyến đi</p>
            <div className="flex items-center gap-2 justify-center py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={`star-${star}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="active:scale-110 transition-transform duration-150"
                >
                  <Star
                    size={28}
                    className={`transition-colors duration-100 ${
                      star <= (hoverRating || rating)
                        ? 'text-accent fill-accent' :'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-xs text-muted-foreground mt-1">
                {['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời!'][rating]}
              </p>
            )}
          </div>

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="w-full py-4 bg-primary text-white rounded-2xl text-sm font-bold active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 shadow-pin disabled:opacity-70"
          >
            {confirming ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Xác nhận trả xe
              </>
            )}
          </button>

          <button
            onClick={onCancel}
            className="w-full py-3 mt-2 text-muted-foreground text-sm font-medium active:scale-[0.98] transition-all duration-150"
          >
            Tiếp tục chuyến đi
          </button>
        </div>
      </div>
    </div>
  );
}