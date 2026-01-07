'use client';

import React, { useState } from 'react';
import { generateMysteryDrinkDescription } from '@/services/aiServices';

interface ShopData {
  shopName: string;
  businessType: string;
  daysAvailable: string[];
  monthlyBudget: number;
  numberOfWorkers: number;
  processes: string[];
}

interface MysteryDrinkProps {
  shopData: ShopData;
}

export default function MysteryDrink({ shopData }: MysteryDrinkProps) {
  const [ingredients, setIngredients] = useState('');
  const [mysteryDescription, setMysteryDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mysteryDrinks, setMysteryDrinks] = useState<Array<{
    id: string;
    ingredients: string[];
    description: string;
  }>>([]);

  const handleGenerate = async () => {
    if (!ingredients.trim()) {
      alert('Please enter ingredients');
      return;
    }

    const ingredientsList = ingredients.split(',').map(i => i.trim()).filter(i => i);

    setIsGenerating(true);
    try {
      const description = await generateMysteryDrinkDescription(ingredientsList, shopData);
      setMysteryDescription(description);
      
      const newDrink = {
        id: Date.now().toString(),
        ingredients: ingredientsList,
        description,
      };
      setMysteryDrinks([...mysteryDrinks, newDrink]);
      setIngredients('');
    } catch (error) {
      console.error('Error generating description:', error);
      alert('Failed to generate mystery description. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        🎲 AI-Powered "Blind Date with a Drink"
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Create mystery drinks with cryptic, intriguing descriptions. Gamifies your menu and encourages customers to try signature drinks!
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Actual Ingredients (comma-separated)
          </label>
          <input
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g., espresso, caramel, vanilla, oat milk"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter the actual ingredients. AI will create a mysterious description without naming them.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !ingredients.trim()}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Creating Mystery...' : '✨ Generate Mystery Description'}
        </button>

        {mysteryDescription && (
          <div className="mt-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">
              Mystery Drink Description:
            </p>
            <p className="text-gray-800 dark:text-gray-200 italic">
              "{mysteryDescription}"
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 italic">
              💡 Display this on your menu as a "Mystery Drink" - customers won't know the ingredients until they order!
            </p>
          </div>
        )}

        {/* Mystery Drinks Shelf */}
        {mysteryDrinks.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🍽️ Mystery Drinks Menu
            </h4>
            <div className="space-y-3">
              {mysteryDrinks.map((drink) => (
                <div
                  key={drink.id}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Mystery Drink #{drink.id.slice(-4)}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-2">
                    {drink.description}
                  </p>
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                      👁️ Reveal Ingredients (for staff only)
                    </summary>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      {drink.ingredients.join(', ')}
                    </p>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
