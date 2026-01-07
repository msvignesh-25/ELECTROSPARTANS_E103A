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
  loadNotifications,
  getUrgentNotifications,
  acknowledgeNotification,
  registerCustomer,
  loadRegisteredCustomers,
  setOwnerMobileNumber,
  getOwnerMobileNumber,
  type Notification,
  type CustomerRegistration,
} from '@/services/notificationService';
import { checkUpcomingOccasions } from '@/services/specialOccasionsService';
import { getMetricsData } from '@/services/metricsService';

interface OperationalDashboardProps {
  products?: Array<{ id: string; name: string; stock: number }>;
  constraints?: BusinessConstraints;
  weeklyPlan?: Array<{ day: string; tasks: string[] }>;
}

export default function OperationalDashboard({
  products = [],
  constraints,
  weeklyPlan = [],
}: OperationalDashboardProps) {
  const [todayTasks, setTodayTasks] = useState<DailyTask[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<DailyTask[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [urgentNotifications, setUrgentNotifications] = useState<Notification[]>([]);
  const [customers, setCustomers] = useState<CustomerRegistration[]>([]);
  const [ownerMobile, setOwnerMobile] = useState<string>('');
  const [newCustomerMobile, setNewCustomerMobile] = useState<string>('');
  const [newCustomerName, setNewCustomerName] = useState<string>('');
  const [metrics, setMetrics] = useState<any>(null);
  const [advertisingPaused, setAdvertisingPaused] = useState(false);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadDashboardData();
      runAutomatedChecks();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [products, constraints, weeklyPlan]);

  const loadDashboardData = () => {
    // Load owner mobile
    const ownerNum = getOwnerMobileNumber();
    if (ownerNum) setOwnerMobile(ownerNum);

    // Load customers
    setCustomers(loadRegisteredCustomers());

    // Load notifications
    const allNotifications = loadNotifications();
    setNotifications(allNotifications.slice(-20)); // Last 20
    setUrgentNotifications(getUrgentNotifications());

    // Load metrics
    setMetrics(getMetricsData());

    // Generate daily tasks
    if (constraints) {
      const tasks = generateDailyTasks(constraints, weeklyPlan);
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      setTodayTasks(tasks.filter(t => !t.completed));
      
      // Get upcoming tasks (next 7 days)
      const upcoming: DailyTask[] = [];
      for (let i = 1; i <= 7; i++) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + i);
        const futureDay = futureDate.toLocaleDateString('en-US', { weekday: 'long' });
        if (constraints?.daysAvailable.includes(futureDay)) {
          const futureTasks = generateDailyTasks(constraints, weeklyPlan);
          upcoming.push(...futureTasks);
        }
      }
      setUpcomingTasks(upcoming.slice(0, 10));
    }
  };

  const runAutomatedChecks = async () => {
    if (!constraints) return;

    // Check stock
    if (products.length > 0) {
      const stockResult = await monitorStockAndAlert(products, ownerMobile || undefined);
      setAdvertisingPaused(stockResult.advertisingPaused);
    }

    // Check sales
    await monitorSalesAndAlert(ownerMobile || undefined);

    // Check festivals
    await checkFestivalsAndRemind(ownerMobile || undefined);

    // Reload data
    loadDashboardData();
  };

  const handleCompleteTask = (taskId: string) => {
    setTodayTasks(tasks => tasks.map(t => 
      t.id === taskId ? { ...t, completed: true } : t
    ));
  };

  const handleAcknowledgeNotification = (notificationId: string) => {
    acknowledgeNotification(notificationId);
    loadDashboardData();
  };

  const handleRegisterCustomer = () => {
    if (!newCustomerMobile.trim()) {
      alert('Please enter a mobile number');
      return;
    }

    try {
      registerCustomer(newCustomerMobile, newCustomerName || undefined);
      setNewCustomerMobile('');
      setNewCustomerName('');
      loadDashboardData();
      alert('Customer registered successfully!');
    } catch (error) {
      alert('Failed to register customer');
    }
  };

  const handleSaveOwnerMobile = () => {
    if (!ownerMobile.trim()) {
      alert('Please enter a mobile number');
      return;
    }

    setOwnerMobileNumber(ownerMobile);
    alert('Owner mobile number saved!');
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* Urgent Alerts Banner */}
      {urgentNotifications.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg p-4">
          <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-2">
            🚨 Urgent Alerts ({urgentNotifications.length})
          </h3>
          <div className="space-y-2">
            {urgentNotifications.map(notif => (
              <div key={notif.id} className="flex justify-between items-start bg-white dark:bg-gray-800 p-3 rounded">
                <div className="flex-1">
                  <p className="font-semibold text-red-900 dark:text-red-300">{notif.title}</p>
                  <p className="text-sm text-red-800 dark:text-red-200">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {notif.sentToWebsite && '✓ Website'} {notif.sentToMobile && '✓ Mobile'} | 
                    {new Date(notif.timestamp).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleAcknowledgeNotification(notif.id)}
                  className="ml-4 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded"
                >
                  Acknowledge
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advertising Paused Alert */}
      {advertisingPaused && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-lg p-4">
          <p className="font-semibold text-yellow-900 dark:text-yellow-300">
            ⚠️ Advertising tasks have been automatically paused due to stock exhaustion.
          </p>
        </div>
      )}

      {/* Today's Tasks */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          📋 Today's Tasks (Auto-Generated)
        </h2>
        {todayTasks.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No tasks for today. Enjoy your day off!</p>
        ) : (
          <div className="space-y-3">
            {todayTasks.map(task => (
              <div
                key={task.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  task.priority === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                  task.priority === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                  'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            📅 Upcoming Tasks (Next 7 Days)
          </h2>
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

      {/* Metrics Dashboard */}
      {metrics && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            📊 Performance Metrics (Owner & Investor View)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Monthly Revenue</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                {formatCurrency(metrics.monthlyRevenue)}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">Orders Completed</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                {metrics.ordersCompleted}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">Repeat Customers</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                {metrics.repeatedCustomers}
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-1">Growth Trend</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-300">
                {metrics.growthTrend.length > 0 && metrics.growthTrend[metrics.growthTrend.length - 1].growthRate > 0 ? '+' : ''}
                {metrics.growthTrend.length > 0 ? metrics.growthTrend[metrics.growthTrend.length - 1].growthRate.toFixed(1) : '0'}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* All Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          🔔 All Notifications
        </h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No notifications</p>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-3 rounded-lg border ${
                  notif.priority === 'urgent' ? 'bg-red-50 dark:bg-red-900/20 border-red-200' :
                  notif.priority === 'high' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200' :
                  'bg-gray-50 dark:bg-gray-700 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{notif.title}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notif.sentToWebsite && '✓ Website'} {notif.sentToMobile && '✓ Mobile'} | 
                      {new Date(notif.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {!notif.acknowledged && (
                    <button
                      onClick={() => handleAcknowledgeNotification(notif.id)}
                      className="ml-4 px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded"
                    >
                      ✓
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          ⚙️ Settings
        </h2>
        
        {/* Owner Mobile */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Owner Mobile Number (for alerts)
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={ownerMobile}
              onChange={(e) => setOwnerMobile(e.target.value)}
              placeholder="+91 9876543210"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={handleSaveOwnerMobile}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Save
            </button>
          </div>
        </div>

        {/* Register Customer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Register Customer for Alerts
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="tel"
              value={newCustomerMobile}
              onChange={(e) => setNewCustomerMobile(e.target.value)}
              placeholder="Mobile Number"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <input
              type="text"
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
              placeholder="Name (optional)"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={handleRegisterCustomer}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
            >
              Register
            </button>
          </div>
          {customers.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Registered Customers ({customers.length}):
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                {customers.map(c => (
                  <div key={c.id}>
                    {c.name || 'Customer'}: {c.mobileNumber}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
