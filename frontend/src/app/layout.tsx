import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { AuthProvider } from '@/lib/auth';
import '../styles/tailwind.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'EV Rental — Thuê Xe Điện Thông Minh',
  description: 'Thuê xe điện tức thì tại các trạm quanh bạn. Chọn xe, quét QR, xuất phát ngay — không cần đặt trước.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={plusJakartaSans.variable}>
      <body className={plusJakartaSans.className}>
        <AuthProvider>{children}</AuthProvider>

        <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fevrental3048back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.19" />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" /></body>
    </html>
  );
}
