"use client";

import React, { useEffect, useState } from 'react';
import AuthScreen from './sign-up-login/AuthScreen';
import MobileLayout from '../components/MobileLayout';
import MapView from './components/MapView';

const AUTH_STORAGE_KEY = 'evride-authenticated';

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(window.sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true');
  }, []);

  const handleAuthenticated = () => {
    window.sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  return (
    <MobileLayout>
      <MapView />
    </MobileLayout>
  );
}