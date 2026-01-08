'use client';

import React, { useState } from 'react';
import BusinessAdvisor from '@/components/BusinessAdvisor';
import Link from 'next/link';

export default function Home() {
  const [showAdvisor, setShowAdvisor] = useState(false);

  if (!showAdvisor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <main className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
                AI-Powered Business Growth Assistant
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                Intelligent automation and personalized strategies for your business growth
              </p>
              <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="font-semibold">Powered by Advanced AI Technology</span>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                About This Platform
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 text-center leading-relaxed">
                This AI-powered business management platform is designed to help small businesses, 
                family-run shops, and entrepreneurs grow their business through intelligent automation, 
                personalized growth strategies, and data-driven insights.
              </p>

              {/* Developers Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                  Developed By
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                    <div className="w-20 h-20 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      S
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">Sachin</h4>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Lead Developer</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                    <div className="w-20 h-20 mx-auto mb-4 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      V
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">Vignesh</h4>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">AI Engineer</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                    <div className="w-20 h-20 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      H
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">Harshavardhan</h4>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Full Stack Developer</p>
                  </div>
                </div>
              </div>

              {/* AI Features Highlight */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  🤖 Powered by Advanced AI
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Our platform leverages cutting-edge artificial intelligence to provide:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Intelligent business strategy generation based on your unique constraints</li>
                  <li>Automated task planning and budget allocation</li>
                  <li>Personalized recommendations tailored to your business type</li>
                  <li>Real-time insights and performance analytics</li>
                </ul>
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => setShowAdvisor(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  Get Started with Business Advisor
                </button>
                <Link
                  href="/about"
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <button
            onClick={() => setShowAdvisor(false)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            ← Back to Home
          </button>
        </div>
        <BusinessAdvisor />
      </main>
    </div>
  );
} 