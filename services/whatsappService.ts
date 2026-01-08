// WhatsApp Service - Automatically sends messages when shop data is entered

interface ShopData {
  shopName: string;
  businessType: string;
  websiteLink?: string;
}

const WHATSAPP_NUMBER = '8825484735';

/**
 * Sends WhatsApp message automatically when shop data is entered
 * Uses WhatsApp Web API format
 */
export async function sendWhatsAppMessage(shopData: ShopData): Promise<boolean> {
  try {
    const websiteLink = shopData.websiteLink || window.location.origin;
    const message = `Hello! 👋

New shop registration:
🏪 Shop Name: ${shopData.shopName}
📋 Business Type: ${shopData.businessType}
🌐 Website: ${websiteLink}

Thank you for using our services!`;

    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp Web URL
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new window/tab
    // In production, you might want to use WhatsApp Business API instead
    window.open(whatsappUrl, '_blank');
    
    // Alternative: Use WhatsApp API if you have API access
    // For now, we'll use the web link method
    console.log('WhatsApp message prepared:', message);
    
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}

/**
 * Alternative method using WhatsApp Business API (requires API setup)
 * This is a placeholder for when you have API credentials
 */
export async function sendWhatsAppViaAPI(
  shopData: ShopData,
  apiKey?: string,
  apiSecret?: string
): Promise<boolean> {
  if (!apiKey || !apiSecret) {
    // Fallback to web method
    return sendWhatsAppMessage(shopData);
  }

  try {
    const websiteLink = shopData.websiteLink || window.location.origin;
    const message = `Hello! 👋\n\nNew shop registration:\n🏪 Shop Name: ${shopData.shopName}\n📋 Business Type: ${shopData.businessType}\n🌐 Website: ${websiteLink}\n\nThank you for using our services!`;

    // In production, make actual API call to WhatsApp Business API
    // Example:
    // const response = await fetch('https://api.whatsapp.com/v1/messages', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${apiKey}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     to: WHATSAPP_NUMBER,
    //     message: message,
    //   }),
    // });

    console.log('WhatsApp API message (simulated):', message);
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp via API:', error);
    return false;
  }
}

/**
 * Sends WhatsApp message to customer when a sale is completed
 * @param phoneNumber Customer's phone number (with country code, e.g., +1234567890)
 * @param orderDetails Order information including items and total
 */
export async function sendSaleNotification(
  phoneNumber: string,
  orderDetails: {
    orderId: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
    date: string;
  }
): Promise<boolean> {
  try {
    // Format phone number (remove any spaces or dashes)
    const cleanPhoneNumber = phoneNumber.replace(/[\s-]/g, '');
    
    // Build order items list
    const itemsList = orderDetails.items
      .map((item) => `  • ${item.name} x${item.quantity} - ₹${item.price.toLocaleString('en-IN')}`)
      .join('\n');

    const message = `🎉 Thank you for your purchase!

📦 Order ID: ${orderDetails.orderId}
📅 Date: ${orderDetails.date}

🛒 Items:
${itemsList}

💰 Total Amount: ₹${orderDetails.total.toLocaleString('en-IN')}

Your order has been confirmed. We'll notify you once it's ready for pickup/delivery.

Thank you for shopping with us! 🙏`;

    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp Web URL
    const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`;
    
    // For server-side: return the URL to be used by API
    // For client-side: open WhatsApp in a new window/tab
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank');
    }
    
    console.log('WhatsApp sale notification prepared:', message);
    console.log('WhatsApp URL:', whatsappUrl);
    
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp sale notification:', error);
    return false;
  }
}

/**
 * Server-side function to send WhatsApp message via API (if you have WhatsApp Business API)
 * This is a placeholder for actual API integration
 */
export async function sendSaleNotificationViaAPI(
  phoneNumber: string,
  orderDetails: {
    orderId: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
    date: string;
  },
  apiKey?: string,
  apiSecret?: string
): Promise<boolean> {
  if (!apiKey || !apiSecret) {
    // Fallback to web method
    return sendSaleNotification(phoneNumber, orderDetails);
  }

  try {
    const cleanPhoneNumber = phoneNumber.replace(/[\s-]/g, '');
    
    const itemsList = orderDetails.items
      .map((item) => `  • ${item.name} x${item.quantity} - ₹${item.price.toLocaleString('en-IN')}`)
      .join('\n');

    const message = `🎉 Thank you for your purchase!\n\n📦 Order ID: ${orderDetails.orderId}\n📅 Date: ${orderDetails.date}\n\n🛒 Items:\n${itemsList}\n\n💰 Total Amount: ₹${orderDetails.total.toLocaleString('en-IN')}\n\nYour order has been confirmed. We'll notify you once it's ready for pickup/delivery.\n\nThank you for shopping with us! 🙏`;

    // In production, make actual API call to WhatsApp Business API
    // Example:
    // const response = await fetch('https://api.whatsapp.com/v1/messages', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${apiKey}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     to: cleanPhoneNumber,
    //     message: message,
    //   }),
    // });

    console.log('WhatsApp API sale notification (simulated):', message);
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp sale notification via API:', error);
    return false;
  }
}
