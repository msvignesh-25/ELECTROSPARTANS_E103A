'use client';

import React, { useState } from 'react';
import { generateBaristaVideoScript } from '@/services/aiServices';

interface ShopData {
  shopName: string;
  businessType: string;
  daysAvailable: string[];
  monthlyBudget: number;
  numberOfWorkers: number;
  processes: string[];
}

interface DigitalBaristaProps {
  shopData: ShopData;
}

export default function DigitalBarista({ shopData }: DigitalBaristaProps) {
  const [selectedTopic, setSelectedTopic] = useState<'bean-origin' | 'daily-horoscope' | 'coffee-tip' | 'shop-story'>('daily-horoscope');
  const [script, setScript] = useState<{
    script: string;
    duration: number;
    visualPrompts: string[];
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const topics = [
    { value: 'bean-origin', label: 'Bean Origin Story', icon: '🌱' },
    { value: 'daily-horoscope', label: 'Daily Coffee Horoscope', icon: '🔮' },
    { value: 'coffee-tip', label: 'Coffee Tip', icon: '💡' },
    { value: 'shop-story', label: 'Shop Story', icon: '📖' },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateBaristaVideoScript(selectedTopic, shopData);
      setScript(result);
    } catch (error) {
      console.error('Error generating script:', error);
      alert('Failed to generate script. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        🤖 Digital Barista Lore
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Create AI-powered video content for social media. Your digital barista explains secrets, gives tips, and shares your shop's story!
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Video Topic
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {topics.map((topic) => (
              <button
                key={topic.value}
                type="button"
                onClick={() => setSelectedTopic(topic.value as any)}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  selectedTopic === topic.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <span className="block text-2xl mb-1">{topic.icon}</span>
                <span className="text-xs">{topic.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating Script...' : '🎬 Generate Video Script'}
        </button>

        {script && (
          <div className="mt-4">
            <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
              <div className="mb-4">
                <p className="text-sm font-semibold text-cyan-800 dark:text-cyan-300 mb-2">
                  Video Script ({script.duration} seconds):
                </p>
                <div className="bg-white dark:bg-gray-800 rounded p-3">
                  <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">
                    {script.script}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-cyan-800 dark:text-cyan-300 mb-2">
                  Visual Prompts:
                </p>
                <ul className="space-y-2">
                  {script.visualPrompts.map((prompt, idx) => (
                    <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded p-2">
                      • {prompt}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                💡 Use this script with AI video tools like HeyGen, Synthesia, or D-ID to create the actual video.
                Post it on your social media for engagement!
              </p>

              <button
                onClick={() => {
                  // In production, this would export the script or trigger video generation
                  navigator.clipboard.writeText(script.script);
                  alert('Script copied to clipboard!');
                }}
                className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                📋 Copy Script
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
