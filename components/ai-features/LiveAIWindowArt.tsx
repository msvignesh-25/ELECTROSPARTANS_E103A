'use client';

import React, { useState, useEffect } from 'react';
import { generateWindowArtPrompt } from '@/services/aiServices';

interface ShopData {
  shopName: string;
  businessType: string;
  daysAvailable: string[];
  monthlyBudget: number;
  numberOfWorkers: number;
  processes: string[];
}

interface LiveAIWindowArtProps {
  shopData: ShopData;
}

export default function LiveAIWindowArt({ shopData }: LiveAIWindowArtProps) {
  const [currentArtPrompt, setCurrentArtPrompt] = useState('');
  const [weather, setWeather] = useState<string>('');
  const [trendingTopic, setTrendingTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(60); // minutes

  // Fetch weather (mock for now)
  useEffect(() => {
    // In production, this would fetch real weather data
    const weatherConditions = ['sunny', 'rainy', 'cloudy', 'snowy', 'windy'];
    setWeather(weatherConditions[Math.floor(Math.random() * weatherConditions.length)]);
  }, []);

  // Auto-update art every hour
  useEffect(() => {
    const generateArt = async () => {
      setIsGenerating(true);
      try {
        const prompt = await generateWindowArtPrompt(shopData, weather, trendingTopic);
        setCurrentArtPrompt(prompt);
      } catch (error) {
        console.error('Error generating art:', error);
      } finally {
        setIsGenerating(false);
      }
    };

    generateArt();
    const interval = setInterval(generateArt, updateInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [shopData, weather, trendingTopic, updateInterval]);

  const handleManualUpdate = async () => {
    setIsGenerating(true);
    try {
      const prompt = await generateWindowArtPrompt(shopData, weather, trendingTopic);
      setCurrentArtPrompt(prompt);
    } catch (error) {
      console.error('Error generating art:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        🎨 Live AI Window Art
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Dynamic digital art that changes based on weather, trends, and your shop's unique data. Makes your storefront a dynamic landmark!
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Weather
            </label>
            <input
              type="text"
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              placeholder="e.g., sunny, rainy, snowy"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trending Topic (Optional)
            </label>
            <input
              type="text"
              value={trendingTopic}
              onChange={(e) => setTrendingTopic(e.target.value)}
              placeholder="e.g., local festival, community event"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Update Interval (minutes)
          </label>
          <input
            type="number"
            value={updateInterval}
            onChange={(e) => setUpdateInterval(parseInt(e.target.value) || 60)}
            min="15"
            max="1440"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <button
          onClick={handleManualUpdate}
          disabled={isGenerating}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating Art...' : '🔄 Update Art Now'}
        </button>

        {currentArtPrompt && (
          <div className="mt-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <p className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-2">
                Current Art Prompt (for AI Image Generator):
              </p>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                {currentArtPrompt}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">
                💡 Use this prompt with DALL-E, Midjourney, or Stable Diffusion to generate the actual image.
                Display it on a monitor or projector in your front window.
              </p>
            </div>

            <div className="mt-4 bg-gray-100 dark:bg-gray-900 rounded-lg p-4 border-2 border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                🖼️ Window Display Preview
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-2">
                (In production, this would show the generated image)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
