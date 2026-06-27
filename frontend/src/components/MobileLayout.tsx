import React from 'react';
import BottomNav from './BottomNav';

interface MobileLayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

export default function MobileLayout({ children, hideNav = false }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto relative">
      <main className={`flex-1 flex flex-col ${hideNav ? '' : 'pb-16'}`}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}