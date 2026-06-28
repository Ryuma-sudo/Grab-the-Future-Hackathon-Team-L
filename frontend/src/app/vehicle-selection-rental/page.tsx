import React from 'react';
import { Suspense } from 'react';
import MobileLayout from '../../components/MobileLayout';
import VehiclePageHeader from './components/VehiclePageHeader';
import VehicleListClient from './components/VehicleListClient';

export default function VehicleSelectionRentalPage() {
  return (
    <MobileLayout>
      <div className="flex flex-col min-h-screen bg-background">
        <Suspense fallback={<div className="bg-card border-b border-border px-4 pt-12 pb-4 text-sm text-muted-foreground">Loading station...</div>}>
          <VehiclePageHeader />
        </Suspense>
        <Suspense fallback={<div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">Loading vehicles...</div>}>
          <VehicleListClient />
        </Suspense>
      </div>
    </MobileLayout>
  );
}
