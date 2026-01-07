'use client';

import React, { useState, useEffect } from 'react';
import {
  MetricsData,
  getMetricsData,
  MonthlyMetrics,
} from '@/services/metricsService';

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getMetricsData();
    setMetrics(data);
    setLoading(false);
  }, []);

  if (loading || !metrics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          📊 Metrics Dashboard
        </h2>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
              Monthly Revenue
            </p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
              {formatCurrency(metrics.monthlyRevenue)}
            </p>
            {metrics.growthTrend.length > 1 && (
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                {metrics.growthTrend[metrics.growthTrend.length - 1].growthRate >= 0 ? '↑' : '↓'}{' '}
                {Math.abs(metrics.growthTrend[metrics.growthTrend.length - 1].growthRate).toFixed(1)}% vs last month
              </p>
            )}
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
              Orders Completed
            </p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-300">
              {metrics.ordersCompleted}
            </p>
            <p className="text-xs text-green-700 dark:text-green-400 mt-1">
              This month
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
              Repeated Customers
            </p>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
              {metrics.repeatedCustomers}
            </p>
            <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
              Customers who submitted reviews
            </p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-1">
              Total Customers
            </p>
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-300">
              {metrics.totalCustomers}
            </p>
            <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
              {metrics.customerRetentionRate.toFixed(1)}% retention rate
            </p>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
              Average Order Value
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(metrics.averageOrderValue)}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
              Customer Retention Rate
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {metrics.customerRetentionRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Growth Trend Chart */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📈 Growth Trend (Last 6 Months)
          </h3>
          <div className="space-y-3">
            {metrics.growthTrend.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {month.month}
                    </span>
                    <span className={`text-xs font-semibold ${
                      month.growthRate >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {month.growthRate >= 0 ? '↑' : '↓'} {Math.abs(month.growthRate).toFixed(1)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <div>Revenue: {formatCurrency(month.revenue)}</div>
                    <div>Orders: {month.ordersCompleted}</div>
                    <div>Repeated: {month.repeatedCustomers}</div>
                  </div>
                  {/* Visual growth bar */}
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        month.growthRate >= 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.min(Math.abs(month.growthRate), 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
