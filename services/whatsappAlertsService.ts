// WhatsApp Alerts Service - Sends alerts via WhatsApp for critical events

const WHATSAPP_NUMBER = '8825484735';

export interface AlertMessage {
  type: 'stock-exhausted' | 'stock-low' | 'sales-drop' | 'task-reminder' | 'special-occasion';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Date;
}

// Send WhatsApp alert
export async function sendWhatsAppAlert(alert: AlertMessage): Promise<boolean> {
  try {
    const encodedMessage = encodeURIComponent(alert.message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Open WhatsApp in new window
    window.open(whatsappUrl, '_blank');
    
    console.log('WhatsApp alert prepared:', alert.message);
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
