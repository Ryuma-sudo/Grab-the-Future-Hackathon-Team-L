import React from 'react';
import { Suspense } from 'react';
import MobileLayout from '@/components/MobileLayout';
import ActiveTripClient from './components/ActiveTripClient';

export default function ActiveTripPage() {
  return (
    <MobileLayout hideNav>
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading trip...</div>}>
        <ActiveTripClient />
      </Suspense>
    </MobileLayout>
  );
}
