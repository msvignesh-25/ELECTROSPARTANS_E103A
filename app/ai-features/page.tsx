'use client';

import React, { useState, useEffect } from 'react';
import AIFeaturesDashboard from '@/components/ai-features/AIFeaturesDashboard';

interface ShopData {
  shopName: string;
  businessType: string;
  daysAvailable: string[];
  monthlyBudget: number;
  numberOfWorkers: number;
  processes: string[];
}

export default function AIFeaturesPage() {
  const [shopData, setShopData] = useState<ShopData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load shop data from localStorage (set by BusinessAdvisor)
    const loadShopData = () => {
      try {
        const saved = localStorage.getItem('businessAdvisor_inputs');
        if (saved) {
          const inputs = JSON.parse(saved);
          
          // Convert BusinessAdvisor inputs to ShopData format
          const data: ShopData = {
            shopName: inputs.businessType || 'Your Shop',
            businessType: inputs.businessType || 'Business',
            daysAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], // Default
            monthlyBudget: parseFloat(inputs.budget) || 0,
            numberOfWorkers: parseInt(inputs.numberOfWorkers) || 1,
            processes: ['customer service', 'product preparation'], // Default
          };
          
          setShopData(data);
        } else {
          // Default data if nothing is saved
          setShopData({
            shopName: 'Your Shop',
            businessType: 'Coffee Shop',
            daysAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            monthlyBudget: 200,
            numberOfWorkers: 2,
            processes: ['coffee brewing', 'customer service'],
          });
        }
      } catch (error) {
        console.error('Error loading shop data:', error);
        // Fallback default data
        setShopData({
          shopName: 'Your Shop',
          businessType: 'Coffee Shop',
          daysAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          monthlyBudget: 200,
          numberOfWorkers: 2,
          processes: ['coffee brewing', 'customer service'],
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadShopData();
  }, []);

  // Manual data input form (if no data from BusinessAdvisor)
  const [manualInput, setManualInput] = useState({
    shopName: '',
    businessType: '',
    daysAvailable: [] as string[],
    monthlyBudget: '',
    numberOfWorkers: '',
    processes: '',
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShopData({
      shopName: manualInput.shopName,
      businessType: manualInput.businessType,
      daysAvailable: manualInput.daysAvailable,
      monthlyBudget: parseFloat(manualInput.monthlyBudget) || 0,
      numberOfWorkers: parseInt(manualInput.numberOfWorkers) || 1,
      processes: manualInput.processes.split(',').map(p => p.trim()).filter(p => p),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading AI Features...</p>
        </div>
      </div>
    );
  }

  if (!shopData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Setup Your Shop Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Enter your shop information to enable AI features customized specifically for your business.
          </p>
          
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shop Name *
              </label>
              <input
                type="text"
                value={manualInput.shopName}
                onChange={(e) => setManualInput({ ...manualInput, shopName: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Type *
              </label>
              <input
                type="text"
                value={manualInput.businessType}
                onChange={(e) => setManualInput({ ...manualInput, businessType: e.target.value })}
                placeholder="e.g., Coffee Shop, Bakery"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Days Available *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <label key={day} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={manualInput.daysAvailable.includes(day)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setManualInput({ ...manualInput, daysAvailable: [...manualInput.daysAvailable, day] });
                        } else {
                          setManualInput({ ...manualInput, daysAvailable: manualInput.daysAvailable.filter(d => d !== day) });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{day.slice(0, 3)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Budget ($) *
                </label>
                <input
                  type="number"
                  value={manualInput.monthlyBudget}
                  onChange={(e) => setManualInput({ ...manualInput, monthlyBudget: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Workers *
                </label>
                <input
                  type="number"
                  value={manualInput.numberOfWorkers}
                  onChange={(e) => setManualInput({ ...manualInput, numberOfWorkers: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Processes (comma-separated) *
              </label>
              <input
                type="text"
                value={manualInput.processes}
                onChange={(e) => setManualInput({ ...manualInput, processes: e.target.value })}
                placeholder="e.g., coffee brewing, customer service, inventory"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Start Using AI Features
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AIFeaturesDashboard shopData={shopData} />;
}
