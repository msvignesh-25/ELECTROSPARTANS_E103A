'use client';

import React, { useState, useEffect } from 'react';
import {
  generateDailyTasks,
  monitorStockAndAlert,
  monitorSalesAndAlert,
  checkFestivalsAndRemind,
  type BusinessConstraints,
  type DailyTask,
} from '@/services/operationalAIService';
import {
  getOwnerMobileNumber,
  sendNotification,
  loadNotifications,
  type Notification,
} from '@/services/notificationService';
import {
  sendWhatsAppAlert,
  generateStockExhaustedAlert,
  generateLowStockAlert,
  generateSalesDropAlert,
  generateSpecialOccasionAlert,
} from '@/services/whatsappAlertsService';
import {
  checkStockLevels,
  type StockAlert,
} from '@/services/stockMonitoringService';
import {
  checkUpcomingOccasions,
  type SpecialOccasion,
} from '@/services/specialOccasionsService';
import {
  calculateMonthlyRevenue,
  getPreviousMonthRevenue,
} from '@/services/metricsService';
import {
  checkSalesDrop,
} from '@/services/whatsappAlertsService';

interface EnhancedSchedulingCalendarProps {
  products?: Array<{ id: string; name: string; stock: number }>;
  constraints?: BusinessConstraints;
  weeklyPlan?: Array<{ day: string; tasks: string[] }>;
}

export default function EnhancedSchedulingCalendar({
  products = [],
  constraints,
  weeklyPlan = [],
}: EnhancedSchedulingCalendarProps) {
  const [todayTasks, setTodayTasks] = useState<DailyTask[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<DailyTask[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [specialOccasions, setSpecialOccasions] = useState<SpecialOccasion[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [ownerMobile, setOwnerMobile] = useState<string>('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // Load owner mobile number and refresh periodically
  useEffect(() => {
    const loadMobile = () => {
      const mobile = getOwnerMobileNumber();
      if (mobile) setOwnerMobile(mobile);
    };
    
    loadMobile();
    // Check for mobile number changes every 2 seconds
    const mobileInterval = setInterval(loadMobile, 2000);
    
    return () => clearInterval(mobileInterval);
  }, []);

  // Generate daily tasks and check alerts
  useEffect(() => {
    // Always generate tasks (use defaults if no constraints)
    generateTasks();
    checkAllAlerts();

    // Set up interval to refresh tasks and check alerts every 2 minutes
    const interval = setInterval(() => {
      generateTasks();
      checkAllAlerts();
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [constraints, products, weeklyPlan]);

  const generateTasks = () => {
    // Use default constraints if not provided
    const defaultConstraints: BusinessConstraints = constraints || {
      timePerDay: 2,
      monthlyBudget: 1000,
      numberOfWorkers: 1,
      businessType: 'Business',
      daysAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    };

    // Generate today's tasks
    const tasks = generateDailyTasks(defaultConstraints, weeklyPlan);
    setTodayTasks(tasks.filter(t => !t.completed));

    // Generate upcoming tasks (next 7 days)
    const upcoming: DailyTask[] = [];
    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      const futureDay = futureDate.toLocaleDateString('en-US', { weekday: 'long' });
      if (defaultConstraints.daysAvailable.includes(futureDay)) {
        const futureTasks = generateDailyTasks(defaultConstraints, weeklyPlan);
        upcoming.push(...futureTasks);
      }
    }
    setUpcomingTasks(upcoming.slice(0, 15));
  };

  const checkAllAlerts = async () => {
    if (!ownerMobile) {
      console.warn('Owner mobile number not set. Alerts will only show on website.');
    }

    // Check stock levels and send alerts
    if (products.length > 0) {
      const stockResult = await monitorStockAndAlert(products, ownerMobile || undefined);
      setStockAlerts(stockResult.alerts);

      // Send WhatsApp alerts for stock issues
      stockResult.alerts.forEach(alert => {
        if (!alert.sent && ownerMobile) {
          if (alert.alertType === 'exhausted') {
            const whatsappAlert = generateStockExhaustedAlert(alert.productName);
            sendWhatsAppAlert(whatsappAlert);
          } else if (alert.alertType === 'critical' || alert.alertType === 'low') {
            const whatsappAlert = generateLowStockAlert(alert.productName, alert.currentStock);
            sendWhatsAppAlert(whatsappAlert);
          }
        }
      });
    }

    // Check sales drop and send alert
    const currentRevenue = calculateMonthlyRevenue();
    const previousRevenue = getPreviousMonthRevenue();
    if (previousRevenue > 0 && checkSalesDrop(currentRevenue, previousRevenue)) {
      const dropPercentage = ((previousRevenue - currentRevenue) / previousRevenue) * 100;
      
      // Send notification to website
      await sendNotification(
        'sales-drop',
        'high',
        '📉 Sales Drop Alert',
        `Sales have dropped by ${dropPercentage.toFixed(1)}% compared to last month. Current: ₹${currentRevenue.toLocaleString('en-IN')}, Previous: ₹${previousRevenue.toLocaleString('en-IN')}.`,
        ownerMobile || undefined
      );

      // Send WhatsApp alert
      if (ownerMobile) {
        const whatsappAlert = generateSalesDropAlert(currentRevenue, previousRevenue, dropPercentage);
        sendWhatsAppAlert(whatsappAlert);
      }
    }

    // Check special occasions and send reminders
    const occasions = checkUpcomingOccasions();
    setSpecialOccasions(occasions);

    // Add festival reminder tasks to today's tasks
    const todayOccasions = occasions.filter(occ => {
      const occDate = new Date(occ.date);
      const today = new Date();
      const daysUntil = Math.ceil((occDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 3 && daysUntil >= 0; // Today or within 3 days
    });

    // Create festival reminder tasks
    const festivalTasks: DailyTask[] = [];
    todayOccasions.forEach(occasion => {
      const daysUntil = Math.ceil(
        (new Date(occasion.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      const isToday = daysUntil === 0;

      // Add webpage update task if not done
      if (!occasion.advertisingReminders.webpage) {
        festivalTasks.push({
          id: `festival_webpage_${occasion.id}`,
          task: `[Festival Reminder] Update webpage with special promotions for ${occasion.name}`,
          assignedTo: 'You',
          time: '10:00',
          priority: isToday ? 'high' : 'medium',
          category: 'festival',
          autoGenerated: true,
          completed: false,
        });
      }

      // Add Instagram post task if not done
      if (!occasion.advertisingReminders.instagram) {
        festivalTasks.push({
          id: `festival_instagram_${occasion.id}`,
          task: `[Festival Reminder] Post on Instagram about ${occasion.name} offers`,
          assignedTo: 'You',
          time: '11:00',
          priority: isToday ? 'high' : 'medium',
          category: 'festival',
          autoGenerated: true,
          completed: false,
        });
      }

      // Send notification to website
      sendNotification(
        'festival-reminder',
        isToday ? 'urgent' : 'high',
        `🎉 ${occasion.name} - Advertising Reminder`,
        `${isToday ? 'Today is' : `${occasion.name} is in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}! Don't forget to:\n- Update webpage with special promotions\n- Post on Instagram about ${occasion.name} offers`,
        ownerMobile || undefined
      );

      // Send WhatsApp reminder
      if (ownerMobile) {
        const whatsappAlert = generateSpecialOccasionAlert(occasion.name, daysUntil);
        sendWhatsAppAlert(whatsappAlert);
      }
    });

    // Add festival tasks to today's tasks (avoid duplicates)
    setTodayTasks(prevTasks => {
      const existingIds = new Set(prevTasks.map(t => t.id));
      const newFestivalTasks = festivalTasks.filter(t => !existingIds.has(t.id));
      return [...prevTasks, ...newFestivalTasks];
    });

    // Load notifications
    const allNotifications = loadNotifications();
    setNotifications(allNotifications.slice(-10));
  };

  const handleCompleteTask = (taskId: string) => {
    setTodayTasks(tasks => tasks.map(t => 
      t.id === taskId ? { ...t, completed: true } : t
    ));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          📅 Enhanced Scheduling Calendar
        </h2>
        <button
          onClick={() => {
            generateTasks();
            checkAllAlerts();
          }}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Owner Mobile Number Setup */}
      {!ownerMobile && (
        <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Owner mobile number not set. Please enter it in the Business Advisor form on the home page to receive WhatsApp alerts.
          </p>
        </div>
      )}

      {ownerMobile && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ Owner mobile number set: {ownerMobile}. WhatsApp alerts are enabled.
          </p>
        </div>
      )}

      {/* Today's Tasks */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          📋 Today's Tasks ({today})
        </h3>
        {todayTasks.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No tasks scheduled for today.</p>
        ) : (
          <div className="space-y-2">
            {todayTasks.map(task => (
              <div
                key={task.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  task.priority === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-200' :
                  task.priority === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200' :
                  'bg-gray-50 dark:bg-gray-700 border-gray-200'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      {task.time}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                      {task.assignedTo}
                    </span>
                    {task.autoGenerated && (
                      <span className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                        AI Generated
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{task.task}</p>
                </div>
                <button
                  onClick={() => handleCompleteTask(task.id)}
                  className="ml-4 px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors"
                >
                  Complete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            📅 Upcoming Tasks (Next 7 Days)
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {upcomingTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{task.task}</p>
                  <p className="text-xs text-gray-500">{task.assignedTo} • {task.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Alerts */}
      {stockAlerts.length > 0 && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="font-semibold text-red-900 dark:text-red-300 mb-2">
            ⚠️ Stock Alerts
          </h3>
          <ul className="space-y-2">
            {stockAlerts.map((alert) => (
              <li key={alert.id} className="text-sm text-red-800 dark:text-red-200">
                <span className="font-semibold">{alert.productName}:</span>{' '}
                {alert.alertType === 'exhausted' 
                  ? 'OUT OF STOCK - WhatsApp alert sent!' 
                  : `${alert.currentStock} units remaining (${alert.alertType.toUpperCase()}) - WhatsApp alert sent!`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Special Occasions Reminders */}
      {specialOccasions.length > 0 && (
        <div className="mb-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
            🎉 Special Occasions & Festivals
          </h3>
          <ul className="space-y-2">
            {specialOccasions.map((occasion) => {
              const daysUntil = Math.ceil(
                (new Date(occasion.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              const isToday = daysUntil === 0;
              const isUpcoming = daysUntil <= 3 && daysUntil > 0;
              
              return (
                <li key={occasion.id} className={`text-sm p-2 rounded ${
                  isToday ? 'bg-red-100 dark:bg-red-900/30' : 
                  isUpcoming ? 'bg-yellow-100 dark:bg-yellow-900/30' : 
                  'bg-purple-100 dark:bg-purple-900/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-purple-900 dark:text-purple-300">
                        {occasion.name}
                      </span>
                      <span className="ml-2 text-purple-800 dark:text-purple-200">
                        {isToday ? '🎯 TODAY!' : isUpcoming ? `⚠️ in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}` : `in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}
                      </span>
                    </div>
                    {(isToday || isUpcoming) && (
                      <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded">
                        Festival Reminder
                      </span>
                    )}
                  </div>
                  {(isToday || isUpcoming) && (
                    <div className="mt-2 text-xs space-y-1">
                      <div className="font-semibold text-purple-900 dark:text-purple-300">
                        📋 Advertising Tasks Added:
                      </div>
                      {!occasion.advertisingReminders.webpage && (
                        <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                          <span>⚠️</span>
                          <span>Update webpage with special promotions for {occasion.name}</span>
                        </div>
                      )}
                      {!occasion.advertisingReminders.instagram && (
                        <div className="flex items-center gap-2 text-pink-700 dark:text-pink-300">
                          <span>📱</span>
                          <span>Post on Instagram about {occasion.name} offers</span>
                        </div>
                      )}
                      {ownerMobile && (
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                          <span>✓</span>
                          <span>WhatsApp reminder sent to owner</span>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🔔 Recent Alerts & Reminders
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-3 rounded-lg border text-sm ${
                  notif.priority === 'urgent' ? 'bg-red-50 dark:bg-red-900/20 border-red-200' :
                  notif.priority === 'high' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200' :
                  'bg-gray-50 dark:bg-gray-700 border-gray-200'
                }`}
              >
                <p className="font-semibold text-gray-900 dark:text-white">{notif.title}</p>
                <p className="text-gray-700 dark:text-gray-300">{notif.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {notif.sentToWebsite && '✓ Website'} {notif.sentToMobile && '✓ WhatsApp'} | 
                  {new Date(notif.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
