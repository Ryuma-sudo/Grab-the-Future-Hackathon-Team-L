import React, { Suspense } from 'react';
import MobileLayout from '../../components/MobileLayout';
import VehiclePageHeader from './components/VehiclePageHeader';
import VehicleListClient from './components/VehicleListClient';

export default function VehicleSelectionRentalPage() {
  return (
    <MobileLayout>
      <div className="flex flex-col min-h-screen bg-background">
        <VehiclePageHeader />
        <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
          <VehicleListClient />
        </Suspense>
      </div>
    </MobileLayout>
  );
}
