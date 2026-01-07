'use client';

import React, { useState } from 'react';
import { generateFlavorProfile } from '@/services/aiServices';

interface ShopData {
  shopName: string;
  businessType: string;
  daysAvailable: string[];
  monthlyBudget: number;
  numberOfWorkers: number;
  processes: string[];
}

interface AIFlavorProfilerProps {
  shopData: ShopData;
}

export default function AIFlavorProfiler({ shopData }: AIFlavorProfilerProps) {
  const [answers, setAnswers] = useState({
    season: '',
    mood: '',
    preference: '',
  });
  const [recommendation, setRecommendation] = useState<{
    recommendedDrink: string;
    description: string;
    reasoning: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
  const moods = ['Energetic', 'Relaxed', 'Focused', 'Cozy', 'Adventurous', 'Nostalgic'];
  const preferences = ['Sweet', 'Bold', 'Smooth', 'Fruity', 'Earthy', 'Spicy', 'Creamy', 'Light'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!answers.season || !answers.mood || !answers.preference) {
      alert('Please answer all questions');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateFlavorProfile(answers, shopData);
      setRecommendation(result);
    } catch (error) {
      console.error('Error generating recommendation:', error);
      alert('Failed to generate recommendation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        🎯 AI Flavor Profiler Quiz
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Answer 3 simple questions and AI predicts your perfect custom drink blend. Turn ordering into a personalized game!
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            1. What's your favorite season?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {seasons.map((season) => (
              <button
                key={season}
                type="button"
                onClick={() => setAnswers({ ...answers, season })}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  answers.season === season
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {season}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            2. Current mood?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {moods.map((mood) => (
              <button
                key={mood}
                type="button"
                onClick={() => setAnswers({ ...answers, mood })}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  answers.mood === mood
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            3. Flavor preference?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {preferences.map((pref) => (
              <button
                key={pref}
                type="button"
                onClick={() => setAnswers({ ...answers, preference: pref })}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  answers.preference === pref
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {pref}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating || !answers.season || !answers.mood || !answers.preference}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Analyzing Your Profile...' : '✨ Get My Perfect Drink'}
        </button>
      </form>

      {recommendation && (
        <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-2">
            🎉 Your Perfect Match!
          </h4>
          <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {recommendation.recommendedDrink}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            {recommendation.description}
          </p>
          <div className="bg-white dark:bg-gray-800 rounded p-3">
            <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
              Why this recommendation?
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              {recommendation.reasoning}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
