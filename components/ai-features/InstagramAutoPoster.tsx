'use client';

import React, { useState, useEffect } from 'react';
import { generateInstagramPost, scheduleInstagramPost } from '@/services/aiServices';

interface ShopData {
  shopName: string;
  businessType: string;
  daysAvailable: string[];
  monthlyBudget: number;
  numberOfWorkers: number;
  processes: string[];
}

interface InstagramAutoPosterProps {
  shopData: ShopData;
}

interface ScheduledPost {
  id: string;
  type: 'daily' | 'promotional' | 'behind-scenes' | 'customer-spotlight' | 'product-feature';
  caption: string;
  hashtags: string[];
  scheduledTime: string;
  status: 'scheduled' | 'posted' | 'failed';
}

export default function InstagramAutoPoster({ shopData }: InstagramAutoPosterProps) {
  const [selectedPostType, setSelectedPostType] = useState<'daily' | 'promotional' | 'behind-scenes' | 'customer-spotlight' | 'product-feature'>('daily');
  const [customContext, setCustomContext] = useState('');
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoPostEnabled, setAutoPostEnabled] = useState(false);
  const [postingFrequency, setPostingFrequency] = useState<'daily' | 'every-other-day' | 'weekly'>('daily');

  const postTypes = [
    { value: 'daily', label: 'Daily Update', icon: '📅' },
    { value: 'promotional', label: 'Promotional', icon: '🎉' },
    { value: 'behind-scenes', label: 'Behind the Scenes', icon: '🎬' },
    { value: 'customer-spotlight', label: 'Customer Spotlight', icon: '⭐' },
    { value: 'product-feature', label: 'Product Feature', icon: '✨' },
  ];

  // Auto-posting logic
  useEffect(() => {
    if (!autoPostEnabled) return;

    const scheduleNextPosts = async () => {
      const frequencyMap = {
        'daily': 1,
        'every-other-day': 2,
        'weekly': 7,
      };

      const daysToSchedule = frequencyMap[postingFrequency];
      const newPosts: ScheduledPost[] = [];

      for (let i = 0; i < 7; i += daysToSchedule) {
        const postDate = new Date();
        postDate.setDate(postDate.getDate() + i);

        // Rotate post types
        const postType = postTypes[i % postTypes.length].value as any;
        
        try {
          const postContent = await generateInstagramPost(shopData, postType, customContext);
          const scheduledTime = new Date(postDate);
          scheduledTime.setHours(9, 0, 0, 0); // 9 AM

          newPosts.push({
            id: `post_${Date.now()}_${i}`,
            type: postType,
            caption: postContent.caption,
            hashtags: postContent.hashtags,
            scheduledTime: scheduledTime.toISOString(),
            status: 'scheduled',
          });
        } catch (error) {
          console.error('Error scheduling post:', error);
        }
      }

      setScheduledPosts(newPosts);
    };

    scheduleNextPosts();
    const interval = setInterval(scheduleNextPosts, 24 * 60 * 60 * 1000); // Daily

    return () => clearInterval(interval);
  }, [autoPostEnabled, postingFrequency, shopData, customContext]);

  const handleGeneratePost = async () => {
    setIsGenerating(true);
    try {
      const postContent = await generateInstagramPost(shopData, selectedPostType, customContext);
      
      const newPost: ScheduledPost = {
        id: `post_${Date.now()}`,
        type: selectedPostType,
        caption: postContent.caption,
        hashtags: postContent.hashtags,
        scheduledTime: postContent.optimalPostTime,
        status: 'scheduled',
      };

      setScheduledPosts([...scheduledPosts, newPost]);
      setCustomContext('');
    } catch (error) {
      console.error('Error generating post:', error);
      alert('Failed to generate post. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePostNow = async (post: ScheduledPost) => {
    try {
      const result = await scheduleInstagramPost(shopData, post.type);
      if (result.success) {
        setScheduledPosts(scheduledPosts.map(p => 
          p.id === post.id ? { ...p, status: 'posted' } : p
        ));
        alert('Post published successfully!');
      }
    } catch (error) {
      console.error('Error posting:', error);
      setScheduledPosts(scheduledPosts.map(p => 
        p.id === post.id ? { ...p, status: 'failed' } : p
      ));
      alert('Failed to post. Please check your Instagram API connection.');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        📱 Instagram Auto-Poster
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        AI automatically generates and posts Instagram content SPECIFIC to your shop data (name, days open, workers, budget, processes). No generic posts - everything is tailored!
      </p>

      <div className="space-y-4">
        {/* Auto-posting toggle */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-blue-900 dark:text-blue-300">
              Enable Auto-Posting
            </label>
            <input
              type="checkbox"
              checked={autoPostEnabled}
              onChange={(e) => setAutoPostEnabled(e.target.checked)}
              className="w-5 h-5"
            />
          </div>
          {autoPostEnabled && (
            <div className="mt-3">
              <label className="block text-xs text-gray-700 dark:text-gray-300 mb-2">
                Posting Frequency
              </label>
              <select
                value={postingFrequency}
                onChange={(e) => setPostingFrequency(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="daily">Daily</option>
                <option value="every-other-day">Every Other Day</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          )}
        </div>

        {/* Manual post generation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Post Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {postTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setSelectedPostType(type.value as any)}
                className={`px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
                  selectedPostType === type.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <span className="block text-lg mb-1">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Custom Context (Optional)
          </label>
          <input
            type="text"
            value={customContext}
            onChange={(e) => setCustomContext(e.target.value)}
            placeholder="e.g., Special event, new product, etc."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <button
          onClick={handleGeneratePost}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating Post...' : '✨ Generate & Schedule Post'}
        </button>

        {/* Scheduled Posts */}
        {scheduledPosts.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Scheduled Posts ({scheduledPosts.length})
            </h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {scheduledPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {postTypes.find(t => t.value === post.type)?.icon}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {postTypes.find(t => t.value === post.type)?.label}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        post.status === 'posted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        post.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    {post.status === 'scheduled' && (
                      <button
                        onClick={() => handlePostNow(post)}
                        className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors"
                      >
                        Post Now
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {post.caption.substring(0, 150)}...
                  </p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {post.hashtags.slice(0, 5).map((tag, idx) => (
                      <span key={idx} className="text-xs text-blue-600 dark:text-blue-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Scheduled: {new Date(post.scheduledTime).toLocaleString()}
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
