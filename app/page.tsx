'use client';

import React from 'react';
import BusinessAdvisor from '@/components/BusinessAdvisor';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Main Content */}
      <main className="py-8">
        <BusinessAdvisor />
      </main>
    </div>
  );
} 