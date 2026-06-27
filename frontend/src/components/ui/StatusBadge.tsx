import React from 'react';

type BadgeVariant = 'available' | 'busy' | 'charging' | 'maintenance' | 'low-battery' | 'active';

interface StatusBadgeProps {
  variant: BadgeVariant;
  label?: string;
}

const variantConfig: Record<BadgeVariant, { bg: string; text: string; dot: string; defaultLabel: string }> = {
  available: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: 'bg-green-500',
    defaultLabel: 'Có sẵn',
  },
  busy: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
    defaultLabel: 'Đang dùng',
  },
  charging: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    defaultLabel: 'Đang sạc',
  },
  maintenance: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
    defaultLabel: 'Bảo trì',
  },
  'low-battery': {
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
    defaultLabel: 'Pin yếu',
  },
  active: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    dot: 'bg-primary',
    defaultLabel: 'Đang thuê',
  },
};

export default function StatusBadge({ variant, label }: StatusBadgeProps) {
  const config = variantConfig[variant];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${variant === 'active' ? 'pulse-dot' : ''}`} />
      {label ?? config.defaultLabel}
    </span>
  );
}