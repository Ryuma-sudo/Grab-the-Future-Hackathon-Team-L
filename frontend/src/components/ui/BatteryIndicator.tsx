import React from 'react';

interface BatteryIndicatorProps {
  percent: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function BatteryIndicator({
  percent,
  showLabel = true,
  size = 'md',
}: BatteryIndicatorProps) {
  const getColor = () => {
    if (percent <= 5) return 'bg-danger';
    if (percent <= 20) return 'bg-warning';
    if (percent <= 50) return 'bg-accent';
    return 'bg-primary';
  };

  const getTextColor = () => {
    if (percent <= 5) return 'text-danger';
    if (percent <= 20) return 'text-warning';
    if (percent <= 50) return 'text-accent';
    return 'text-primary';
  };

  const sizeClasses = {
    sm: { bar: 'h-1.5 w-10', text: 'text-[10px]', icon: 'w-5 h-3' },
    md: { bar: 'h-2 w-14', text: 'text-xs', icon: 'w-7 h-4' },
    lg: { bar: 'h-3 w-20', text: 'text-sm', icon: 'w-10 h-6' },
  };

  const sc = sizeClasses[size];

  return (
    <div className="flex items-center gap-1.5">
      <div className={`relative flex items-center ${sc.icon} border-2 border-current ${getTextColor()} rounded-sm`}>
        <div
          className={`battery-bar ${getColor()} h-full rounded-[1px] transition-all duration-500`}
          style={{ width: `${Math.max(2, percent)}%` }}
        />
        <div className={`absolute -right-[4px] top-1/2 -translate-y-1/2 w-[3px] h-[40%] ${getTextColor().replace('text-', 'bg-')} rounded-r-sm`} />
      </div>
      {showLabel && (
        <span className={`${sc.text} font-bold tabular-nums ${getTextColor()}`}>
          {percent}%
        </span>
      )}
    </div>
  );
}