'use client';

import React, { useState, useEffect } from 'react';
import { generateOutreachMessage } from '@/services/aiServices';

interface ShopData {
  shopName: string;
  businessType: string;
  daysAvailable: string[];
  monthlyBudget: number;
  numberOfWorkers: number;
  processes: string[];
}

interface AIOutreachProps {
  shopData: ShopData;
}

interface OutreachCampaign {
  id: string;
  recipientType: 'customer' | 'influencer' | 'partner' | 'local-business';
  subject: string;
  message: string;
  channel: 'email' | 'dm' | 'comment' | 'post';
  timing: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  recipientInfo?: string;
}

export default function AIOutreach({ shopData }: AIOutreachProps) {
  const [selectedRecipientType, setSelectedRecipientType] = useState<'customer' | 'influencer' | 'partner' | 'local-business'>('customer');
  const [customContext, setCustomContext] = useState('');
  const [campaigns, setCampaigns] = useState<OutreachCampaign[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoOutreachEnabled, setAutoOutreachEnabled] = useState(false);

  const recipientTypes = [
    { value: 'customer', label: 'Customers', icon: '👥', description: 'Reach out to past customers' },
    { value: 'influencer', label: 'Influencers', icon: '📸', description: 'Collaboration opportunities' },
    { value: 'partner', label: 'Partners', icon: '🤝', description: 'Business partnerships' },
    { value: 'local-business', label: 'Local Businesses', icon: '🏢', description: 'Cross-promotion' },
  ];

  // Auto-outreach logic
  useEffect(() => {
    if (!autoOutreachEnabled) return;

    const runAutoOutreach = async () => {
      // In production, this would:
      // 1. Fetch customer/influencer/partner lists
      // 2. Generate personalized messages for each
      // 3. Schedule sending at optimal times
      // 4. Track responses

      console.log('Auto-outreach running...');
    };

    const interval = setInterval(runAutoOutreach, 60 * 60 * 1000); // Every hour
    runAutoOutreach();

    return () => clearInterval(interval);
  }, [autoOutreachEnabled, shopData]);

  const handleGenerateOutreach = async () => {
    setIsGenerating(true);
    try {
      const result = await generateOutreachMessage(selectedRecipientType, shopData, customContext);
      
      const newCampaign: OutreachCampaign = {
        id: `outreach_${Date.now()}`,
        recipientType: selectedRecipientType,
        subject: result.subject,
        message: result.message,
        channel: result.channel,
        timing: result.timing,
        status: 'draft',
      };

      setCampaigns([...campaigns, newCampaign]);
      setCustomContext('');
    } catch (error) {
      console.error('Error generating outreach:', error);
      alert('Failed to generate outreach message. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendOutreach = async (campaign: OutreachCampaign) => {
    // In production, this would actually send via the specified channel
    try {
      // Simulate sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCampaigns(campaigns.map(c => 
        c.id === campaign.id ? { ...c, status: 'sent' } : c
      ));
      
      alert(`Outreach sent via ${campaign.channel}!`);
    } catch (error) {
      setCampaigns(campaigns.map(c => 
        c.id === campaign.id ? { ...c, status: 'failed' } : c
      ));
      alert('Failed to send outreach. Please check your API connections.');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        📧 AI Outreach Automation
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        AI automatically reaches out to customers, influencers, partners, and local businesses. No more manual outreach - AI handles it based on your shop's specific data!
      </p>

      <div className="space-y-4">
        {/* Auto-outreach toggle */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="text-sm font-semibold text-green-900 dark:text-green-300">
                Enable Auto-Outreach
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                AI will automatically reach out based on optimal timing and shop data
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoOutreachEnabled}
              onChange={(e) => setAutoOutreachEnabled(e.target.checked)}
              className="w-5 h-5"
            />
          </div>
        </div>

        {/* Manual outreach generation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recipient Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {recipientTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setSelectedRecipientType(type.value as any)}
                className={`px-4 py-3 rounded-lg font-medium text-xs transition-colors ${
                  selectedRecipientType === type.value
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <span className="block text-2xl mb-1">{type.icon}</span>
                <span className="font-semibold">{type.label}</span>
                <span className="block text-xs mt-1 opacity-75">{type.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Custom Context (Optional)
          </label>
          <textarea
            value={customContext}
            onChange={(e) => setCustomContext(e.target.value)}
            placeholder="e.g., Special event, collaboration idea, etc."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <button
          onClick={handleGenerateOutreach}
          disabled={isGenerating}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating Message...' : '✨ Generate Outreach Message'}
        </button>

        {/* Outreach Campaigns */}
        {campaigns.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Outreach Campaigns ({campaigns.length})
            </h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {recipientTypes.find(t => t.value === campaign.recipientType)?.icon}
                      </span>
                      <div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {recipientTypes.find(t => t.value === campaign.recipientType)?.label}
                        </span>
                        <span className="ml-2 text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {campaign.channel}
                        </span>
                        <span className={`ml-2 text-xs px-2 py-1 rounded ${
                          campaign.status === 'sent' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          campaign.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                    </div>
                    {campaign.status === 'draft' && (
                      <button
                        onClick={() => handleSendOutreach(campaign)}
                        className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors"
                      >
                        Send Now
                      </button>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Subject: {campaign.subject}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {campaign.message.substring(0, 200)}...
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Optimal timing: {campaign.timing}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
