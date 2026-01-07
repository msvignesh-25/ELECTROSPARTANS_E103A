'use client';

import React, { useState } from 'react';

interface ShopData {
  shopName: string;
  businessType: string;
  daysAvailable: string[];
  monthlyBudget: number;
  numberOfWorkers: number;
  processes: string[];
}

interface SmellToImageProps {
  shopData: ShopData;
}

interface SmellSubmission {
  id: string;
  words: string[];
  imagePrompt: string;
  timestamp: Date;
  votes?: number;
}

export default function SmellToImage({ shopData }: SmellToImageProps) {
  const [word1, setWord1] = useState('');
  const [word2, setWord2] = useState('');
  const [word3, setWord3] = useState('');
  const [submissions, setSubmissions] = useState<SmellSubmission[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!word1.trim() || !word2.trim() || !word3.trim()) {
      alert('Please enter all three words');
      return;
    }

    const words = [word1.trim(), word2.trim(), word3.trim()];
    const imagePrompt = `Create a beautiful, artistic visual representation of the aroma of ${shopData.shopName}, 
      a ${shopData.businessType}. The smell is described as: ${words.join(', ')}. 
      The visual should capture the essence of these scents - warm, inviting, and evocative. 
      Style: Abstract, artistic, Instagram-worthy. Colors should reflect the atmosphere of a shop 
      open ${shopData.daysAvailable.join(', ')} with ${shopData.numberOfWorkers} dedicated team members.`;

    setIsGenerating(true);
    try {
      const newSubmission: SmellSubmission = {
        id: Date.now().toString(),
        words,
        imagePrompt,
        timestamp: new Date(),
        votes: 0,
      };

      setSubmissions([...submissions, newSubmission]);
      setWord1('');
      setWord2('');
      setWord3('');
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVote = (id: string) => {
    setSubmissions(submissions.map(s => 
      s.id === id ? { ...s, votes: (s.votes || 0) + 1 } : s
    ));
  };

  const getWinner = () => {
    if (submissions.length === 0) return null;
    return submissions.reduce((prev, current) => 
      (prev.votes || 0) > (current.votes || 0) ? prev : current
    );
  };

  const winner = getWinner();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        👃 Smell-to-Image Social Contest
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Customers describe your shop's smell in 3 words. AI creates "Visual Aroma" art. Share on social media and give discounts to winners!
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Describe the smell of {shopData.shopName} in 3 words:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              value={word1}
              onChange={(e) => setWord1(e.target.value)}
              placeholder="Word 1"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <input
              type="text"
              value={word2}
              onChange={(e) => setWord2(e.target.value)}
              placeholder="Word 2"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <input
              type="text"
              value={word3}
              onChange={(e) => setWord3(e.target.value)}
              placeholder="Word 3"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !word1.trim() || !word2.trim() || !word3.trim()}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Creating Visual Aroma...' : '✨ Generate Visual Aroma'}
        </button>

        {/* Winner Display */}
        {winner && (
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
            <p className="text-lg font-bold text-yellow-800 dark:text-yellow-300 mb-2">
              🏆 Current Winner!
            </p>
            <p className="text-sm text-gray-800 dark:text-gray-200">
              "{winner.words.join(', ')}" - {winner.votes} votes
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              💡 Give this person a discount! Their words created the most beautiful visual aroma.
            </p>
          </div>
        )}

        {/* Submissions Gallery */}
        {submissions.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🎨 Visual Aroma Gallery
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        "{submission.words.join(', ')}"
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {submission.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleVote(submission.id)}
                      className="text-xs bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded transition-colors"
                    >
                      👍 Vote ({submission.votes || 0})
                    </button>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded p-3 mt-2">
                    <p className="text-xs font-semibold text-rose-800 dark:text-rose-300 mb-1">
                      Image Prompt:
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      {submission.imagePrompt.substring(0, 150)}...
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                    💡 Use this prompt with DALL-E or Midjourney to generate the actual image
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
