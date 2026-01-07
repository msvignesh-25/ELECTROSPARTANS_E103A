'use client';

import React, { useState, useEffect } from 'react';
import { generateDynamicPricing } from '@/services/aiServices';

interface ShopData {
  shopName: string;
  businessType: string;
  daysAvailable: string[];
  monthlyBudget: number;
  numberOfWorkers: number;
  processes: string[];
}

interface SmartDynamicPricingProps {
  shopData: ShopData;
}

export default function SmartDynamicPricing({ shopData }: SmartDynamicPricingProps) {
  const [weather, setWeather] = useState<string>('');
  const [footTraffic, setFootTraffic] = useState<'low' | 'medium' | 'high'>('medium');
  const [pricing, setPricing] = useState<{
    discount: number;
    reason: string;
    duration: string;
    message: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(false);

  // Auto-update pricing based on conditions
  useEffect(() => {
    if (!autoUpdate) return;

    const updatePricing = async () => {
      setIsGenerating(true);
      try {
        const result = await generateDynamicPricing(shopData, new Date(), weather, footTraffic);
        setPricing(result);
      } catch (error) {
        console.error('Error generating pricing:', error);
      } finally {
        setIsGenerating(false);
      }
    };

    updatePricing();
    const interval = setInterval(updatePricing, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [autoUpdate, shopData, weather, footTraffic]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateDynamicPricing(shopData, new Date(), weather, footTraffic);
      setPricing(result);
    } catch (error) {
      console.error('Error generating pricing:', error);
      alert('Failed to generate pricing. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        💰 Smart Dynamic Pricing (Happy Hour 2.0)
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        AI analyzes slow hours and conditions to automatically offer flash deals. Creates FOMO and rewards customers for visiting during quiet times!
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Weather
            </label>
            <select
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select weather...</option>
              <option value="sunny">Sunny</option>
              <option value="rainy">Rainy</option>
              <option value="cloudy">Cloudy</option>
              <option value="snowy">Snowy</option>
              <option value="windy">Windy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Foot Traffic Level
            </label>
            <select
              value={footTraffic}
              onChange={(e) => setFootTraffic(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="autoUpdate"
            checked={autoUpdate}
            onChange={(e) => setAutoUpdate(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="autoUpdate" className="text-sm text-gray-700 dark:text-gray-300">
            Auto-update pricing every 5 minutes
          </label>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Calculating...' : '⚡ Generate Flash Deal'}
        </button>

        {pricing && (
          <div className="mt-4">
            {pricing.discount > 0 ? (
              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  {pricing.discount}% OFF
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {pricing.reason}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  Valid for: {pricing.duration}
                </p>
                <div className="bg-white dark:bg-gray-800 rounded p-4 mb-4">
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {pricing.message}
                  </p>
                </div>
                <button
                  onClick={() => {
                    // In production, this would display on a digital board
                    navigator.clipboard.writeText(pricing.message);
                    alert('Deal message copied! Display this on your digital board.');
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  📺 Display on Digital Board
                </button>
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center">
                <p className="text-gray-700 dark:text-gray-300">
                  {pricing.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  No special pricing needed at this time.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
