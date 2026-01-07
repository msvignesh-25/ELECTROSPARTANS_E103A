'use client';

import React from 'react';
import MetricsDashboard from '@/components/MetricsDashboard';
import SchedulingCalendar from '@/components/SchedulingCalendar';

export default function OwnerPage() {
  // Load products from customer page (in production, this would come from API)
  const products = [
    { id: '1', name: 'Premium Coffee Blend', stock: 50 },
    { id: '2', name: 'Fresh Baked Croissants', stock: 30 },
    { id: '3', name: 'Phone Screen Repair', stock: 10 },
    { id: '4', name: 'Laptop Diagnostic Service', stock: 15 },
    { id: '5', name: 'Artisan Sourdough Bread', stock: 25 },
    { id: '6', name: 'Specialty Tea Collection', stock: 40 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Owner Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete business overview with metrics, scheduling, and alerts
          </p>
        </div>

        <div className="space-y-6">
          {/* Metrics Dashboard */}
          <MetricsDashboard />

          {/* Scheduling Calendar */}
          <SchedulingCalendar products={products} />
        </div>
      </div>
    </div>
  );
}
