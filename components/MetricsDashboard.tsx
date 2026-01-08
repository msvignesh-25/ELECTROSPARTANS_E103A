'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  MetricsData,
  getMetricsData,
  MonthlyMetrics,
} from '@/services/metricsService';
import RevenueGraph from '@/components/RevenueGraph';

interface MetricsDashboardProps {
  businessType?: string;
}

export default function MetricsDashboard({ businessType = '' }: MetricsDashboardProps) {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [highlightChange, setHighlightChange] = useState(false);

  // Simulate transaction data based on business type
  const generateTransactionData = (type: string) => {
    // Base multipliers for different business types
    const multipliers: Record<string, { revenue: number; orders: number; customers: number }> = {
      'Food': { revenue: 1.2, orders: 1.5, customers: 1.3 },
      'Retail': { revenue: 1.0, orders: 1.0, customers: 1.0 },
      'Service': { revenue: 1.5, orders: 0.8, customers: 0.9 },
      'Electronics': { revenue: 1.8, orders: 0.6, customers: 0.7 },
      'Bakery': { revenue: 0.9, orders: 1.8, customers: 1.6 },
      'Repair Shop': { revenue: 1.3, orders: 0.7, customers: 0.8 },
      'Cool Drinks': { revenue: 0.8, orders: 2.0, customers: 1.9 },
    };

    const multiplier = multipliers[type] || { revenue: 1.0, orders: 1.0, customers: 1.0 };
    
    // Generate simulated transactions
    const baseTransactions = 150;
    const baseRevenue = 50000;
    const baseCustomers = 80;
    
    const transactions: Array<{
      customerId: string;
      orderId: string;
      amount: number;
      date: Date;
    }> = [];
    
    const customerIds = new Set<string>();
    const customerOrderCounts: Record<string, number> = {};
    
    const numTransactions = Math.floor(baseTransactions * multiplier.orders);
    const numCustomers = Math.floor(baseCustomers * multiplier.customers);
    
    // Generate customer IDs
    for (let i = 0; i < numCustomers; i++) {
      customerIds.add(`customer_${i + 1}`);
      customerOrderCounts[`customer_${i + 1}`] = 0;
    }
    
    // Generate transactions
    for (let i = 0; i < numTransactions; i++) {
      const customerId = Array.from(customerIds)[Math.floor(Math.random() * customerIds.size)];
      const orderAmount = (baseRevenue / baseTransactions) * multiplier.revenue * (0.7 + Math.random() * 0.6);
      
      transactions.push({
        customerId,
        orderId: `order_${i + 1}`,
        amount: orderAmount,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
      });
      
      customerOrderCounts[customerId] = (customerOrderCounts[customerId] || 0) + 1;
    }
    
    return { transactions, customerOrderCounts, customerIds };
  };

  // Calculate metrics based on business type
  const calculatedMetrics = useMemo(() => {
    if (!businessType) {
      const data = getMetricsData();
      return data;
    }

    const { transactions, customerOrderCounts, customerIds } = generateTransactionData(businessType);
    
    // Calculate Orders Completed
    const ordersCompleted = transactions.length;
    
    // Calculate Total Customers
    const totalCustomers = customerIds.size;
    
    // Calculate Repeat Customers (customers with more than 1 order)
    const repeatCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
    
    // Calculate Monthly Revenue (sum of all transaction amounts)
    const monthlyRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate Average Order Value
    const averageOrderValue = ordersCompleted > 0 ? monthlyRevenue / ordersCompleted : 0;
    
    // Calculate Customer Retention Rate
    const customerRetentionRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;
    
    // Generate growth trend (last 6 months)
    const growthTrend: MonthlyMetrics[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    let previousRevenue = monthlyRevenue * 0.7; // Start lower
    
    for (let i = 0; i < 6; i++) {
      const currentRevenue = previousRevenue * (1 + (Math.random() * 0.1 - 0.05)); // ±5% variation
      const growthRate = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
      
      growthTrend.push({
        month: monthNames[i],
        revenue: currentRevenue,
        ordersCompleted: Math.floor(ordersCompleted * (0.8 + Math.random() * 0.4)),
        repeatedCustomers: Math.floor(repeatCustomers * (0.8 + Math.random() * 0.4)),
        growthRate: growthRate,
      });
      
      previousRevenue = currentRevenue;
    }
    
    return {
      monthlyRevenue,
      ordersCompleted,
      repeatedCustomers: repeatCustomers,
      totalCustomers,
      averageOrderValue,
      customerRetentionRate,
      growthTrend,
    };
  }, [businessType]);

  useEffect(() => {
    setMetrics(calculatedMetrics);
    setLoading(false);
    
    // Highlight change when business type updates
    if (businessType) {
      setHighlightChange(true);
      setTimeout(() => setHighlightChange(false), 1000);
    }
  }, [calculatedMetrics, businessType]);

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
          <div className={`bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 transition-all duration-500 ${
            highlightChange ? 'ring-4 ring-blue-400 scale-105' : ''
          }`}>
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

          <div className={`bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800 transition-all duration-500 ${
            highlightChange ? 'ring-4 ring-green-400 scale-105' : ''
          }`}>
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

          <div className={`bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800 transition-all duration-500 ${
            highlightChange ? 'ring-4 ring-purple-400 scale-105' : ''
          }`}>
            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
              Repeat Customers
            </p>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
              {metrics.repeatedCustomers}
            </p>
            <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
              Customers who submitted reviews
            </p>
          </div>

          <div className={`bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800 transition-all duration-500 ${
            highlightChange ? 'ring-4 ring-orange-400 scale-105' : ''
          }`}>
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

        {/* Revenue Graph */}
        <div className="mb-6">
          <RevenueGraph />
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

        {/* Algorithm Transparency Section */}
        {businessType && (
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
              How these metrics are calculated
            </h3>
            <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
              <div>
                <p className="font-medium mb-1">Orders Completed:</p>
                <p className="text-blue-700 dark:text-blue-300">
                  Total number of transactions recorded for {businessType} business type. Each transaction represents a completed order from a customer.
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Total Customers:</p>
                <p className="text-blue-700 dark:text-blue-300">
                  Unique customer count derived from all transactions. Each unique customer ID in the transaction records represents one customer.
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Repeat Customers:</p>
                <p className="text-blue-700 dark:text-blue-300">
                  Number of customers who have made more than one transaction. This is calculated by counting customers with multiple orders in the transaction history.
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Monthly Revenue:</p>
                <p className="text-blue-700 dark:text-blue-300">
                  Sum of all revenue entries (transaction amounts) associated with {businessType} business type. This represents the total income from all completed orders in the current month.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-300 dark:border-blue-700">
                <p className="text-xs text-blue-600 dark:text-blue-400 italic">
                  Note: Calculations are based on simulated transaction data for {businessType} businesses. Metrics update automatically when business type selection changes.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
