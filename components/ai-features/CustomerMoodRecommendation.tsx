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

interface CustomerMoodRecommendationProps {
  shopData?: ShopData;
}

interface CustomerAnswers {
  mood: string;
  energy: string;
  preference: string;
  occasion: string;
  comfort: string;
}

interface Recommendation {
  customerProfile: string;
  suggestedItems: Array<{
    item: string;
    reason: string;
    customization: string;
  }>;
  ownerMessage: string;
  customerMessage: string;
}

const QUESTIONS = [
  {
    id: 'mood',
    question: 'How are you feeling today?',
    options: [
      'Happy and energetic',
      'Calm and relaxed',
      'Tired or stressed',
      'Excited and adventurous',
      'Nostalgic and cozy',
    ],
  },
  {
    id: 'energy',
    question: 'What energy level do you need?',
    options: [
      'A big energy boost',
      'Steady, sustained energy',
      'Calming and soothing',
      'Light refreshment',
      'Comfort and warmth',
    ],
  },
  {
    id: 'preference',
    question: 'What taste appeals to you right now?',
    options: [
      'Sweet and indulgent',
      'Bold and strong',
      'Light and refreshing',
      'Warm and spicy',
      'Creamy and smooth',
    ],
  },
  {
    id: 'occasion',
    question: 'What brings you here today?',
    options: [
      'Quick pick-me-up',
      'Meeting with friends',
      'Working or studying',
      'Treating myself',
      'Trying something new',
    ],
  },
  {
    id: 'comfort',
    question: 'What would make you feel most comfortable?',
    options: [
      'Something familiar and reliable',
      'A new experience',
      'Something personalized',
      'A recommendation from the barista',
      'Something that matches my mood',
    ],
  },
];

export default function CustomerMoodRecommendation({ shopData }: CustomerMoodRecommendationProps = {}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<CustomerAnswers>({
    mood: '',
    energy: '',
    preference: '',
    occasion: '',
    comfort: '',
  });
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleAnswer = (questionId: keyof CustomerAnswers, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, generate recommendation
      generateRecommendation(newAnswers);
    }
  };

  const generateRecommendation = (allAnswers: CustomerAnswers) => {
    // Analyze customer profile
    const profile = analyzeCustomerProfile(allAnswers);
    
    // Generate suggested items
    const suggestedItems = generateSuggestedItems(allAnswers, profile);
    
    // Create owner message
    const ownerMessage = createOwnerMessage(allAnswers, profile, suggestedItems);
    
    // Create customer message
    const customerMessage = createCustomerMessage(profile, suggestedItems);

    setRecommendation({
      customerProfile: profile,
      suggestedItems,
      ownerMessage,
      customerMessage,
    });
    setIsComplete(true);

    // Send notification to owner (store in localStorage for owner to see)
    sendOwnerNotification(ownerMessage, suggestedItems);
  };

  const analyzeCustomerProfile = (answers: CustomerAnswers): string => {
    let profile = '';

    // Analyze mood
    if (answers.mood?.includes('Happy and energetic')) {
      profile = 'Energetic and upbeat customer';
    } else if (answers.mood?.includes('Calm and relaxed')) {
      profile = 'Calm and mindful customer';
    } else if (answers.mood?.includes('Tired or stressed')) {
      profile = 'Tired customer needing comfort';
    } else if (answers.mood?.includes('Excited and adventurous')) {
      profile = 'Adventurous customer open to new experiences';
    } else if (answers.mood?.includes('Nostalgic and cozy')) {
      profile = 'Nostalgic customer seeking comfort';
    }

    // Add energy level
    if (answers.energy?.includes('big energy boost')) {
      profile += ' - needs high energy';
    } else if (answers.energy?.includes('Calming')) {
      profile += ' - needs relaxation';
    } else if (answers.energy?.includes('Light refreshment')) {
      profile += ' - wants something light';
    }

    return profile;
  };

  const generateSuggestedItems = (
    answers: CustomerAnswers,
    profile: string
  ): Array<{ item: string; reason: string; customization: string }> => {
    const items: Array<{ item: string; reason: string; customization: string }> = [];

    // Primary recommendation based on mood and energy
    if (answers.mood?.includes('Tired or stressed') || answers.energy?.includes('Calming')) {
      items.push({
        item: 'Warm Herbal Tea Blend',
        reason: 'Customer is tired/stressed and needs calming comfort',
        customization: 'Add extra honey and a dash of cinnamon. Serve in a cozy mug with a warm smile.',
      });

      if (answers.preference?.includes('Sweet')) {
        items.push({
          item: 'Honey Lavender Latte',
          reason: 'Combines calming properties with sweet preference',
          customization: 'Extra honey, lavender syrup, steamed milk with foam art.',
        });
      }
    } else if (answers.mood?.includes('Happy and energetic') || answers.energy?.includes('big energy boost')) {
      items.push({
        item: 'Double Shot Espresso with Flavor',
        reason: 'Customer needs high energy boost',
        customization: answers.preference?.includes('Sweet')
          ? 'Add vanilla or caramel syrup. Top with whipped cream and drizzle.'
          : 'Keep it bold and strong. Add a hint of dark chocolate.',
      });

      if (answers.preference?.includes('Light and refreshing')) {
        items.push({
          item: 'Cold Brew with Citrus Twist',
          reason: 'Energetic customer wants refreshing option',
          customization: 'Add lemon or orange zest. Serve over ice with a citrus slice.',
        });
      }
    } else if (answers.mood?.includes('Calm and relaxed')) {
      items.push({
        item: 'Smooth Oat Milk Latte',
        reason: 'Calm customer prefers balanced, smooth experience',
        customization: answers.preference?.includes('Creamy')
          ? 'Extra creamy oat milk, light foam, sprinkle of nutmeg.'
          : 'Single shot for gentler caffeine, add cardamom for warmth.',
      });
    } else if (answers.mood?.includes('Excited and adventurous')) {
      items.push({
        item: 'Signature Mystery Blend',
        reason: 'Adventurous customer wants something unique',
        customization: 'Create a custom blend. Ask if they like floral, spicy, or fruity notes. Make it special!',
      });

      if (answers.preference?.includes('Warm and spicy')) {
        items.push({
          item: 'Spiced Chai with Custom Twist',
          reason: 'Adventurous customer with spicy preference',
          customization: 'Add unique spices - maybe cardamom, star anise, or a hint of ginger. Make it memorable!',
        });
      }
    } else if (answers.mood?.includes('Nostalgic and cozy')) {
      items.push({
        item: 'Classic Hot Chocolate',
        reason: 'Nostalgic customer wants comfort and familiarity',
        customization: 'Make it extra rich. Add marshmallows or whipped cream. Serve in a vintage-style mug.',
      });

      if (answers.preference?.includes('Warm and spicy')) {
        items.push({
          item: 'Spiced Hot Chocolate',
          reason: 'Nostalgic comfort with spicy warmth',
          customization: 'Add cinnamon, nutmeg, and a pinch of cayenne. Top with cinnamon stick.',
        });
      }
    }

    // Secondary recommendation based on occasion
    if (answers.occasion?.includes('Meeting with friends')) {
      items.push({
        item: 'Shareable Specialty Drink',
        reason: 'Customer is socializing - suggest something shareable',
        customization: 'Offer a larger size or a drink that pairs well with pastries. Make it social!',
      });
    } else if (answers.occasion?.includes('Working or studying')) {
      items.push({
        item: 'Focus-Enhancing Beverage',
        reason: 'Customer needs to focus - suggest sustained energy',
        customization: 'Lighter on sugar, steady caffeine. Maybe add a small snack suggestion for sustained focus.',
      });
    } else if (answers.occasion?.includes('Treating myself')) {
      items.push({
        item: 'Premium Indulgent Option',
        reason: 'Customer wants to treat themselves - go premium',
        customization: 'Suggest the most premium option. Add extra special touches - premium toppings, unique presentation.',
      });
    }

    // Ensure at least one recommendation
    if (items.length === 0) {
      items.push({
        item: 'Personalized Signature Drink',
        reason: 'Based on customer preferences, create something unique',
        customization: 'Ask the customer about their favorite flavors and create a custom drink just for them.',
      });
    }

    return items.slice(0, 3); // Return top 3 recommendations
  };

  const createOwnerMessage = (
    answers: CustomerAnswers,
    profile: string,
    items: Array<{ item: string; reason: string; customization: string }>
  ): string => {
    let message = `🎯 CUSTOMER MOOD-BASED RECOMMENDATION\n\n`;
    message += `Customer Profile: ${profile}\n\n`;
    message += `Customer Responses:\n`;
    message += `• Mood: ${answers.mood}\n`;
    message += `• Energy Need: ${answers.energy}\n`;
    message += `• Taste Preference: ${answers.preference}\n`;
    message += `• Occasion: ${answers.occasion}\n`;
    message += `• Comfort Level: ${answers.comfort}\n\n`;
    message += `📋 RECOMMENDED ITEMS FOR THIS CUSTOMER:\n\n`;

    items.forEach((item, index) => {
      message += `${index + 1}. ${item.item}\n`;
      message += `   Why: ${item.reason}\n`;
      message += `   Customization: ${item.customization}\n\n`;
    });

    message += `💡 TIP: Approach the customer warmly and offer these personalized suggestions. Make them feel special!`;

    return message;
  };

  const createCustomerMessage = (
    profile: string,
    items: Array<{ item: string; reason: string; customization: string }>
  ): string => {
    return `Based on your responses, we've prepared some personalized recommendations just for you! Our team will suggest items that match your mood and preferences.`;
  };

  const sendOwnerNotification = (message: string, items: Array<{ item: string; reason: string; customization: string }>) => {
    if (typeof window !== 'undefined') {
      // Store in localStorage for owner dashboard to pick up
      const notifications = JSON.parse(localStorage.getItem('customerMoodRecommendations') || '[]');
      const notification = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        message,
        items,
        customerProfile: recommendation?.customerProfile || '',
      };
      notifications.push(notification);
      // Keep last 20 recommendations
      localStorage.setItem('customerMoodRecommendations', JSON.stringify(notifications.slice(-20)));

      // Also try to send via WhatsApp if owner mobile is set
      const ownerMobile = localStorage.getItem('ownerMobileNumber');
      if (ownerMobile) {
        import('@/services/whatsappAlertsService').then(({ sendWhatsAppAlert }) => {
          const alert = {
            type: 'special-occasion' as const,
            message: `🎯 NEW CUSTOMER MOOD RECOMMENDATION\n\n${message}`,
            priority: 'medium' as const,
            timestamp: new Date(),
          };
          sendWhatsAppAlert(alert, ownerMobile);
        });
      }
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers({
      mood: '',
      energy: '',
      preference: '',
      occasion: '',
      comfort: '',
    });
    setRecommendation(null);
    setIsComplete(false);
  };

  if (isComplete && recommendation) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ✨ Personalized Recommendations Ready!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {recommendation.customerMessage}
          </p>
        </div>

        {/* Customer Profile */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 mb-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            👤 Your Profile
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            {recommendation.customerProfile}
          </p>
        </div>

        {/* Recommended Items */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-6 mb-6 border border-amber-200 dark:border-amber-800">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🎯 Recommended Items for You
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Our team has been notified and will suggest these personalized options when you order!
          </p>

          <div className="space-y-4">
            {recommendation.suggestedItems.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-amber-200 dark:border-amber-800"
              >
                <div className="flex items-start mb-2">
                  <span className="text-2xl mr-3">{index + 1}.</span>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {item.item}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Why this for you:</strong> {item.reason}
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 rounded p-2">
                      <strong>✨ Special customization:</strong> {item.customization}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Owner Notification Status */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6 border border-green-200 dark:border-green-800">
          <p className="text-green-800 dark:text-green-200 text-sm">
            ✅ <strong>Notification sent to owner!</strong> The team has received your preferences and will prepare personalized recommendations when you order.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
          >
            🔄 Take Quiz Again
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
          🎯 Personalized Item Recommendation
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Answer 5 quick questions and we'll suggest personalized items just for you!
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
              onClick={() => handleAnswer(currentQuestion.id as keyof CustomerAnswers, option)}
              className="w-full text-left px-4 py-3 bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors text-gray-900 dark:text-white"
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>✨ Your answers help us create the perfect recommendation for you!</p>
      </div>
    </div>
  );
}
