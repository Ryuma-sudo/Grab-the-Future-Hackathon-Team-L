import React from 'react';
import MobileLayout from '@/components/MobileLayout';
import ActiveTripClient from './components/ActiveTripClient';

export default function ActiveTripPage() {
  return (
    <MobileLayout hideNav>
      <ActiveTripClient />
    </MobileLayout>
  );
}