"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BusinessAdvisor from "@/components/BusinessAdvisor";

interface Notification {
  id: string;
  message: string;
  type: string;
  createdAt: Date;
  read: boolean;
}

interface Shop {
  id: string;
  name: string;
  businessType: string;
  address?: string;
  phone?: string;
}

export default function VendorPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "notifications" | "shops" | "coffee-metrics" | "community">("dashboard");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [showAddShop, setShowAddShop] = useState(false);
  const [newShop, setNewShop] = useState({
    name: "",
    businessType: "",
    address: "",
    phone: "",
  });
  
  // Coffee Business Metrics State
  const [coffeeMetrics, setCoffeeMetrics] = useState<Array<{
    id: string;
    month: string;
    year: string;
    monthlyRevenue: number;
    customersAttended: number;
    ordersCompleted: number;
    submittedAt: string;
  }>>([]);
  const [newMetric, setNewMetric] = useState({
    month: "",
    year: new Date().getFullYear().toString(),
    monthlyRevenue: "",
    customersAttended: "",
    ordersCompleted: "",
  });
  
  // WhatsApp Community Admin State
  const [vendorPhoneNumber, setVendorPhoneNumber] = useState("");
  const [vendorPhoneError, setVendorPhoneError] = useState("");
  const [isAdminRegistered, setIsAdminRegistered] = useState(false);
  const [communityAdmin, setCommunityAdmin] = useState<string | null>(null);
  const [communityMembers, setCommunityMembers] = useState<string[]>([]);
  const [activityLog, setActivityLog] = useState<Array<{ message: string; timestamp: string }>>([]);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login?role=vendor");
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== "vendor") {
      router.push("/login?role=vendor");
      return;
    }

    setUser(userData);
    loadNotifications(userData.id);
    loadShops(userData.id);
    loadCoffeeMetrics();
    loadCommunityData();
    
    // Refresh community data periodically to see new customers
    const interval = setInterval(() => {
      if (activeTab === 'community') {
        loadCommunityData();
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [router, activeTab]);

  // Load community data (admin and members)
  const loadCommunityData = () => {
    if (typeof window !== 'undefined') {
      // Load admin
      const admin = localStorage.getItem('whatsappCommunityAdmin');
      if (admin) {
        setCommunityAdmin(admin);
        setIsAdminRegistered(true);
      }
      
      // Load members
      const saved = localStorage.getItem('whatsappCommunityMembers');
      if (saved) {
        try {
          setCommunityMembers(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading community members:', error);
        }
      }
      
      // Load activity log
      const log = localStorage.getItem('whatsappCommunityActivityLog');
      if (log) {
        try {
          setActivityLog(JSON.parse(log));
        } catch (error) {
          console.error('Error loading activity log:', error);
        }
      }
    }
  };

  // Save activity log
  const saveActivityLog = (log: typeof activityLog) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('whatsappCommunityActivityLog', JSON.stringify(log));
    }
  };

  // Validate phone number format
  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^(\+?\d{10,15})$/;
    return phoneRegex.test(cleaned);
  };

  // Handle vendor admin registration
  const handleRegisterAsAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setVendorPhoneError("");

    if (!vendorPhoneNumber.trim()) {
      setVendorPhoneError("Please enter your phone number");
      return;
    }

    if (!validatePhoneNumber(vendorPhoneNumber)) {
      setVendorPhoneError("Please enter a valid phone number (10-15 digits, optionally with country code)");
      return;
    }

    // Clean phone number
    const cleanedPhone = vendorPhoneNumber.replace(/[\s\-\(\)]/g, '');

    // Check if already registered as admin
    if (communityAdmin === cleanedPhone) {
      setVendorPhoneError("You are already registered as the admin");
      return;
    }

    // If there's already an admin, replace it
    if (communityAdmin && communityAdmin !== cleanedPhone) {
      // Remove old admin from members list if present
      const updatedMembers = communityMembers.filter(m => m !== communityAdmin);
      setCommunityMembers(updatedMembers);
      if (typeof window !== 'undefined') {
        localStorage.setItem('whatsappCommunityMembers', JSON.stringify(updatedMembers));
      }
    }

    // Register as admin
    setCommunityAdmin(cleanedPhone);
    setIsAdminRegistered(true);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('whatsappCommunityAdmin', cleanedPhone);
    }

    // Add to activity log
    const logEntry = {
      message: `Vendor registered as Admin: ${cleanedPhone}`,
      timestamp: new Date().toLocaleString(),
    };
    const updatedLog = [...activityLog, logEntry];
    setActivityLog(updatedLog);
    saveActivityLog(updatedLog);

    // Clear input
    setVendorPhoneNumber("");

    alert("You are registered as the WhatsApp Community Admin (simulated).");
  };

  // Load coffee metrics from localStorage
  const loadCoffeeMetrics = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('coffeeBusinessMetrics');
      if (saved) {
        try {
          setCoffeeMetrics(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading coffee metrics:', error);
        }
      }
    }
  };

  // Save coffee metrics to localStorage
  const saveCoffeeMetrics = (metrics: typeof coffeeMetrics) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('coffeeBusinessMetrics', JSON.stringify(metrics));
    }
  };

  // Handle coffee metrics submission
  const handleSubmitCoffeeMetric = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMetric.month || !newMetric.year || !newMetric.monthlyRevenue || 
        !newMetric.customersAttended || !newMetric.ordersCompleted) {
      alert("Please fill in all fields");
      return;
    }

    const revenue = parseFloat(newMetric.monthlyRevenue);
    const customers = parseInt(newMetric.customersAttended);
    const orders = parseInt(newMetric.ordersCompleted);

    if (isNaN(revenue) || isNaN(customers) || isNaN(orders) || revenue < 0 || customers < 0 || orders < 0) {
      alert("Please enter valid numbers");
      return;
    }

    // Check if entry for this month/year already exists
    const existingIndex = coffeeMetrics.findIndex(
      m => m.month === newMetric.month && m.year === newMetric.year
    );

    const newEntry = {
      id: existingIndex >= 0 ? coffeeMetrics[existingIndex].id : `metric_${Date.now()}`,
      month: newMetric.month,
      year: newMetric.year,
      monthlyRevenue: revenue,
      customersAttended: customers,
      ordersCompleted: orders,
      submittedAt: new Date().toISOString(),
    };

    let updatedMetrics;
    if (existingIndex >= 0) {
      updatedMetrics = [...coffeeMetrics];
      updatedMetrics[existingIndex] = newEntry;
    } else {
      updatedMetrics = [...coffeeMetrics, newEntry];
    }

    setCoffeeMetrics(updatedMetrics);
    saveCoffeeMetrics(updatedMetrics);
    
    setNewMetric({
      month: "",
      year: new Date().getFullYear().toString(),
      monthlyRevenue: "",
      customersAttended: "",
      ordersCompleted: "",
    });
    
    alert(existingIndex >= 0 ? "Metric updated successfully!" : "Metric added successfully!");
  };

  const loadNotifications = async (vendorId: string) => {
    try {
      const res = await fetch(`/api/vendor/notifications?vendorId=${vendorId}`);
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const loadShops = async (userId: string) => {
    try {
      const res = await fetch(`/api/vendor/shops?userId=${userId}`);
      const data = await res.json();
      setShops(data.shops || []);
    } catch (error) {
      console.error("Error loading shops:", error);
    }
  };

  const handleAddShop = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert("Please login to register a shop");
      return;
    }

    if (!newShop.name || !newShop.businessType) {
      alert("Please fill in all required fields (Shop Name and Business Type)");
      return;
    }

    try {
      const res = await fetch("/api/vendor/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, shop: newShop }),
      });

      const data = await res.json();
      if (data.success) {
        setShops(data.shops);
        setShowAddShop(false);
        setNewShop({ name: "", businessType: "", address: "", phone: "" });
        alert("Shop registered successfully!");
        await loadShops(user.id); // Reload shops
      } else {
        alert(data.error || "Failed to register shop. Please try again.");
      }
    } catch (error) {
      console.error("Error adding shop:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      await fetch("/api/vendor/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId: user.id, notificationId }),
      });

      setNotifications(notifications.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  if (!user) {
    return null;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Vendor Portal
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome, {user.name}!
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("user");
                router.push("/login?role=vendor");
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="flex space-x-8 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-3 border-b-2 font-medium text-sm ${
                activeTab === "dashboard"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Growth Plan
            </button>
            <button
              onClick={() => setActiveTab("shops")}
              className={`px-4 py-3 border-b-2 font-medium text-sm ${
                activeTab === "shops"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              My Shops
            </button>
            <button
              onClick={() => setActiveTab("coffee-metrics")}
              className={`px-4 py-3 border-b-2 font-medium text-sm ${
                activeTab === "coffee-metrics"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Coffee Metrics
            </button>
            <button
              onClick={() => setActiveTab("community")}
              className={`px-4 py-3 border-b-2 font-medium text-sm ${
                activeTab === "community"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              WhatsApp Community
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`px-4 py-3 border-b-2 font-medium text-sm relative ${
                activeTab === "notifications"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Notifications
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && <BusinessAdvisor />}

        {activeTab === "shops" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Shops
              </h2>
              <button
                onClick={() => setShowAddShop(!showAddShop)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {showAddShop ? "Cancel" : "+ Add Shop"}
              </button>
            </div>

            {showAddShop && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Register New Shop
                </h3>
                <form onSubmit={handleAddShop} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Shop Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newShop.name}
                        onChange={(e) => setNewShop({ ...newShop, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter shop name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Business Type *
                      </label>
                      <select
                        required
                        value={newShop.businessType}
                        onChange={(e) => setNewShop({ ...newShop, businessType: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select type</option>
                        <option value="bakery">Bakery</option>
                        <option value="coffee shop">Coffee Shop</option>
                        <option value="repair shop (mobiles, laptops)">Repair Shop (Mobiles, Laptops)</option>
                        <option value="cool drinks">Cool Drinks</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={newShop.address}
                        onChange={(e) => setNewShop({ ...newShop, address: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter shop address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={newShop.phone}
                        onChange={(e) => setNewShop({ ...newShop, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddShop(e);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer"
                  >
                    Register Shop
                  </button>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shops.map((shop) => (
                <div
                  key={shop.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
                >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {shop.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    <span className="font-semibold">Type:</span> {shop.businessType}
                  </p>
                  {shop.address && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      📍 {shop.address}
                    </p>
                  )}
                  {shop.phone && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      📞 {shop.phone}
                    </p>
                  )}
                </div>
              ))}
              {shops.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                  No shops registered yet. Click "Add Shop" to register your first shop.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "coffee-metrics" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Coffee Business Metrics
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your monthly coffee business data. This information will be used by investors to analyze your business performance.
            </p>

            {/* Input Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Enter Monthly Data
              </h3>
              <form onSubmit={handleSubmitCoffeeMetric} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Month *
                    </label>
                    <select
                      required
                      value={newMetric.month}
                      onChange={(e) => setNewMetric({ ...newMetric, month: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select month</option>
                      <option value="January">January</option>
                      <option value="February">February</option>
                      <option value="March">March</option>
                      <option value="April">April</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                      <option value="August">August</option>
                      <option value="September">September</option>
                      <option value="October">October</option>
                      <option value="November">November</option>
                      <option value="December">December</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Year *
                    </label>
                    <input
                      type="number"
                      required
                      value={newMetric.year}
                      onChange={(e) => setNewMetric({ ...newMetric, year: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="2024"
                      min="2020"
                      max="2100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Monthly Revenue (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={newMetric.monthlyRevenue}
                      onChange={(e) => setNewMetric({ ...newMetric, monthlyRevenue: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Number of Customers Attended *
                    </label>
                    <input
                      type="number"
                      required
                      value={newMetric.customersAttended}
                      onChange={(e) => setNewMetric({ ...newMetric, customersAttended: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Number of Orders Completed *
                    </label>
                    <input
                      type="number"
                      required
                      value={newMetric.ordersCompleted}
                      onChange={(e) => setNewMetric({ ...newMetric, ordersCompleted: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Submit Data
                </button>
              </form>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Entered Data
              </h3>
              {coffeeMetrics.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No data entered yet. Please submit your monthly metrics above.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Month</th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Year</th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Monthly Revenue (₹)</th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Customers Attended</th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Orders Completed</th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coffeeMetrics
                        .sort((a, b) => {
                          const dateA = new Date(`${a.month} 1, ${a.year}`);
                          const dateB = new Date(`${b.month} 1, ${b.year}`);
                          return dateB.getTime() - dateA.getTime();
                        })
                        .map((metric) => (
                          <tr key={metric.id} className="border-b border-gray-200 dark:border-gray-700">
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{metric.month}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{metric.year}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              ₹{metric.monthlyRevenue.toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{metric.customersAttended.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{metric.ordersCompleted.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                              {new Date(metric.submittedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "community" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                WhatsApp Community Management
              </h2>
              <button
                onClick={loadCommunityData}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Refresh
              </button>
            </div>

            {/* Vendor Admin Registration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Register as Community Admin
              </h3>
              
              {!isAdminRegistered ? (
                <form onSubmit={handleRegisterAsAdmin} className="space-y-4">
                  <div>
                    <label htmlFor="vendor-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Vendor Phone Number
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="vendor-phone"
                        type="tel"
                        value={vendorPhoneNumber}
                        onChange={(e) => {
                          setVendorPhoneNumber(e.target.value);
                          setVendorPhoneError("");
                        }}
                        placeholder="+1234567890 or 1234567890"
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                      >
                        Register as Community Admin
                      </button>
                    </div>
                    {vendorPhoneError && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{vendorPhoneError}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Format: 10-15 digits, optionally with country code (e.g., +1234567890)
                    </p>
                  </div>
                </form>
              ) : (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <p className="text-green-800 dark:text-green-300 font-medium">
                    ✓ You are registered as the WhatsApp Community Admin (simulated).
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-2">
                    Admin Phone: {communityAdmin}
                  </p>
                </div>
              )}
            </div>

            {/* Community Statistics */}
            {isAdminRegistered && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Community Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Total Members</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">
                      {communityMembers.length + 1}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                      (1 Admin + {communityMembers.length} Customers)
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">Total Customers</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-300">
                      {communityMembers.length}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Community Members List */}
            {isAdminRegistered && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Community Members
                </h3>
                {communityMembers.length === 0 && !communityAdmin ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No members yet. Customers will appear here when they join.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {/* Admin at top */}
                    {communityAdmin && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border-2 border-purple-300 dark:border-purple-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-purple-500 text-xl">👑</span>
                          <div>
                            <p className="font-semibold text-purple-900 dark:text-purple-300">
                              {communityAdmin}
                            </p>
                            <p className="text-xs text-purple-700 dark:text-purple-400">Admin</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 text-xs font-semibold rounded-full">
                          ADMIN
                        </span>
                      </div>
                    )}
                    
                    {/* Customers */}
                    {communityMembers.length > 0 && (
                      <div className="space-y-2">
                        {communityMembers.map((phone, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-green-500 text-lg">📱</span>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {phone}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Customer</p>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-full">
                              CUSTOMER
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Activity Log */}
            {activityLog.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Community Activity Log
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {activityLog
                    .slice()
                    .reverse()
                    .map((log, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-start justify-between">
                          <p className="text-sm text-gray-900 dark:text-white flex-1">
                            {log.message}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-4 whitespace-nowrap">
                            {log.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Transparency Note */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-yellow-800 dark:text-yellow-300 italic">
                ℹ️ This WhatsApp community is simulated for demonstration purposes. No real WhatsApp groups or messages are created.
              </p>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Notifications
            </h2>
            {notifications.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            ) : (
              <div className="space-y-3">
                {notifications
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 ${
                        !notification.read ? "border-l-4 border-blue-500" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              notification.type === "warning"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : notification.type === "error"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            }`}>
                              {notification.type}
                            </span>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-gray-900 dark:text-white">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="ml-4 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
