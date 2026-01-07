'use client';

import React, { useState } from 'react';
import { generateSleeveArtPrompt } from '@/services/aiServices';

interface ShopData {
  shopName: string;
  businessType: string;
  daysAvailable: string[];
  monthlyBudget: number;
  numberOfWorkers: number;
  processes: string[];
}

interface AISleeveArtProps {
  shopData: ShopData;
}

export default function AISleeveArt({ shopData }: AISleeveArtProps) {
  const [userPrompt, setUserPrompt] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const examplePrompts = [
    'A neon cat in space',
    'Abstract geometric patterns',
    'Vintage coffee cup design',
    'Minimalist mountain landscape',
    'Cyberpunk cityscape',
  ];

  const handleGenerate = async () => {
    if (!userPrompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = await generateSleeveArtPrompt(userPrompt, shopData);
      setGeneratedPrompt(prompt);
    } catch (error) {
      console.error('Error generating prompt:', error);
      alert('Failed to generate art prompt. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        🎨 AI-Generated Sleeve Art
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Customers type a prompt, AI creates unique art instantly. Print it on a sticker for their coffee sleeve - every cup becomes Instagram-worthy!
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Art Prompt
          </label>
          <input
            type="text"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="e.g., A neon cat in space"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Example prompts: {examplePrompts.join(', ')}
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !userPrompt.trim()}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating Art Prompt...' : '✨ Generate Art'}
        </button>

        {generatedPrompt && (
          <div className="mt-4">
            <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
              <p className="text-sm font-semibold text-pink-800 dark:text-pink-300 mb-2">
                Enhanced Art Prompt (for AI Image Generator):
              </p>
              <p className="text-sm text-gray-800 dark:text-gray-200 mb-4">
                {generatedPrompt}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 italic mb-4">
                💡 Use this prompt with DALL-E, Midjourney, or Stable Diffusion to generate the actual image.
                Then print it on a sticker for the coffee sleeve.
              </p>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-2">
                  🖼️ Sleeve Art Preview
                </p>
                <div className="w-full h-32 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded flex items-center justify-center">
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    (Generated image would appear here)
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  // In production, this would trigger printing
                  alert('Print functionality would be implemented here');
                }}
                className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                🖨️ Print Sticker
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
