import React from 'react';
import MobileLayout from '../../components/MobileLayout';
import VehiclePageHeader from './components/VehiclePageHeader';
import VehicleListClient from './components/VehicleListClient';

export default function VehicleSelectionRentalPage() {
  return (
    <MobileLayout>
      <div className="flex flex-col min-h-screen bg-background">
        <VehiclePageHeader />
        <VehicleListClient />
      </div>
    </MobileLayout>
  );
}