'use client';

import React, { useState } from 'react';

interface ShopData {
  shopName?: string;
  businessType?: string;
  daysAvailable?: string[];
  monthlyBudget?: number;
  numberOfWorkers?: number;
  processes?: string[];
}

interface BeveragePersonalizationAssistantProps {
  shopData?: ShopData;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  category: 'energy' | 'taste' | 'lifestyle' | 'social' | 'mood';
}

interface PersonalityTraits {
  traits: string[];
  explanation: string;
}

interface CustomDrink {
  name: string;
  ingredients: string[];
  ingredientReasons: { ingredient: string; reason: string }[];
  flavorProfile: string;
  bestTime: string;
  personalMessage: string;
}

const QUESTIONS: Question[] = [
  {
    id: 'energy',
    question: 'How would you describe your energy level right now?',
    options: ['Calm and relaxed', 'Moderately energetic', 'Very energetic and active', 'Tired, need a boost'],
    category: 'energy',
  },
  {
    id: 'taste',
    question: 'What taste profile appeals to you most?',
    options: ['Sweet and comforting', 'Bitter and bold', 'Balanced and smooth', 'Experimental and unique'],
    category: 'taste',
  },
  {
    id: 'lifestyle',
    question: 'Which best describes your current lifestyle?',
    options: ['Relaxed and laid-back', 'Busy and fast-paced', 'Creative and artistic', 'Disciplined and structured'],
    category: 'lifestyle',
  },
  {
    id: 'social',
    question: 'How do you prefer to enjoy your beverages?',
    options: ['Alone, quiet moment', 'With close friends', 'In a social group', 'Either way works'],
    category: 'social',
  },
  {
    id: 'mood',
    question: 'What are you looking for in this drink?',
    options: ['Relaxation and comfort', 'Focus and clarity', 'Refreshment and energy', 'Something new to explore'],
    category: 'mood',
  },
  {
    id: 'time',
    question: 'What time of day is it for you?',
    options: ['Morning (start of day)', 'Afternoon (midday)', 'Evening (winding down)', 'Late night'],
    category: 'mood',
  },
  {
    id: 'temperature',
    question: 'Do you prefer your drinks hot or cold?',
    options: ['Hot and warming', 'Cold and refreshing', 'Room temperature', 'Either works'],
    category: 'taste',
  },
];

export default function BeveragePersonalizationAssistant({ shopData }: BeveragePersonalizationAssistantProps = {}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [personality, setPersonality] = useState<PersonalityTraits | null>(null);
  const [customDrink, setCustomDrink] = useState<CustomDrink | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleAnswer = (questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, generate recommendation
      generateRecommendation(newAnswers);
    }
  };

  const generateRecommendation = (allAnswers: Record<string, string>) => {
    // Infer personality traits
    const traits = inferPersonality(allAnswers);
    setPersonality(traits);

    // Create custom drink
    const drink = createCustomDrink(allAnswers, traits);
    setCustomDrink(drink);
    setIsComplete(true);
  };

  const inferPersonality = (answers: Record<string, string>): PersonalityTraits => {
    const traits: string[] = [];
    let explanation = 'Based on your responses, ';

    // Analyze energy level
    const energy = answers['energy'];
    if (energy?.includes('Calm')) {
      traits.push('calm thinker');
      explanation += 'you prefer a peaceful, mindful approach. ';
    } else if (energy?.includes('Very energetic')) {
      traits.push('energetic explorer');
      explanation += 'you have high energy and love adventure. ';
    } else if (energy?.includes('Tired')) {
      traits.push('comfort-seeker');
      explanation += 'you\'re looking for something to restore and comfort you. ';
    }

    // Analyze lifestyle
    const lifestyle = answers['lifestyle'];
    if (lifestyle?.includes('Creative')) {
      traits.push('creative soul');
      explanation += 'Your creative nature suggests you appreciate unique, artistic experiences. ';
    } else if (lifestyle?.includes('Disciplined')) {
      traits.push('focused achiever');
      explanation += 'Your structured approach shows you value purpose and clarity. ';
    } else if (lifestyle?.includes('Relaxed')) {
      if (!traits.includes('calm thinker')) {
        traits.push('relaxed soul');
      }
      explanation += 'You enjoy taking things at your own pace. ';
    }

    // Analyze mood/intention
    const mood = answers['mood'];
    if (mood?.includes('Focus')) {
      traits.push('focused achiever');
      explanation += 'You\'re seeking mental clarity and productivity. ';
    } else if (mood?.includes('Relaxation')) {
      if (!traits.some(t => t.includes('calm') || t.includes('relaxed'))) {
        traits.push('comfort-seeker');
      }
      explanation += 'You want to unwind and find peace. ';
    } else if (mood?.includes('Refreshment')) {
      traits.push('energetic explorer');
      explanation += 'You\'re looking for a revitalizing experience. ';
    }

    // Remove duplicates and limit to 2-3
    const uniqueTraits = Array.from(new Set(traits)).slice(0, 3);
    explanation += 'These traits guide our drink recommendation for you.';

    return {
      traits: uniqueTraits,
      explanation,
    };
  };

  const createCustomDrink = (
    answers: Record<string, string>,
    personality: PersonalityTraits
  ): CustomDrink => {
    const energy = answers['energy'];
    const taste = answers['taste'];
    const lifestyle = answers['lifestyle'];
    const mood = answers['mood'];
    const time = answers['time'];
    const temperature = answers['temperature'];

    // Determine base drink type
    let baseDrink = 'coffee';
    let drinkName = '';
    let ingredients: string[] = [];
    let ingredientReasons: { ingredient: string; reason: string }[] = [];
    let flavorProfile = '';
    let bestTime = '';

    // Name generation based on personality
    if (personality.traits.includes('calm thinker')) {
      drinkName = 'The Mindful Moment';
      baseDrink = 'tea';
    } else if (personality.traits.includes('energetic explorer')) {
      drinkName = 'The Adventure Boost';
      baseDrink = 'coffee';
    } else if (personality.traits.includes('creative soul')) {
      drinkName = 'The Artist\'s Muse';
      baseDrink = 'specialty';
    } else if (personality.traits.includes('focused achiever')) {
      drinkName = 'The Clarity Catalyst';
      baseDrink = 'coffee';
    } else if (personality.traits.includes('comfort-seeker')) {
      drinkName = 'The Cozy Embrace';
      baseDrink = 'tea';
    } else {
      drinkName = 'The Perfect Match';
      baseDrink = 'coffee';
    }

    // Build ingredients based on preferences
    if (baseDrink === 'coffee') {
      if (taste?.includes('Sweet')) {
        ingredients.push('Espresso shot', 'Steamed whole milk', 'Vanilla syrup', 'Caramel drizzle');
        ingredientReasons.push(
          { ingredient: 'Espresso shot', reason: 'Provides the energy boost you need' },
          { ingredient: 'Steamed whole milk', reason: 'Adds creamy comfort to match your sweet preference' },
          { ingredient: 'Vanilla syrup', reason: 'Brings warmth and sweetness you\'re seeking' },
          { ingredient: 'Caramel drizzle', reason: 'Adds an extra layer of indulgence' }
        );
        flavorProfile = 'Sweet and creamy with a smooth, comforting finish';
      } else if (taste?.includes('Bitter')) {
        ingredients.push('Double espresso', 'Dark chocolate shavings', 'A hint of cinnamon');
        ingredientReasons.push(
          { ingredient: 'Double espresso', reason: 'Bold and strong, matching your preference for intensity' },
          { ingredient: 'Dark chocolate shavings', reason: 'Adds depth and richness without overwhelming sweetness' },
          { ingredient: 'A hint of cinnamon', reason: 'Provides subtle warmth and complexity' }
        );
        flavorProfile = 'Bold and rich with a sophisticated bitter edge';
      } else if (taste?.includes('Balanced')) {
        ingredients.push('Single origin espresso', 'Oat milk', 'Honey', 'Cardamom');
        ingredientReasons.push(
          { ingredient: 'Single origin espresso', reason: 'Smooth and balanced, not too intense' },
          { ingredient: 'Oat milk', reason: 'Creamy texture without heaviness' },
          { ingredient: 'Honey', reason: 'Natural sweetness that complements, not overpowers' },
          { ingredient: 'Cardamom', reason: 'Adds aromatic complexity and warmth' }
        );
        flavorProfile = 'Perfectly balanced - smooth, creamy, with subtle sweetness';
      } else {
        ingredients.push('Cold brew concentrate', 'Coconut milk', 'Lavender syrup', 'Edible flowers');
        ingredientReasons.push(
          { ingredient: 'Cold brew concentrate', reason: 'Smooth and less acidic, perfect for experimentation' },
          { ingredient: 'Coconut milk', reason: 'Unique creamy base with tropical notes' },
          { ingredient: 'Lavender syrup', reason: 'Adds floral, aromatic complexity' },
          { ingredient: 'Edible flowers', reason: 'Makes it visually stunning and unique' }
        );
        flavorProfile = 'Unique and experimental with floral and tropical notes';
      }
    } else if (baseDrink === 'tea') {
      if (taste?.includes('Sweet')) {
        ingredients.push('Chamomile tea base', 'Honey', 'Lavender', 'Vanilla extract');
        ingredientReasons.push(
          { ingredient: 'Chamomile tea base', reason: 'Calming and soothing, perfect for relaxation' },
          { ingredient: 'Honey', reason: 'Natural sweetness that comforts and warms' },
          { ingredient: 'Lavender', reason: 'Promotes calm and adds floral notes' },
          { ingredient: 'Vanilla extract', reason: 'Adds creamy, comforting warmth' }
        );
        flavorProfile = 'Sweet, floral, and deeply comforting';
      } else {
        ingredients.push('Green tea base', 'Ginger', 'Lemon', 'Mint leaves');
        ingredientReasons.push(
          { ingredient: 'Green tea base', reason: 'Light and refreshing, provides gentle energy' },
          { ingredient: 'Ginger', reason: 'Adds warmth and subtle spice' },
          { ingredient: 'Lemon', reason: 'Bright and refreshing, lifts the mood' },
          { ingredient: 'Mint leaves', reason: 'Cooling and invigorating' }
        );
        flavorProfile = 'Refreshing and balanced with citrus and herbal notes';
      }
    } else {
      // Specialty drink
      ingredients.push('Matcha base', 'Almond milk', 'Rose syrup', 'Pistachio crumble');
      ingredientReasons.push(
        { ingredient: 'Matcha base', reason: 'Smooth, earthy, and provides sustained energy' },
        { ingredient: 'Almond milk', reason: 'Light and nutty, complements the matcha' },
        { ingredient: 'Rose syrup', reason: 'Adds elegant floral sweetness' },
        { ingredient: 'Pistachio crumble', reason: 'Adds texture and nutty richness' }
      );
      flavorProfile = 'Elegant and unique with floral, nutty, and earthy notes';
    }

    // Determine best time
    if (time?.includes('Morning')) {
      bestTime = 'Perfect for starting your day with intention';
    } else if (time?.includes('Afternoon')) {
      bestTime = 'Ideal for a midday pick-me-up';
    } else if (time?.includes('Evening')) {
      bestTime = 'Great for winding down and reflecting';
    } else {
      bestTime = 'Perfect for a late-night moment of peace';
    }

    // Temperature adjustment
    if (temperature?.includes('Hot')) {
      ingredients.push('(Served hot)');
    } else if (temperature?.includes('Cold')) {
      ingredients.push('(Served over ice)');
    }

    // Personal message
    const personalMessage = `Based on your personality, we've created "${drinkName}" just for you. This drink reflects your ${personality.traits.join(' and ')} nature, designed to match your current mood and preferences. Each ingredient was chosen to create a moment that feels uniquely yours.`;

    return {
      name: drinkName,
      ingredients,
      ingredientReasons,
      flavorProfile,
      bestTime,
      personalMessage,
    };
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setPersonality(null);
    setCustomDrink(null);
    setIsComplete(false);
  };

  if (isComplete && personality && customDrink) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ✨ Your Personalized Drink Recommendation
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            We've crafted something special just for you
          </p>
        </div>

        {/* Personality Traits */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 mb-6 border border-purple-200 dark:border-purple-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            🎭 Your Personality Profile
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {personality.traits.map((trait, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium"
              >
                {trait}
              </span>
            ))}
          </div>
          <p className="text-gray-700 dark:text-gray-300 italic">
            {personality.explanation}
          </p>
        </div>

        {/* Custom Drink */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-6 mb-6 border border-amber-200 dark:border-amber-800">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🍹 {customDrink.name}
          </h3>

          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 italic">
            {customDrink.personalMessage}
          </p>

          {/* Ingredients */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              📋 Ingredients:
            </h4>
            <ul className="space-y-2">
              {customDrink.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-amber-600 dark:text-amber-400 mr-2">•</span>
                  <span className="text-gray-700 dark:text-gray-300">{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Why Each Ingredient */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              💡 Why These Ingredients?
            </h4>
            <div className="space-y-3">
              {customDrink.ingredientReasons.map((item, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-amber-200 dark:border-amber-800"
                >
                  <p className="font-medium text-gray-900 dark:text-white mb-1">
                    {item.ingredient}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Flavor Profile */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              👅 Flavor Profile:
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              {customDrink.flavorProfile}
            </p>
          </div>

          {/* Best Time */}
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ⏰ Best Time to Enjoy:
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              {customDrink.bestTime}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
          >
            🔄 Create Another Drink
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🎯 Beverage Personalization Assistant
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Let's discover your perfect drink match!
        </p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / QUESTIONS.length) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Question {currentQuestionIndex + 1} of {QUESTIONS.length}
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 mb-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(currentQuestion.id, option)}
              className="w-full text-left px-4 py-3 bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors text-gray-900 dark:text-white"
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>✨ Your answers help us understand you better</p>
      </div>
    </div>
  );
}
