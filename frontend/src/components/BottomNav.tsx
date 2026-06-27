'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Bike, Navigation } from 'lucide-react';
import Icon from './ui/AppIcon';


const navItems = [
  {
    key: 'nav-map',
    href: '/',
    label: 'Tìm trạm',
    icon: MapPin,
  },
  {
    key: 'nav-vehicle',
    href: '/vehicle-selection-rental',
    label: 'Chọn xe',
    icon: Bike,
  },
  {
    key: 'nav-trip',
    href: '/active-trip',
    label: 'Chuyến đi',
    icon: Navigation,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems?.map((item) => {
          const Icon = item?.icon;
          const isActive =
            item?.href === '/'
              ? pathname === '/'
              : pathname?.startsWith(item?.href);
          return (
            <Link
              key={item?.key}
              href={item?.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-150 min-w-[60px] ${
                isActive
                  ? 'text-primary' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-150 ${
                  isActive ? 'bg-secondary' : ''
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              </div>
              <span
                className={`text-[10px] font-semibold tracking-wide ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item?.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}