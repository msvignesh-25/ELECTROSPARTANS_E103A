'use client';

import React, { useState, useEffect } from 'react';

interface RevenueData {
  month: string;
  monthKey: string;
  revenue: number;
  year: number;
  monthNumber: number;
}

interface MonthlyRevenueGraphProps {
  vendorId?: string;
  months?: number;
  minimumThreshold?: number;
}

export default function MonthlyRevenueGraph({ 
  vendorId, 
  months = 12,
  minimumThreshold = 50000 
}: MonthlyRevenueGraphProps) {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    loadRevenueData();
  }, [vendorId, months]);

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      const url = `/api/revenue/monthly?months=${months}${vendorId ? `&vendorId=${vendorId}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setRevenueData(data.data || []);
        setTotalRevenue(data.totalRevenue || 0);
      }
    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <p className="text-gray-600 dark:text-gray-400">Loading revenue data...</p>
      </div>
    );
  }

  if (revenueData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📈 Monthly Revenue Graph
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No revenue data available yet.</p>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), minimumThreshold);
  const minRevenue = Math.min(...revenueData.map(d => d.revenue), 0);
  const chartHeight = 300;
  const chartWidth = Math.max(800, revenueData.length * 60);
  const barWidth = Math.max(20, (chartWidth / revenueData.length) * 0.6);

  // Check if any month reached minimum threshold
  const monthsAboveThreshold = revenueData.filter(d => d.revenue >= minimumThreshold);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          📈 Monthly Revenue Graph
        </h3>
        {monthsAboveThreshold.length > 0 && (
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-semibold rounded-full">
            {monthsAboveThreshold.length} month(s) above threshold
          </span>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Total Revenue</p>
          <p className="text-xl font-bold text-blue-900 dark:text-blue-300">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <p className="text-xs text-green-600 dark:text-green-400 mb-1">Average Monthly</p>
          <p className="text-xl font-bold text-green-900 dark:text-green-300">
            ₹{Math.round(totalRevenue / revenueData.length).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Minimum Threshold</p>
          <p className="text-xl font-bold text-purple-900 dark:text-purple-300">
            ₹{minimumThreshold.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full overflow-x-auto">
        <div className="relative" style={{ minWidth: `${chartWidth}px`, height: `${chartHeight + 80}px` }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-20 w-16 flex flex-col justify-between">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const value = maxRevenue - (maxRevenue - minRevenue) * ratio;
              return (
                <div key={ratio} className="text-xs text-gray-600 dark:text-gray-400 text-right pr-2">
                  ₹{(value / 1000).toFixed(0)}k
                </div>
              );
            })}
          </div>

          {/* Chart area */}
          <div className="ml-16 mr-4 relative" style={{ height: `${chartHeight}px` }}>
            {/* Threshold line */}
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed border-yellow-500 opacity-60"
              style={{ bottom: `${((minimumThreshold - minRevenue) / (maxRevenue - minRevenue)) * chartHeight}px` }}
            >
              <span className="absolute -left-20 text-xs text-yellow-600 dark:text-yellow-400 font-semibold">
                Threshold: ₹{(minimumThreshold / 1000).toFixed(0)}k
              </span>
            </div>

            {/* Bars */}
            <div className="flex items-end h-full gap-1">
              {revenueData.map((data, index) => {
                const barHeight = ((data.revenue - minRevenue) / (maxRevenue - minRevenue)) * chartHeight;
                const isAboveThreshold = data.revenue >= minimumThreshold;
                
                return (
                  <div
                    key={data.monthKey}
                    className="flex-1 flex flex-col items-center justify-end group relative"
                    style={{ minWidth: `${barWidth}px` }}
                  >
                    {/* Bar */}
                    <div
                      className={`w-full rounded-t transition-all hover:opacity-80 ${
                        isAboveThreshold
                          ? 'bg-gradient-to-t from-green-500 to-green-400'
                          : 'bg-gradient-to-t from-blue-500 to-blue-400'
                      }`}
                      style={{ height: `${Math.max(barHeight, 2)}px` }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 dark:bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                        {data.month}: ₹{data.revenue.toLocaleString('en-IN')}
                        {isAboveThreshold && ' ✓'}
                      </div>
                    </div>
                    
                    {/* Month label */}
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 text-center transform -rotate-45 origin-top-left whitespace-nowrap" style={{ width: '60px', marginLeft: '-20px' }}>
                      {data.month}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Below Threshold</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Above Threshold (₹{minimumThreshold.toLocaleString('en-IN')}+)</span>
        </div>
      </div>
    </div>
  );
}
