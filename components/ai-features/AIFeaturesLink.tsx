'use client';

import React from 'react';
import Link from 'next/link';

export default function AIFeaturesLink() {
  return (
    <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-purple-900 dark:text-purple-300 mb-1">
            🤖 Explore AI Features
          </h3>
          <p className="text-sm text-purple-700 dark:text-purple-400">
            Discover 11 unique AI-powered features to make your shop stand out - all customized to your specific shop data!
          </p>
        </div>
        <Link
          href="/ai-features"
          className="ml-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors whitespace-nowrap"
        >
          View AI Features →
        </Link>
      </div>
    </div>
  );
}
