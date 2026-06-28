import React, { Suspense } from 'react';
import MobileLayout from '../../components/MobileLayout';
import VehiclePageHeader from './components/VehiclePageHeader';
import VehicleListClient from './components/VehicleListClient';
import { MOCK_STATIONS } from '../../lib/mockData';

export default async function VehicleSelectionRentalPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; dist?: string; walkMin?: string }>;
}) {
  const { from, walkMin } = await searchParams;

  const fromId = from ? parseInt(from, 10) : 1;
  const stationMockId = `station-${String(fromId).padStart(3, '0')}`;
  const station = MOCK_STATIONS.find((s) => s.id === stationMockId) ?? MOCK_STATIONS[0];
  const walkMinutes = walkMin ? parseInt(walkMin, 10) : station.walkMinutes;

  return (
    <MobileLayout>
      <div className="flex flex-col min-h-screen bg-background">
        <VehiclePageHeader
          stationName={station.name}
          stationAddress={station.address}
          availableCount={station.availableVehicles}
          totalCount={station.totalVehicles}
          distanceMeters={station.distance}
          walkMinutes={walkMinutes}
        />
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <VehicleListClient />
        </Suspense>
      </div>
    </MobileLayout>
  );
}
