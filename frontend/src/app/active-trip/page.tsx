import React from 'react';
import MobileLayout from '@/components/MobileLayout';
import ActiveTripClient from './components/ActiveTripClient';

export default async function ActiveTripPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;
  return (
    <MobileLayout hideNav>
      <ActiveTripClient fromStationId={from} toStationId={to} />
    </MobileLayout>
  );
}
