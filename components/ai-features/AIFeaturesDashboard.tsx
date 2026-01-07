'use client';

import React, { useState } from 'react';
import AIPoetryReceipt from './AIPoetryReceipt';
import LiveAIWindowArt from './LiveAIWindowArt';
import AIGuestbook from './AIGuestbook';
import AIFlavorProfiler from './AIFlavorProfiler';
import AISleeveArt from './AISleeveArt';
import DigitalBarista from './DigitalBarista';
import SmartDynamicPricing from './SmartDynamicPricing';
import InstagramAutoPoster from './InstagramAutoPoster';
import AIOutreach from './AIOutreach';
import MysteryDrink from './MysteryDrink';
import SmellToImage from './SmellToImage';
import BeveragePersonalizationAssistant from './BeveragePersonalizationAssistant';

interface ShopData {
  shopName: string;
  businessType: string;
  daysAvailable: string[];
  monthlyBudget: number;
  numberOfWorkers: number;
  processes: string[];
}

interface AIFeaturesDashboardProps {
  shopData: ShopData;
}

export default function AIFeaturesDashboard({ shopData }: AIFeaturesDashboardProps) {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const features = [
    { id: 'poetry-receipt', name: 'AI Poetry Receipt', icon: '📝', component: AIPoetryReceipt },
    { id: 'window-art', name: 'Live AI Window Art', icon: '🎨', component: LiveAIWindowArt },
    { id: 'guestbook', name: 'AI Guestbook', icon: '🎤', component: AIGuestbook },
    { id: 'mystery-drink', name: 'Mystery Drink', icon: '🎲', component: MysteryDrink },
    { id: 'smell-image', name: 'Smell-to-Image', icon: '👃', component: SmellToImage },
    { id: 'flavor-profiler', name: 'Flavor Profiler Quiz', icon: '🎯', component: AIFlavorProfiler },
    { id: 'sleeve-art', name: 'AI Sleeve Art', icon: '🎨', component: AISleeveArt },
    { id: 'digital-barista', name: 'Digital Barista', icon: '🤖', component: DigitalBarista },
    { id: 'dynamic-pricing', name: 'Smart Dynamic Pricing', icon: '💰', component: SmartDynamicPricing },
    { id: 'instagram', name: 'Instagram Auto-Poster', icon: '📱', component: InstagramAutoPoster },
    { id: 'outreach', name: 'AI Outreach', icon: '📧', component: AIOutreach },
    { id: 'beverage-personalization', name: 'Beverage Personalization', icon: '🎯', component: BeveragePersonalizationAssistant },
  ];

  const ActiveComponent = activeFeature 
    ? features.find(f => f.id === activeFeature)?.component 
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🤖 AI Features Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          All AI features are customized specifically for <strong>{shopData.shopName}</strong> - 
          a {shopData.businessType} open {shopData.daysAvailable.join(', ')} with {shopData.numberOfWorkers} team members.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Budget: ${shopData.monthlyBudget}/month | Processes: {shopData.processes.join(', ')}
        </p>
      </div>

      {!activeFeature ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setActiveFeature(feature.id)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow text-left group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {feature.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click to open →
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setActiveFeature(null)}
            className="mb-4 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
          >
            ← Back to Features
          </button>
          {ActiveComponent && (
            <ActiveComponent shopData={shopData} />
          )}
        </div>
      )}
    </div>
  );
}
