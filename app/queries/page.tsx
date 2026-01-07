'use client';

import React, { useState } from 'react';

interface Query {
  id: string;
  question: string;
  answer: string;
  category: 'investor' | 'customer' | 'general';
  tags: string[];
}

export default function QueriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'investor' | 'customer' | 'general'>('all');
  const [userQuery, setUserQuery] = useState('');
  const [userQueryResponse, setUserQueryResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  // Sample FAQ data
  const queries: Query[] = [
    {
      id: '1',
      question: 'How can I view business statistics as an investor?',
      answer: 'Navigate to the Investor Dashboard to access detailed business statistics including revenue, growth rates, profit margins, customer metrics, and market share. You can also interact with the AI assistant to get insights about specific metrics.',
      category: 'investor',
      tags: ['statistics', 'dashboard', 'metrics'],
    },
    {
      id: '2',
      question: 'What financial metrics are available for businesses?',
      answer: 'The investor dashboard provides comprehensive financial metrics including monthly revenue, growth rate, profit margin, monthly expenses, average order value, customer retention rate, conversion rate, and market share. All metrics are updated regularly.',
      category: 'investor',
      tags: ['financial', 'metrics', 'revenue'],
    },
    {
      id: '3',
      question: 'How do I browse and purchase products?',
      answer: 'Visit the Customer Portal to browse all available products. You can filter by category, view detailed product information, check availability, and add items to your cart. The AI assistant can help answer questions about products, pricing, and availability.',
      category: 'customer',
      tags: ['products', 'shopping', 'purchase'],
    },
    {
      id: '4',
      question: 'What payment methods are accepted?',
      answer: 'We accept all major credit cards, debit cards, PayPal, and digital payment methods. Secure payment processing ensures your transactions are safe and protected.',
      category: 'customer',
      tags: ['payment', 'checkout', 'security'],
    },
    {
      id: '5',
      question: 'How accurate are the business statistics?',
      answer: 'All business statistics are based on real-time data from business operations. The metrics are calculated using verified financial records, customer databases, and sales data. The AI analysis provides additional insights based on these verified metrics.',
      category: 'investor',
      tags: ['accuracy', 'data', 'verification'],
    },
    {
      id: '6',
      question: 'Can I get product recommendations?',
      answer: 'Yes! Use the AI assistant in the Customer Portal to get personalized product recommendations. Simply ask questions like "What product is best?" or "What do you recommend?" and the AI will suggest products based on ratings, popularity, and customer reviews.',
      category: 'customer',
      tags: ['recommendations', 'ai', 'products'],
    },
    {
      id: '7',
      question: 'What is the return policy?',
      answer: 'We offer a 30-day return policy on all products. Items must be in original condition with packaging. For services, please contact customer support within 7 days of service completion for refunds or adjustments.',
      category: 'customer',
      tags: ['returns', 'policy', 'refunds'],
    },
    {
      id: '8',
      question: 'How can I track business growth trends?',
      answer: 'The Investor Dashboard displays growth rates and trends. You can ask the AI assistant specific questions about growth patterns, compare metrics over time, and analyze growth potential. Historical data is available for trend analysis.',
      category: 'investor',
      tags: ['growth', 'trends', 'analysis'],
    },
    {
      id: '9',
      question: 'Are products available for international shipping?',
      answer: 'Currently, we offer shipping within the country. International shipping options are being evaluated. Please contact customer support for specific shipping inquiries to your location.',
      category: 'customer',
      tags: ['shipping', 'international', 'delivery'],
    },
    {
      id: '10',
      question: 'What investment risks should I be aware of?',
      answer: 'The AI assistant in the Investor Dashboard can provide risk assessments based on current business metrics. Key factors include customer retention rates, profit margins, market competition, and growth stability. Always review comprehensive data before making investment decisions.',
      category: 'investor',
      tags: ['risks', 'investment', 'assessment'],
    },
    {
      id: '11',
      question: 'How do I contact customer support?',
      answer: 'You can contact customer support through the Contact page, submit queries through this page, or use the AI assistant for immediate answers to common questions. Our support team responds within 24-48 hours.',
      category: 'general',
      tags: ['support', 'contact', 'help'],
    },
    {
      id: '12',
      question: 'What information do I need to provide as an investor?',
      answer: 'As an investor, you can access business statistics without providing personal information. However, for detailed investment discussions or data access, you may need to register and verify your investor status through our contact form.',
      category: 'investor',
      tags: ['registration', 'access', 'verification'],
    },
  ];

  const filteredQueries =
    selectedCategory === 'all'
      ? queries
      : queries.filter((q) => q.category === selectedCategory);

  const handleUserQuery = () => {
    if (!userQuery.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      const lowerQuery = userQuery.toLowerCase();
      let response = '';

      // Match against existing queries
      const matchedQuery = queries.find(
        (q) =>
          q.question.toLowerCase().includes(lowerQuery) ||
          q.answer.toLowerCase().includes(lowerQuery) ||
          q.tags.some((tag) => lowerQuery.includes(tag))
      );

      if (matchedQuery) {
        response = `Found a related question:\n\n`;
        response += `Q: ${matchedQuery.question}\n\n`;
        response += `A: ${matchedQuery.answer}\n\n`;
        response += `If this doesn't fully answer your question, please submit your query using the form below.`;
      } else {
        response = `Thank you for your question! While I don't have a direct answer in our FAQ, I can help you:\n\n`;
        response += `• For investor questions: Check the Investor Dashboard\n`;
        response += `• For customer questions: Visit the Customer Portal\n`;
        response += `• Submit your question using the form below for a detailed response\n\n`;
        response += `Your question has been noted and will be reviewed by our team.`;
      }

      setUserQueryResponse(response);
      setIsLoading(false);
    }, 1000);
  };

  const handleSubmitQuery = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit to a backend
    alert('Your query has been submitted! We will respond within 24-48 hours.');
    setUserQuery('');
    setUserQueryResponse('');
    setShowSubmitForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Queries & FAQ
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find answers to common questions or ask your own
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FAQ Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Filter by Category</h2>
              <div className="flex flex-wrap gap-2">
                {(['all', 'investor', 'customer', 'general'] as const).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ List */}
            <div className="space-y-4">
              {filteredQueries.map((query) => (
                <div
                  key={query.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex-1">
                      {query.question}
                    </h3>
                    <span
                      className={`ml-4 px-2 py-1 rounded text-xs font-semibold ${
                        query.category === 'investor'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                          : query.category === 'customer'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}
                    >
                      {query.category}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {query.answer}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {query.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Query & Submit Section */}
          <div className="space-y-6">
            {/* AI Query Assistant */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🤖 AI Query Assistant
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Ask a question and get instant answers from our FAQ database.
              </p>

              <div className="space-y-4">
                <textarea
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="e.g., How do I view business statistics? What is the return policy?"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-sm"
                  rows={4}
                />

                <button
                  onClick={handleUserQuery}
                  disabled={!userQuery.trim() || isLoading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isLoading ? 'Searching...' : 'Search FAQ'}
                </button>

                {userQueryResponse && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 text-sm">AI Response:</h3>
                    <pre className="text-xs text-blue-800 dark:text-blue-200 whitespace-pre-wrap font-sans">
                      {userQueryResponse}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Submit New Query */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Submit Your Query
                </h2>
                <button
                  onClick={() => setShowSubmitForm(!showSubmitForm)}
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  {showSubmitForm ? 'Cancel' : 'New Query'}
                </button>
              </div>

              {showSubmitForm && (
                <form onSubmit={handleSubmitQuery} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="">Select category...</option>
                      <option value="investor">Investor</option>
                      <option value="customer">Customer</option>
                      <option value="general">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Question
                    </label>
                    <textarea
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-sm"
                      rows={4}
                      placeholder="Enter your question here..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      placeholder="your@email.com"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    Submit Query
                  </button>
                </form>
              )}

              {!showSubmitForm && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Can't find what you're looking for? Click "New Query" to submit your question and we'll get back to you.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
