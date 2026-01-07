// WhatsApp Alerts Service - Sends alerts via WhatsApp for critical events

export interface AlertMessage {
  type: 'stock-exhausted' | 'stock-low' | 'sales-drop' | 'task-reminder' | 'special-occasion';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Date;
}

// Default notification number (as per requirement)
const DEFAULT_NOTIFICATION_NUMBER = '8825484735';

// Get owner mobile number from settings
function getOwnerMobileNumber(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('ownerMobileNumber');
  }
  return null;
}

// Send WhatsApp alert to owner's mobile number or default number
export async function sendWhatsAppAlert(alert: AlertMessage, customMobileNumber?: string): Promise<boolean> {
  try {
    // Priority: custom number > owner's number > default number
    let mobileNumber = customMobileNumber || getOwnerMobileNumber() || DEFAULT_NOTIFICATION_NUMBER;
    
    // For stock alerts, always use default number
    if (alert.type === 'stock-exhausted' || alert.type === 'stock-low') {
      mobileNumber = DEFAULT_NOTIFICATION_NUMBER;
    }

    const encodedMessage = encodeURIComponent(alert.message);
    const whatsappUrl = `https://wa.me/${mobileNumber}?text=${encodedMessage}`;
    
    // In production, you would use WhatsApp Business API
    // For now, we prepare the URL and log it
    // The URL can be opened programmatically or stored for batch sending
    
    // Store alert for sending (in production, this would trigger actual API call)
    if (typeof window !== 'undefined') {
      const pendingAlerts = JSON.parse(localStorage.getItem('pendingWhatsAppAlerts') || '[]');
      pendingAlerts.push({
        mobileNumber,
        message: alert.message,
        whatsappUrl,
        timestamp: new Date(),
        priority: alert.priority,
        type: alert.type,
      });
      // Keep last 50 alerts
      localStorage.setItem('pendingWhatsAppAlerts', JSON.stringify(pendingAlerts.slice(-50)));
    }
    
    console.log(`WhatsApp alert prepared for ${mobileNumber}:`, alert.message);
    
    // Optionally open WhatsApp Web (comment out in production)
    // window.open(whatsappUrl, '_blank');
    
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp alert:', error);
    return false;
  }
}

// Generate stock exhaustion alert
export function generateStockExhaustedAlert(productName: string): AlertMessage {
  return {
    type: 'stock-exhausted',
    message: `🚨 URGENT: Stock Alert

Product: ${productName}
Status: OUT OF STOCK

Please restock immediately to avoid losing sales!`,
    priority: 'urgent',
    timestamp: new Date(),
  };
}

// Generate low stock alert
export function generateLowStockAlert(productName: string, currentStock: number): AlertMessage {
  return {
    type: 'stock-low',
    message: `⚠️ Stock Alert

Product: ${productName}
Current Stock: ${currentStock} units
Status: LOW STOCK

Consider restocking soon to avoid stockout.`,
    priority: 'high',
    timestamp: new Date(),
  };
}

// Generate sales drop alert
export function generateSalesDropAlert(
  currentRevenue: number,
  previousRevenue: number,
  dropPercentage: number
): AlertMessage {
  return {
    type: 'sales-drop',
    message: `📉 Sales Alert

Current Revenue: ₹${currentRevenue.toLocaleString('en-IN')}
Previous Period: ₹${previousRevenue.toLocaleString('en-IN')}
Drop: ${dropPercentage.toFixed(1)}%

Sales have dropped significantly. Review your marketing strategy and promotions.`,
    priority: 'high',
    timestamp: new Date(),
  };
}

// Generate task reminder alert
export function generateTaskReminderAlert(task: string, assignedTo: string): AlertMessage {
  return {
    type: 'task-reminder',
    message: `📅 Task Reminder

Assigned to: ${assignedTo}
Task: ${task}

Don't forget to complete this task today!`,
    priority: 'medium',
    timestamp: new Date(),
  };
}

// Generate special occasion alert
export function generateSpecialOccasionAlert(occasionName: string, daysUntil: number): AlertMessage {
  return {
    type: 'special-occasion',
    message: `🎉 Special Occasion Reminder

${occasionName} is in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}!

Remember to:
- Update webpage with special promotions
- Post on Instagram about special offers
- Prepare special products/services

This is a great sales opportunity!`,
    priority: 'medium',
    timestamp: new Date(),
  };
}

// Check if sales dropped significantly (more than 20%)
export function checkSalesDrop(
  currentRevenue: number,
  previousRevenue: number
): boolean {
  if (previousRevenue === 0) return false;
  
  const dropPercentage = ((previousRevenue - currentRevenue) / previousRevenue) * 100;
  return dropPercentage > 20; // Alert if sales dropped more than 20%
}
