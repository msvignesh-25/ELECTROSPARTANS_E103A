'use client';

import React, { useState, useEffect } from 'react';

interface RevenueEntry {
  id: string;
  date: string;
  month: string;
  year: number;
  amount: number;
  timestamp: Date;
}

export default function RevenueInput() {
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [entries, setEntries] = useState<RevenueEntry[]>([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('revenueEntries');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setEntries(parsed.map((e: any) => ({
            ...e,
            timestamp: new Date(e.timestamp),
          })));
        } catch (error) {
          console.error('Error loading revenue entries:', error);
        }
      }
    }
  };

  const saveEntries = (newEntries: RevenueEntry[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('revenueEntries', JSON.stringify(newEntries));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !amount) {
      alert('Please fill in both date and amount');
      return;
    }

    const revenueAmount = parseFloat(amount);
    if (isNaN(revenueAmount) || revenueAmount <= 0) {
      alert('Please enter a valid revenue amount');
      return;
    }

    const dateObj = new Date(date);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    const newEntry: RevenueEntry = {
      id: Date.now().toString(),
      date: date,
      month: monthNames[dateObj.getMonth()],
      year: dateObj.getFullYear(),
      amount: revenueAmount,
      timestamp: new Date(),
    };

    const newEntries = [...entries, newEntry].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setEntries(newEntries);
    saveEntries(newEntries);
    
    // Clear form
    setDate('');
    setAmount('');

    // Log AI action
    logAIAction('Revenue Entry Added', `Added revenue entry: ₹${revenueAmount.toLocaleString('en-IN')} for ${newEntry.month} ${newEntry.year}`);
  };

  const handleDelete = (id: string) => {
    const newEntries = entries.filter(e => e.id !== id);
    setEntries(newEntries);
    saveEntries(newEntries);
    
    // Log AI action
    logAIAction('Revenue Entry Deleted', `Deleted revenue entry: ${id}`);
  };

  const logAIAction = (action: string, description: string) => {
    if (typeof window !== 'undefined') {
      const logs = JSON.parse(localStorage.getItem('aiActionLogs') || '[]');
      logs.push({
        id: Date.now().toString(),
        action,
        description,
        timestamp: new Date().toISOString(),
      });
      // Keep last 100 logs
      localStorage.setItem('aiActionLogs', JSON.stringify(logs.slice(-100)));
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        💰 Revenue Input
      </h2>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="revenueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date / Month *
            </label>
            <input
              type="date"
              id="revenueDate"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="revenueAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Revenue Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">₹</span>
              <input
                type="number"
                id="revenueAmount"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                required
                className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full md:w-auto px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
        >
          ➕ Add Revenue Entry
        </button>
      </form>

      {/* Revenue Entries Table */}
      {entries.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-4 py-2 text-left text-gray-900 dark:text-white">Date</th>
                <th className="px-4 py-2 text-left text-gray-900 dark:text-white">Month/Year</th>
                <th className="px-4 py-2 text-right text-gray-900 dark:text-white">Amount</th>
                <th className="px-4 py-2 text-left text-gray-900 dark:text-white">Added</th>
                <th className="px-4 py-2 text-center text-gray-900 dark:text-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                    {new Date(entry.date).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                    {entry.month} {entry.year}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(entry.amount)}
                  </td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                    {entry.timestamp.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-blue-50 dark:bg-blue-900/20 font-bold">
                <td colSpan={2} className="px-4 py-2 text-gray-900 dark:text-white">
                  Total Revenue
                </td>
                <td className="px-4 py-2 text-right text-blue-900 dark:text-blue-300">
                  {formatCurrency(entries.reduce((sum, e) => sum + e.amount, 0))}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No revenue entries yet. Add your first entry above!</p>
        </div>
      )}
    </div>
  );
}
