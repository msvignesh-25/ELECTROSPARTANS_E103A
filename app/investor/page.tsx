'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MetricsDashboard from '@/components/MetricsDashboard';
import MonthlyRevenueGraph from '@/components/MonthlyRevenueGraph';

interface BusinessStats {
  businessName: string;
  businessType: string;
  monthlyRevenue: number;
  growthRate: number;
  customerCount: number;
  averageOrderValue: number;
  monthlyExpenses: number;
  profitMargin: number;
  employeeCount: number;
  marketShare: string;
  customerRetentionRate: number;
  monthlyVisitors: number;
  conversionRate: number;
}

export default function InvestorPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [businesses, setBusinesses] = useState<BusinessStats[]>([]);
  const [showAddBusiness, setShowAddBusiness] = useState(false);
  const [newBusiness, setNewBusiness] = useState({
    businessName: '',
    businessType: '',
    monthlyRevenue: '',
    growthRate: '',
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login?role=investor');
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== 'investor') {
      router.push('/login?role=investor');
      return;
    }

    setUser(userData);
    loadBusinesses(userData.id);
  }, [router]);

  const loadBusinesses = async (userId: string) => {
    try {
      const res = await fetch(`/api/investor/businesses?userId=${userId}`);
      const data = await res.json();
      setBusinesses(data.businesses || []);
    } catch (error) {
      console.error('Error loading businesses:', error);
    }
  };

  const handleAddBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const businessData: BusinessStats = {
      businessName: newBusiness.businessName,
      businessType: newBusiness.businessType,
      monthlyRevenue: parseFloat(newBusiness.monthlyRevenue) || 0,
      growthRate: parseFloat(newBusiness.growthRate) || 0,
      customerCount: 0,
      averageOrderValue: 0,
      monthlyExpenses: 0,
      profitMargin: 0,
      employeeCount: 0,
      marketShare: '0%',
      customerRetentionRate: 0,
      monthlyVisitors: 0,
      conversionRate: 0,
    };

    try {
      const res = await fetch('/api/investor/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, business: businessData }),
      });

      const data = await res.json();
      if (data.success) {
        setBusinesses(data.businesses);
        setShowAddBusiness(false);
        setNewBusiness({ businessName: '', businessType: '', monthlyRevenue: '', growthRate: '' });
      }
    } catch (error) {
      console.error('Error adding business:', error);
    }
  };


  const selectedBusinessData = businesses.find((b) => b.businessName === selectedBusiness);

  const handleAIQuery = () => {
    if (!query.trim() || !selectedBusiness) return;

    setIsLoading(true);
    // Simulate AI processing
    setTimeout(() => {
      const business = selectedBusinessData!;
      let response = '';

      const lowerQuery = query.toLowerCase();

      if (lowerQuery.includes('revenue') || lowerQuery.includes('income') || lowerQuery.includes('sales')) {
        response = `Based on the data for ${business.businessName}:\n\n`;
        response += `• Monthly Revenue: ₹${business.monthlyRevenue.toLocaleString('en-IN')}\n`;
        response += `• Growth Rate: ${business.growthRate}% (excellent growth trajectory)\n`;
        response += `• Average Order Value: ₹${business.averageOrderValue.toLocaleString('en-IN')}\n`;
        response += `• Profit Margin: ${business.profitMargin}% (strong profitability)\n\n`;
        response += `The business shows healthy revenue growth with a ${business.growthRate}% increase, indicating strong market demand and effective business strategies.`;
      } else if (lowerQuery.includes('customer') || lowerQuery.includes('client')) {
        response = `Customer Analysis for ${business.businessName}:\n\n`;
        response += `• Total Customers: ${business.customerCount.toLocaleString()}\n`;
        response += `• Customer Retention Rate: ${business.customerRetentionRate}% (excellent)\n`;
        response += `• Monthly Visitors: ${business.monthlyVisitors.toLocaleString()}\n`;
        response += `• Conversion Rate: ${business.conversionRate}%\n\n`;
        response += `The business maintains a strong customer base with ${business.customerRetentionRate}% retention, showing excellent customer satisfaction and loyalty.`;
      } else if (lowerQuery.includes('profit') || lowerQuery.includes('margin') || lowerQuery.includes('expense')) {
        response = `Financial Performance for ${business.businessName}:\n\n`;
        response += `• Monthly Revenue: ₹${business.monthlyRevenue.toLocaleString('en-IN')}\n`;
        response += `• Monthly Expenses: ₹${business.monthlyExpenses.toLocaleString('en-IN')}\n`;
        response += `• Net Profit: ₹${(business.monthlyRevenue - business.monthlyExpenses).toLocaleString('en-IN')}\n`;
        response += `• Profit Margin: ${business.profitMargin}%\n\n`;
        response += `The business operates with a ${business.profitMargin}% profit margin, indicating efficient cost management and strong financial health.`;
      } else if (lowerQuery.includes('growth') || lowerQuery.includes('trend') || lowerQuery.includes('future')) {
        response = `Growth Analysis for ${business.businessName}:\n\n`;
        response += `• Current Growth Rate: ${business.growthRate}% (monthly)\n`;
        response += `• Market Share: ${business.marketShare}\n`;
        response += `• Customer Growth: ${business.customerCount} active customers\n`;
        response += `• Revenue Growth: ${business.growthRate}% monthly increase\n\n`;
        response += `The business demonstrates strong growth potential with a ${business.growthRate}% growth rate and ${business.marketShare} market share. This indicates scalability and market acceptance.`;
      } else if (lowerQuery.includes('risk') || lowerQuery.includes('concern') || lowerQuery.includes('challenge')) {
        response = `Risk Assessment for ${business.businessName}:\n\n`;
        response += `• Customer Retention: ${business.customerRetentionRate}% (low churn risk)\n`;
        response += `• Profit Margin: ${business.profitMargin}% (healthy buffer)\n`;
        response += `• Market Position: ${business.marketShare} market share\n`;
        response += `• Growth Stability: ${business.growthRate}% consistent growth\n\n`;
        response += `The business shows low risk indicators with strong retention, healthy margins, and consistent growth. However, monitor market competition and maintain customer satisfaction.`;
      } else {
        response = `Analysis for ${business.businessName}:\n\n`;
        response += `Based on the available data:\n`;
        response += `• Monthly Revenue: ₹${business.monthlyRevenue.toLocaleString('en-IN')}\n`;
        response += `• Growth Rate: ${business.growthRate}%\n`;
        response += `• Profit Margin: ${business.profitMargin}%\n`;
        response += `• Customers: ${business.customerCount.toLocaleString()}\n`;
        response += `• Market Share: ${business.marketShare}\n\n`;
        response += `The business shows strong performance metrics. For more specific insights, please ask about revenue, customers, profits, growth, or risks.`;
      }

      setAiResponse(response);
      setIsLoading(false);
    }, 1000);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Investor Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome, {user.name}! AI-powered business statistics and insights
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddBusiness(!showAddBusiness)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer z-10 relative"
          >
            {showAddBusiness ? 'Cancel' : '+ Add Business'}
          </button>
        </div>

        {showAddBusiness && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Add New Business
            </h2>
            <form onSubmit={handleAddBusiness} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newBusiness.businessName}
                    onChange={(e) => setNewBusiness({ ...newBusiness, businessName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter business name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Business Type
                  </label>
                  <select
                    required
                    value={newBusiness.businessType}
                    onChange={(e) => setNewBusiness({ ...newBusiness, businessType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select type</option>
                    <option value="bakery">Bakery</option>
                    <option value="repair shop (mobiles, laptops)">Repair Shop</option>
                    <option value="cool drinks">Cool Drinks</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monthly Revenue (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={newBusiness.monthlyRevenue}
                    onChange={(e) => setNewBusiness({ ...newBusiness, monthlyRevenue: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Growth Rate (%)
                  </label>
                  <input
                    type="number"
                    required
                    value={newBusiness.growthRate}
                    onChange={(e) => setNewBusiness({ ...newBusiness, growthRate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Add Business
              </button>
            </form>
          </div>
        )}

        {/* Shared Metrics Dashboard (Owner & Investor View) */}
        <div className="mb-8">
          <MetricsDashboard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Business Selection & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Select Business
              </h2>
              <select
                value={selectedBusiness}
                onChange={(e) => {
                  setSelectedBusiness(e.target.value);
                  setAiResponse('');
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Choose a business...</option>
                {businesses.map((business) => (
                  <option key={business.businessName} value={business.businessName}>
                    {business.businessName} - {business.businessType}
                  </option>
                ))}
              </select>
            </div>

            {/* Business Statistics */}
            {selectedBusinessData && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {selectedBusinessData.businessName} - Statistics
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                      ₹{selectedBusinessData.monthlyRevenue.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">Growth Rate</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                      {selectedBusinessData.growthRate}%
                    </p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Profit Margin</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                      {selectedBusinessData.profitMargin}%
                    </p>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Customers</p>
                    <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">
                      {selectedBusinessData.customerCount.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Avg Order Value</p>
                    <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-300">
                      ₹{selectedBusinessData.averageOrderValue.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg">
                    <p className="text-sm text-pink-600 dark:text-pink-400 font-medium">Retention Rate</p>
                    <p className="text-2xl font-bold text-pink-900 dark:text-pink-300">
                      {selectedBusinessData.customerRetentionRate}%
                    </p>
                  </div>

                  <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg">
                    <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">Monthly Expenses</p>
                    <p className="text-2xl font-bold text-teal-900 dark:text-teal-300">
                      ₹{selectedBusinessData.monthlyExpenses.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                    <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Market Share</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-300">
                      {selectedBusinessData.marketShare}
                    </p>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">Conversion Rate</p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-300">
                      {selectedBusinessData.conversionRate}%
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Additional Metrics</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Employees: </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedBusinessData.employeeCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Monthly Visitors: </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedBusinessData.monthlyVisitors.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Net Profit: </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ₹{(selectedBusinessData.monthlyRevenue - selectedBusinessData.monthlyExpenses).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Business Type: </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedBusinessData.businessType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Monthly Revenue Graph */}
            <div className="mt-8">
              <MonthlyRevenueGraph months={12} minimumThreshold={50000} />
            </div>
          </div>

          {/* AI Query Section */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🤖 AI Assistant
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Ask questions about business performance, risks, growth, or financial metrics.
              </p>

              <div className="space-y-4">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., What is the revenue growth? How are customers performing? What are the risks?"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  rows={4}
                  disabled={!selectedBusiness}
                />

                <button
                  onClick={handleAIQuery}
                  disabled={!query.trim() || !selectedBusiness || isLoading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Analyzing...' : 'Ask AI'}
                </button>

                {aiResponse && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">AI Analysis:</h3>
                    <pre className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap font-sans">
                      {aiResponse}
                    </pre>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Example Questions:</p>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• What is the revenue performance?</li>
                  <li>• How are customers performing?</li>
                  <li>• What are the profit margins?</li>
                  <li>• What is the growth potential?</li>
                  <li>• What are the investment risks?</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
