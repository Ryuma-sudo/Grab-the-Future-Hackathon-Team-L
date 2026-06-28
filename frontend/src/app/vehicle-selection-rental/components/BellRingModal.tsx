'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type { ApiVehicle } from '../../../lib/api';

interface BellRingModalProps {
  vehicle: ApiVehicle;
  onClose: () => void;
}

export default function BellRingModal({ vehicle, onClose }: BellRingModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <>
      <style>{`
        @keyframes bell-ring {
          0%   { transform: rotate(0deg); }
          8%   { transform: rotate(-22deg); }
          16%  { transform: rotate(22deg); }
          24%  { transform: rotate(-18deg); }
          32%  { transform: rotate(18deg); }
          40%  { transform: rotate(-12deg); }
          48%  { transform: rotate(12deg); }
          56%  { transform: rotate(-6deg); }
          64%  { transform: rotate(6deg); }
          72%  { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes ring-pulse {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes bell-bounce {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        .bell-icon {
          animation: bell-ring 0.8s ease-in-out infinite, bell-bounce 1.6s ease-in-out infinite;
          transform-origin: top center;
          display: inline-block;
        }
        .ring-wave   { animation: ring-pulse 1.6s ease-out infinite; }
        .ring-wave-2 { animation: ring-pulse 1.6s ease-out 0.4s infinite; }
        .ring-wave-3 { animation: ring-pulse 1.6s ease-out 0.8s infinite; }
      `}</style>

      <div
        className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center px-6"
        onClick={onClose}
      >
        <div
          className="bg-card rounded-3xl p-7 w-full max-w-sm shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-end mb-1">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-muted active:scale-90 transition-all"
            >
              <X size={18} className="text-muted-foreground" />
            </button>
          </div>

          <div className="flex justify-center mb-5 relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-20 h-20 rounded-full border-2 border-primary/40 ring-wave" />
              <div className="absolute w-20 h-20 rounded-full border-2 border-primary/30 ring-wave-2" />
              <div className="absolute w-20 h-20 rounded-full border-2 border-primary/20 ring-wave-3" />
            </div>
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center z-10">
              <span className="bell-icon text-5xl select-none">🔔</span>
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-base font-bold text-foreground mb-1">Xe đang reo chuông!</p>
            <p className="text-sm text-muted-foreground">
              {vehicle.code}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Lại gần trạm và nghe tiếng chuông để xác định xe
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-foreground text-background rounded-2xl text-sm font-bold active:scale-[0.98] transition-all duration-150"
          >
            Dừng reo chuông
          </button>
        </div>
      </div>
    </>
  );
}
