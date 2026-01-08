'use client';

import React, { useState, useEffect } from 'react';
import { checkStockLevels, type StockAlert } from '@/services/stockMonitoringService';
import { calculateMonthlyRevenue, getPreviousMonthRevenue } from '@/services/metricsService';
import { checkSalesDrop } from '@/services/whatsappAlertsService';

interface StockSalesAlertsBannerProps {
  products: Array<{ id: string; name: string; stock: number }>;
}

export default function StockSalesAlertsBanner({ products }: StockSalesAlertsBannerProps) {
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [salesAlert, setSalesAlert] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  useEffect(() => {
    checkAlerts();
    // Check every 2 minutes
    const interval = setInterval(checkAlerts, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [products]);

  const checkAlerts = () => {
    // Check stock levels
    if (products.length > 0) {
      const alerts = checkStockLevels(products);
      setStockAlerts(alerts);
    }

    // Check sales drop
    const currentRevenue = calculateMonthlyRevenue();
    const previousRevenue = getPreviousMonthRevenue();
    if (previousRevenue > 0 && checkSalesDrop(currentRevenue, previousRevenue)) {
      const dropPercentage = ((previousRevenue - currentRevenue) / previousRevenue) * 100;
      setSalesAlert({
        show: true,
        message: `Sales have dropped by ${dropPercentage.toFixed(1)}% compared to last month. Current: ₹${currentRevenue.toLocaleString('en-IN')}, Previous: ₹${previousRevenue.toLocaleString('en-IN')}`,
      });
    } else {
      setSalesAlert({ show: false, message: '' });
    }
  };

  const handleDismissStockAlert = (alertId: string) => {
    setStockAlerts(alerts => alerts.filter(a => a.id !== alertId));
  };

  const handleDismissSalesAlert = () => {
    setSalesAlert({ show: false, message: '' });
  };

  if (stockAlerts.length === 0 && !salesAlert.show) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Stock Alerts */}
      {stockAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`rounded-lg p-4 border-l-4 ${
            alert.alertType === 'exhausted'
              ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
              : alert.alertType === 'critical'
              ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className={`font-bold text-lg mb-1 ${
                alert.alertType === 'exhausted'
                  ? 'text-red-900 dark:text-red-300'
                  : alert.alertType === 'critical'
                  ? 'text-orange-900 dark:text-orange-300'
                  : 'text-yellow-900 dark:text-yellow-300'
              }`}>
                {alert.alertType === 'exhausted' ? '🚨 STOCK EXHAUSTED' :
                 alert.alertType === 'critical' ? '⚠️ CRITICAL STOCK ALERT' :
                 '📉 LOW STOCK WARNING'}
              </h3>
              <p className={`text-sm ${
                alert.alertType === 'exhausted'
                  ? 'text-red-800 dark:text-red-200'
                  : alert.alertType === 'critical'
                  ? 'text-orange-800 dark:text-orange-200'
                  : 'text-yellow-800 dark:text-yellow-200'
              }`}>
                <strong>{alert.productName}</strong>
                {alert.alertType === 'exhausted' 
                  ? ' is completely out of stock. Immediate action required!'
                  : ` has only ${alert.currentStock} units remaining. ${alert.alertType === 'critical' ? 'Stock will be exhausted soon!' : 'Consider restocking.'}`}
              </p>
            </div>
            <button
              onClick={() => handleDismissStockAlert(alert.id)}
              className="ml-4 px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}

      {/* Sales Drop Alert */}
      {salesAlert.show && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-red-900 dark:text-red-300 mb-1">
                📉 SALES DROP ALERT
              </h3>
              <p className="text-sm text-red-800 dark:text-red-200">
                {salesAlert.message}
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-2">
                Review your marketing strategy and promotions.
              </p>
            </div>
            <button
              onClick={handleDismissSalesAlert}
              className="ml-4 px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
