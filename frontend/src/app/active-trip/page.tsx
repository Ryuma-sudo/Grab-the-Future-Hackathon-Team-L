import React, { Suspense } from 'react';
import MobileLayout from '@/components/MobileLayout';
import ActiveTripClient from './components/ActiveTripClient';

export default function ActiveTripPage() {
  return (
    <MobileLayout hideNav>
      <Suspense>
        <ActiveTripClient />
      </Suspense>
    </MobileLayout>
  );
}
