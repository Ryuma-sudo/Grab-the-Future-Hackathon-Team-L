import React from 'react';
import MobileLayout from '@/components/MobileLayout';
import ActiveTripClient from './components/ActiveTripClient';

export default async function ActiveTripPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; vehicle?: string }>;
}) {
  const { from, to, vehicle } = await searchParams;
  return (
    <MobileLayout hideNav>
      <ActiveTripClient fromStationId={from} toStationId={to} vehicleModel={vehicle} />
    </MobileLayout>
  );
}
