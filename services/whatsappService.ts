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
