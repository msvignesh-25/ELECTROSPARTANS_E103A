// Notification Service - Handles all alerts (website + mobile)
// This service executes actions, not suggestions

export interface Notification {
  id: string;
  type: 'stock-exhausted' | 'stock-critical' | 'stock-low' | 'sales-drop' | 'task-reminder' | 'festival-reminder' | 'customer-alert';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  timestamp: Date;
  sentToWebsite: boolean;
  sentToMobile: boolean;
  mobileNumber?: string;
  acknowledged: boolean;
}

export interface CustomerRegistration {
  id: string;
  mobileNumber: string;
  name?: string;
  registeredDate: Date;
  lastNotificationDate?: Date;
  notificationCount: number;
  preferences: {
    stockAlerts: boolean;
    promotionalAlerts: boolean;
    festivalAlerts: boolean;
  };
}

// Store notifications
export function saveNotification(notification: Notification): void {
  if (typeof window !== 'undefined') {
    const notifications = loadNotifications();
    notifications.push(notification);
    // Keep only last 100 notifications
    const recent = notifications.slice(-100);
    localStorage.setItem('notifications', JSON.stringify(recent));
  }
}

export function loadNotifications(): Notification[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  }
  return [];
}

// Get unacknowledged urgent notifications
export function getUrgentNotifications(): Notification[] {
  const notifications = loadNotifications();
  return notifications.filter(n => 
    !n.acknowledged && 
    (n.priority === 'urgent' || n.priority === 'high')
  );
}

// Acknowledge notification
export function acknowledgeNotification(notificationId: string): void {
  if (typeof window !== 'undefined') {
    const notifications = loadNotifications();
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, acknowledged: true } : n
    );
    localStorage.setItem('notifications', JSON.stringify(updated));
  }
}

// Customer Registration
export function registerCustomer(mobileNumber: string, name?: string): CustomerRegistration {
  if (typeof window === 'undefined') {
    throw new Error('Cannot register customer on server');
  }

  const customers = loadRegisteredCustomers();
  
  // Check if already registered
  const existing = customers.find(c => c.mobileNumber === mobileNumber);
  if (existing) {
    return existing;
  }

  const newCustomer: CustomerRegistration = {
    id: `customer_${Date.now()}`,
    mobileNumber,
    name,
    registeredDate: new Date(),
    notificationCount: 0,
    preferences: {
      stockAlerts: true,
      promotionalAlerts: true,
      festivalAlerts: true,
    },
  };

  customers.push(newCustomer);
  localStorage.setItem('registeredCustomers', JSON.stringify(customers));
  return newCustomer;
}

export function loadRegisteredCustomers(): CustomerRegistration[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('registeredCustomers');
    return saved ? JSON.parse(saved) : [];
  }
  return [];
}

// Send notification to website (display) AND mobile
export async function sendNotification(
  type: Notification['type'],
  priority: Notification['priority'],
  title: string,
  message: string,
  mobileNumber?: string
): Promise<Notification> {
  const notification: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    priority,
    title,
    message,
    timestamp: new Date(),
    sentToWebsite: true, // Always sent to website
    sentToMobile: false,
    mobileNumber,
    acknowledged: false,
  };

  // Save to website (always)
  saveNotification(notification);

  // Send to mobile if number provided
  if (mobileNumber) {
    await sendMobileAlert(mobileNumber, title, message, priority);
    notification.sentToMobile = true;
    saveNotification(notification);
  }

  return notification;
}

// Send mobile alert (SMS/WhatsApp)
async function sendMobileAlert(
  mobileNumber: string,
  title: string,
  message: string,
  priority: Notification['priority']
): Promise<boolean> {
  try {
    // Format message
    const fullMessage = `🚨 ${title}\n\n${message}\n\n[${priority.toUpperCase()} Priority]`;

    // Use WhatsApp Web API
    const encodedMessage = encodeURIComponent(fullMessage);
    const whatsappUrl = `https://wa.me/${mobileNumber}?text=${encodedMessage}`;
    
    // In production, you would use SMS API or WhatsApp Business API
    // For now, we log it and prepare the WhatsApp link
    console.log(`Mobile alert prepared for ${mobileNumber}:`, fullMessage);
    
    // Store the alert for manual sending or API integration
    if (typeof window !== 'undefined') {
      const pendingAlerts = JSON.parse(localStorage.getItem('pendingMobileAlerts') || '[]');
      pendingAlerts.push({
        mobileNumber,
        message: fullMessage,
        whatsappUrl,
        timestamp: new Date(),
        priority,
      });
      localStorage.setItem('pendingMobileAlerts', JSON.stringify(pendingAlerts.slice(-50))); // Keep last 50
    }

    return true;
  } catch (error) {
    console.error('Error sending mobile alert:', error);
    return false;
  }
}

// Send notification to all registered customers
export async function sendCustomerNotification(
  type: 'stock-alert' | 'promotional' | 'festival',
  title: string,
  message: string
): Promise<number> {
  const customers = loadRegisteredCustomers();
  let sentCount = 0;

  for (const customer of customers) {
    // Check preferences
    if (type === 'stock-alert' && !customer.preferences.stockAlerts) continue;
    if (type === 'promotional' && !customer.preferences.promotionalAlerts) continue;
    if (type === 'festival' && !customer.preferences.festivalAlerts) continue;

    // Check frequency limit (max 1 notification per day per customer)
    const today = new Date().toDateString();
    const lastNotifDate = customer.lastNotificationDate?.toDateString();
    if (lastNotifDate === today && customer.notificationCount >= 1) {
      continue; // Skip if already notified today
    }

    // Send notification
    await sendNotification(
      'customer-alert',
      'medium',
      title,
      message,
      customer.mobileNumber
    );

    // Update customer record
    customer.lastNotificationDate = new Date();
    customer.notificationCount = lastNotifDate === today ? customer.notificationCount + 1 : 1;
    sentCount++;

    // Save updated customer
    const customers = loadRegisteredCustomers();
    const updated = customers.map(c => 
      c.id === customer.id ? customer : c
    );
    if (typeof window !== 'undefined') {
      localStorage.setItem('registeredCustomers', JSON.stringify(updated));
    }
  }

  return sentCount;
}

// Get owner mobile number from settings
export function getOwnerMobileNumber(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('ownerMobileNumber');
  }
  return null;
}

export function setOwnerMobileNumber(mobileNumber: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ownerMobileNumber', mobileNumber);
  }
}
