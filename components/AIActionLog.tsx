'use client';

import React, { useState, useEffect } from 'react';

interface ActionLog {
  id: string;
  action: string;
  description: string;
  timestamp: string;
}

export default function AIActionLog() {
  const [logs, setLogs] = useState<ActionLog[]>([]);

  useEffect(() => {
    loadLogs();
    // Refresh every 5 seconds
    const interval = setInterval(loadLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadLogs = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aiActionLogs');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Sort by timestamp (newest first)
          const sorted = parsed.sort((a: ActionLog, b: ActionLog) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setLogs(sorted.slice(0, 50)); // Show last 50
        } catch (error) {
          console.error('Error loading AI action logs:', error);
        }
      }
    }
  };

  const clearLogs = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiActionLogs', JSON.stringify([]));
      setLogs([]);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('Task')) return '📋';
    if (action.includes('Alert')) return '🚨';
    if (action.includes('Revenue')) return '💰';
    if (action.includes('Stock')) return '📦';
    if (action.includes('Sales')) return '📉';
    if (action.includes('Festival')) return '🎉';
    if (action.includes('Notification')) return '🔔';
    return '🤖';
  };

  const getActionColor = (action: string) => {
    if (action.includes('Alert') || action.includes('Critical')) return 'text-red-600 dark:text-red-400';
    if (action.includes('Warning')) return 'text-yellow-600 dark:text-yellow-400';
    if (action.includes('Task')) return 'text-blue-600 dark:text-blue-400';
    if (action.includes('Revenue')) return 'text-green-600 dark:text-green-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🤖 AI Action & Alert Log
        </h2>
        {logs.length > 0 && (
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
          >
            Clear Logs
          </button>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Chronological log of all AI actions, alerts, and automated tasks
      </p>

      {logs.length > 0 ? (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="text-2xl">{getActionIcon(log.action)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`font-semibold text-sm ${getActionColor(log.action)}`}>
                    {log.action}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {log.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No AI actions logged yet. Actions will appear here as they occur.</p>
        </div>
      )}
    </div>
  );
}
