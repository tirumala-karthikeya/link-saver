'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import Dashboard from '@/components/Dashboard';
import HybridAuthForm from '@/components/HybridAuthForm';

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 flex flex-col items-center space-y-4">
          <div className="loading-spinner w-12 h-12"></div>
          <p className="text-white/80 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (session) {
    return <Dashboard />;
  }

  return <HybridAuthForm />;
} 