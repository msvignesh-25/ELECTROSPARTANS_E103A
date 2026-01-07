'use client';

import React, { useState, useEffect } from 'react';
import MetricsDashboard from '@/components/MetricsDashboard';
import SchedulingCalendar from '@/components/SchedulingCalendar';
import EnhancedSchedulingCalendar from '@/components/EnhancedSchedulingCalendar';
import OperationalDashboard from '@/components/OperationalDashboard';
import type { BusinessConstraints } from '@/services/operationalAIService';

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

  const [constraints, setConstraints] = useState<BusinessConstraints | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<Array<{ day: string; tasks: string[] }>>([]);

  // Load business constraints from BusinessAdvisor
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('businessAdvisor_inputs');
      if (saved) {
        try {
          const inputs = JSON.parse(saved);
          const savedPlan = localStorage.getItem('businessAdvisor_weeklyPlan');
          
          setConstraints({
            timePerDay: parseFloat(inputs.timePerDay) || 0,
            monthlyBudget: parseFloat(inputs.budget) || 0,
            numberOfWorkers: parseInt(inputs.numberOfWorkers) || 1,
            businessType: inputs.businessType || 'Business',
            daysAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], // Default
          });

          if (savedPlan) {
            setWeeklyPlan(JSON.parse(savedPlan));
          }
        } catch (error) {
          console.error('Error loading business constraints:', error);
        }
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Owner Dashboard - Operational AI Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete business overview with automated task scheduling, real-time alerts, and performance metrics
          </p>
        </div>

        <div className="space-y-6">
          {/* Operational Dashboard (Today's Tasks, Alerts, Notifications) */}
          <OperationalDashboard 
            products={products}
            constraints={constraints || undefined}
            weeklyPlan={weeklyPlan}
          />

          {/* Metrics Dashboard */}
          <MetricsDashboard />

          {/* Enhanced Scheduling Calendar with Reminders */}
          <EnhancedSchedulingCalendar 
            products={products}
            constraints={constraints || undefined}
            weeklyPlan={weeklyPlan}
          />

          {/* Legacy Scheduling Calendar */}
          {/* <SchedulingCalendar products={products} /> */}
        </div>
      </div>
    </div>
  );
}
