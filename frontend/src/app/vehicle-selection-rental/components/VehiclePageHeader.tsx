import React from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Info } from 'lucide-react';

export default function VehiclePageHeader() {
  return (
    <div className="bg-card border-b border-border px-4 pt-12 pb-4 sticky top-0 z-20">
      <div className="flex items-center gap-3 mb-3">
        <Link
          href="/"
          className="p-2 rounded-xl hover:bg-muted active:scale-95 transition-all duration-150"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-foreground">Chọn xe</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin size={11} className="text-primary flex-shrink-0" />
            <p className="text-xs text-muted-foreground truncate">Trạm Hồ Hoàn Kiếm • 12 Đinh Tiên Hoàng</p>
          </div>
        </div>
        <button className="p-2 rounded-xl hover:bg-muted active:scale-95 transition-all duration-150">
          <Info size={18} className="text-muted-foreground" />
        </button>
      </div>

      {/* Station stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-secondary rounded-xl p-2.5 text-center">
          <p className="text-lg font-bold text-primary tabular-nums">4</p>
          <p className="text-[10px] text-secondary-foreground font-medium">Xe có sẵn</p>
        </div>
        <div className="bg-muted rounded-xl p-2.5 text-center">
          <p className="text-lg font-bold text-foreground tabular-nums">8</p>
          <p className="text-[10px] text-muted-foreground font-medium">Tổng xe</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-2.5 text-center">
          <p className="text-lg font-bold text-amber-600 tabular-nums">180m</p>
          <p className="text-[10px] text-amber-600/70 font-medium">Cách bạn</p>
        </div>
      </div>
    </div>
  );
}