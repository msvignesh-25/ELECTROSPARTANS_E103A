'use client';

import React, { useState, useEffect, useRef } from 'react';

interface RevenueEntry {
  id: string;
  date: string;
  month: string;
  year: number;
  amount: number;
  timestamp: Date;
}

export default function RevenueGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revenueData, setRevenueData] = useState<RevenueEntry[]>([]);

  useEffect(() => {
    loadRevenueData();
    // Refresh every 30 seconds
    const interval = setInterval(loadRevenueData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (canvasRef.current && revenueData.length > 0) {
      drawGraph();
    }
  }, [revenueData]);

  const loadRevenueData = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('revenueEntries');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const entries = parsed.map((e: any) => ({
            ...e,
            timestamp: new Date(e.timestamp),
          }));
          setRevenueData(entries);
        } catch (error) {
          console.error('Error loading revenue data:', error);
        }
      }
    }
  };

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = 400;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (revenueData.length === 0) {
      ctx.fillStyle = '#6B7280';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No revenue data available', width / 2, height / 2);
      return;
    }

    // Group by month/year
    const monthlyData: Record<string, number> = {};
    revenueData.forEach(entry => {
      const key = `${entry.month} ${entry.year}`;
      monthlyData[key] = (monthlyData[key] || 0) + entry.amount;
    });

    const sortedKeys = Object.keys(monthlyData).sort((a, b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
      const monthIndexA = months.indexOf(monthA);
      const monthIndexB = months.indexOf(monthB);
      if (parseInt(yearA) !== parseInt(yearB)) {
        return parseInt(yearA) - parseInt(yearB);
      }
      return monthIndexA - monthIndexB;
    });

    const values = sortedKeys.map(key => monthlyData[key]);
    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values, 0);

    // Padding
    const padding = { top: 40, right: 40, bottom: 60, left: 80 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Draw axes
    ctx.strokeStyle = '#9CA3AF';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.stroke();

    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    // Draw grid lines
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 0.5;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (graphHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Draw Y-axis labels
    ctx.fillStyle = '#6B7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= gridLines; i++) {
      const value = maxValue - (maxValue - minValue) * (i / gridLines);
      const y = padding.top + (graphHeight / gridLines) * i;
      ctx.fillText(`₹${(value / 1000).toFixed(0)}k`, padding.left - 10, y + 4);
    }

    // Draw X-axis labels and bars
    const barWidth = graphWidth / sortedKeys.length * 0.7;
    const barSpacing = graphWidth / sortedKeys.length;

    sortedKeys.forEach((key, index) => {
      const value = monthlyData[key];
      const barHeight = ((value - minValue) / (maxValue - minValue)) * graphHeight;
      const x = padding.left + index * barSpacing + barSpacing * 0.15;
      const y = height - padding.bottom - barHeight;

      // Draw bar
      const gradient = ctx.createLinearGradient(x, y, x, height - padding.bottom);
      gradient.addColorStop(0, '#3B82F6');
      gradient.addColorStop(1, '#1D4ED8');
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw value on top of bar
      ctx.fillStyle = '#1F2937';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`₹${(value / 1000).toFixed(1)}k`, x + barWidth / 2, y - 5);

      // Draw month label
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px Arial';
      ctx.save();
      ctx.translate(x + barWidth / 2, height - padding.bottom + 20);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(key.length > 10 ? key.substring(0, 10) + '...' : key, 0, 0);
      ctx.restore();
    });

    // Draw title
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Revenue Over Time', width / 2, 20);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Calculate statistics
  const totalRevenue = revenueData.reduce((sum, e) => sum + e.amount, 0);
  const averageRevenue = revenueData.length > 0 ? totalRevenue / revenueData.length : 0;
  const monthlyData: Record<string, number> = {};
  revenueData.forEach(entry => {
    const key = `${entry.month} ${entry.year}`;
    monthlyData[key] = (monthlyData[key] || 0) + entry.amount;
  });
  const maxMonth = Object.entries(monthlyData).reduce((a, b) => 
    monthlyData[a[0]] > monthlyData[b[0]] ? a : b, 
    ['', 0]
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        📈 Revenue Graph
      </h3>
      
      {revenueData.length > 0 ? (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Total Revenue</p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-300">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <p className="text-xs text-green-600 dark:text-green-400 mb-1">Average Entry</p>
              <p className="text-lg font-bold text-green-900 dark:text-green-300">
                {formatCurrency(averageRevenue)}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
              <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Best Month</p>
              <p className="text-lg font-bold text-purple-900 dark:text-purple-300">
                {maxMonth[0] || 'N/A'}
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                {formatCurrency(maxMonth[1] as number)}
              </p>
            </div>
          </div>

          {/* Canvas Graph */}
          <div className="w-full">
            <canvas
              ref={canvasRef}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg"
              style={{ height: '400px' }}
            />
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No revenue data available. Add revenue entries to see the graph.</p>
        </div>
      )}
    </div>
  );
}
