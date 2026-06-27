'use client';

import React, { useState } from 'react';
import { Search, Bell, User, ChevronDown } from 'lucide-react';

export default function MapTopBar() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div className="absolute top-0 left-0 right-0 z-30 px-4 pt-12 pb-3 pointer-events-none">
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Search bar */}
        <div
          className={`flex-1 flex items-center gap-2 bg-card rounded-2xl px-4 py-3 shadow-card-lg transition-all duration-200 ${
            searchFocused ? 'ring-2 ring-primary/30' : ''
          }`}
        >
          <Search size={16} className="text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Tìm địa điểm, trạm xe..."
            className="flex-1 bg-transparent text-sm font-medium placeholder:text-muted-foreground outline-none"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <div className="flex items-center gap-1 text-muted-foreground border-l border-border pl-2">
            <span className="text-xs font-medium">Gần tôi</span>
            <ChevronDown size={12} />
          </div>
        </div>

        {/* Notification */}
        <button className="relative bg-card rounded-2xl p-3 shadow-card-lg active:scale-95 transition-all duration-150">
          <Bell size={18} className="text-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full" />
        </button>

        {/* User */}
        <button className="bg-card rounded-2xl p-3 shadow-card-lg active:scale-95 transition-all duration-150">
          <User size={18} className="text-foreground" />
        </button>
      </div>
    </div>
  );
}