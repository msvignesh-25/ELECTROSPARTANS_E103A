'use client';

import React, { useState, useEffect } from 'react';
import {
  ScheduledTask,
  getTasksForDay,
  getUpcomingTasks,
  completeTask,
  checkAndSendTaskReminders,
} from '@/services/schedulingService';
import {
  checkStockLevels,
  StockAlert,
  loadStockAlerts,
} from '@/services/stockMonitoringService';
import {
  checkUpcomingOccasions,
  generateOccasionReminder,
  SpecialOccasion,
} from '@/services/specialOccasionsService';
import {
  sendWhatsAppAlert,
  generateStockExhaustedAlert,
  generateLowStockAlert,
  generateTaskReminderAlert,
  generateSpecialOccasionAlert,
  checkSalesDrop,
  generateSalesDropAlert,
} from '@/services/whatsappAlertsService';
import { getPreviousMonthRevenue, calculateMonthlyRevenue } from '@/services/metricsService';

interface SchedulingCalendarProps {
  products?: Array<{ id: string; name: string; stock: number }>;
  weeklyPlan?: Array<{ day: string; tasks: string[] }>;
  workers?: number;
}

export default function SchedulingCalendar({ 
  products = [], 
  weeklyPlan = [],
  workers = 1 
}: SchedulingCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [specialOccasions, setSpecialOccasions] = useState<SpecialOccasion[]>([]);
  const [reminders, setReminders] = useState<string[]>([]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  useEffect(() => {
    if (!selectedDay) {
      setSelectedDay(today);
    }
  }, [today, selectedDay]);

  useEffect(() => {
    // Load tasks
    const dayTasks = selectedDay ? getTasksForDay(selectedDay) : [];
    setTasks(dayTasks);
  }, [selectedDay]);

  const checkReminders = () => {
    // Check for reminders
    const taskReminders = checkAndSendTaskReminders();
    if (taskReminders.length > 0) {
      taskReminders.forEach(reminder => {
        const alert = generateTaskReminderAlert(
          reminder.message.split(' - ')[1] || reminder.message,
          reminder.message.split(' - ')[0] || 'You'
        );
        sendWhatsAppAlert(alert);
        setReminders(prev => [...prev, reminder.message]);
      });
    }

    // Check stock levels
    if (products.length > 0) {
      const alerts = checkStockLevels(products);
      setStockAlerts(alerts);
      
      alerts.forEach(alert => {
        if (alert.alertType === 'exhausted') {
          const whatsappAlert = generateStockExhaustedAlert(alert.productName);
          sendWhatsAppAlert(whatsappAlert);
          setReminders(prev => [...prev, `Stock exhausted: ${alert.productName}`]);
        } else if (alert.alertType === 'critical' || alert.alertType === 'low') {
          const whatsappAlert = generateLowStockAlert(alert.productName, alert.currentStock);
          sendWhatsAppAlert(whatsappAlert);
          setReminders(prev => [...prev, `Low stock: ${alert.productName} (${alert.currentStock} left)`]);
        }
      });
    }

    // Check special occasions
    const occasions = checkUpcomingOccasions();
    setSpecialOccasions(occasions);
    
    occasions.forEach(occasion => {
      const daysUntil = Math.ceil(
        (new Date(occasion.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      const reminder = generateOccasionReminder(occasion);
      const whatsappAlert = generateSpecialOccasionAlert(occasion.name, daysUntil);
      sendWhatsAppAlert(whatsappAlert);
      setReminders(prev => [...prev, reminder]);
    });

    // Check sales drop
    const currentRevenue = calculateMonthlyRevenue();
    const previousRevenue = getPreviousMonthRevenue();
    if (previousRevenue > 0 && checkSalesDrop(currentRevenue, previousRevenue)) {
      const dropPercentage = ((previousRevenue - currentRevenue) / previousRevenue) * 100;
      const alert = generateSalesDropAlert(currentRevenue, previousRevenue, dropPercentage);
      sendWhatsAppAlert(alert);
      setReminders(prev => [...prev, `Sales dropped by ${dropPercentage.toFixed(1)}%`]);
    }
  };

  useEffect(() => {
    if (products && products.length > 0) {
      checkReminders();
      // Check every 5 minutes
      const interval = setInterval(checkReminders, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [products]);

  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId);
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const upcomingTasks = getUpcomingTasks();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        📅 Scheduling Calendar & Reminders
      </h2>

      {/* Active Reminders */}
      {reminders.length > 0 && (
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
            🔔 Active Reminders (WhatsApp alerts sent)
          </h3>
          <ul className="space-y-1">
            {reminders.map((reminder, idx) => (
              <li key={idx} className="text-sm text-yellow-800 dark:text-yellow-200">
                • {reminder}
              </li>
            ))}
          </ul>
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
                  ? 'OUT OF STOCK' 
                  : `${alert.currentStock} units remaining (${alert.alertType.toUpperCase()})`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Special Occasions */}
      {specialOccasions.length > 0 && (
        <div className="mb-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
            🎉 Upcoming Special Occasions
          </h3>
          <ul className="space-y-2">
            {specialOccasions.map((occasion) => {
              const daysUntil = Math.ceil(
                (new Date(occasion.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              return (
                <li key={occasion.id} className="text-sm text-purple-800 dark:text-purple-200">
                  <span className="font-semibold">{occasion.name}</span> - in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                  <div className="mt-1 text-xs">
                    {!occasion.advertisingReminders.webpage && (
                      <span className="text-orange-600 dark:text-orange-400">⚠️ Update webpage </span>
                    )}
                    {!occasion.advertisingReminders.instagram && (
                      <span className="text-pink-600 dark:text-pink-400">⚠️ Post on Instagram </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Day Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Day
        </label>
        <div className="flex flex-wrap gap-2">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDay === day
                  ? 'bg-blue-500 text-white'
                  : day === today
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {day} {day === today && '(Today)'}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks for Selected Day */}
      {selectedDay && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Tasks for {selectedDay}
          </h3>
          {tasks.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No tasks scheduled for this day.</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {task.assignedTo}: {task.task}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Scheduled for {task.time}
                    </p>
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
      )}

      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Upcoming Tasks (Next 7 Days)
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm"
              >
                <span className="font-medium text-gray-900 dark:text-white">{task.day}:</span>{' '}
                <span className="text-gray-700 dark:text-gray-300">{task.task}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
