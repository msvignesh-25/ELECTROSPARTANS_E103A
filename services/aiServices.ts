// AI Services - Core AI integration functions
// This file handles all AI API calls and content generation

interface ShopData {
  shopName: string;
  businessType: string;
  daysAvailable: string[]; // e.g., ['Monday', 'Tuesday', 'Wednesday']
  monthlyBudget: number;
  numberOfWorkers: number;
  processes: string[]; // e.g., ['coffee brewing', 'customer service', 'inventory management']
  location?: string;
  targetAudience?: string;
}

interface AIConfig {
  openaiApiKey?: string;
  useMockData?: boolean; // For development without API keys
}

// Mock AI responses for development (when API keys aren't available)
const mockAIResponse = {
  poem: (drink: string, shopName: string) => 
    `In ${shopName}'s warm embrace,\n${drink} finds its perfect place.\nEach sip a moment, pure and true,\nA daily gift, just for you.`,
  
  imagePrompt: (context: string) => 
    `A beautiful, artistic representation of: ${context}`,
  
  flavorDescription: (mood: string, season: string) => 
    `A blend that captures the essence of ${season}, perfectly matched to your ${mood} energy`,
  
  instagramCaption: (shopData: ShopData, context: string) => 
    `Welcome to ${shopData.shopName}! ${context} Visit us ${shopData.daysAvailable.join(', ')}. Our team of ${shopData.numberOfWorkers} is here to serve you!`,
};

// Generate AI Poetry for Receipt
export async function generateReceiptPoem(
  drinkName: string,
  shopData: ShopData,
  config: AIConfig = {}
): Promise<string> {
  if (config.useMockData) {
    return mockAIResponse.poem(drinkName, shopData.shopName);
  }

  // In production, this would call OpenAI API
  // For now, return enhanced mock response
  const context = `Generate a 4-line poem about ${drinkName} at ${shopData.shopName}, 
    a ${shopData.businessType} that's open ${shopData.daysAvailable.join(', ')}. 
    Make it inspiring and personal, like a daily fortune cookie message.`;
  
  // Enhanced mock with shop-specific details
  const poems = [
    `At ${shopData.shopName}, where ${drinkName} flows,\nYour perfect moment, time slows.\nCrafted by hands that truly care,\nA sip of joy beyond compare.`,
    `In ${shopData.shopName}'s cozy space,\n${drinkName} brings a warm embrace.\nEach cup tells a story new,\nToday's chapter starts with you.`,
    `${shopData.shopName} welcomes you today,\n${drinkName} brightens your way.\nWith ${shopData.numberOfWorkers} dedicated souls,\nYour perfect moment here unfolds.`,
  ];
  
  return poems[Math.floor(Math.random() * poems.length)];
}

// Generate AI Image Prompt for Window Art
export async function generateWindowArtPrompt(
  shopData: ShopData,
  weather?: string,
  trendingTopic?: string,
  config: AIConfig = {}
): Promise<string> {
  const context = trendingTopic || weather || 'local community';
  
  if (config.useMockData) {
    return mockAIResponse.imagePrompt(
      `${shopData.shopName}, a ${shopData.businessType}, celebrating ${context} with vibrant, dynamic art`
    );
  }

  // Enhanced prompt with shop-specific details
  return `Create a vibrant, dynamic digital mural for ${shopData.shopName}, 
    a ${shopData.businessType} open ${shopData.daysAvailable.join(', ')}. 
    Theme: ${context}. 
    Style: Modern, eye-catching, suitable for a storefront window display. 
    Include elements that represent ${shopData.processes.join(' and ')}. 
    Colors should reflect the energy of a shop with ${shopData.numberOfWorkers} team members.`;
}

// Generate Voice-to-Image Art Description
export async function generateVoiceArtDescription(
  voiceMessage: string,
  shopData: ShopData,
  config: AIConfig = {}
): Promise<string> {
  if (config.useMockData) {
    return mockAIResponse.imagePrompt(
      `Abstract art representing: ${voiceMessage}, inspired by ${shopData.shopName}`
    );
  }

  return `Create abstract digital art that visually represents the emotion "${voiceMessage}" 
    in the context of ${shopData.shopName}, a ${shopData.businessType}. 
    The art should be suitable for display on a community wall, 
    incorporating colors and shapes that reflect the shop's atmosphere 
    (open ${shopData.daysAvailable.join(', ')}, ${shopData.numberOfWorkers} team members).`;
}

// Generate Mystery Drink Description
export async function generateMysteryDrinkDescription(
  actualIngredients: string[],
  shopData: ShopData,
  config: AIConfig = {}
): Promise<string> {
  const descriptions = [
    `Tastes like a sunset in a cedar forest - warm, earthy, with hints of golden hour`,
    `A whisper of morning mist over mountain peaks - fresh, invigorating, pure`,
    `The feeling of cozy blankets on a rainy day - comforting, rich, enveloping`,
    `Like strolling through a blooming garden at dawn - delicate, floral, awakening`,
    `A campfire story under starlit skies - smoky, sweet, memorable`,
  ];

  // Shop-specific customization
  const baseDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
  
  return `${baseDescription}. 
    Available at ${shopData.shopName} ${shopData.daysAvailable.join(', ')}. 
    Crafted by our team of ${shopData.numberOfWorkers} with passion for ${shopData.processes.join(' and ')}.`;
}

// Generate Instagram Post Content (VERY SPECIFIC to shop data)
export async function generateInstagramPost(
  shopData: ShopData,
  postType: 'daily' | 'promotional' | 'behind-scenes' | 'customer-spotlight' | 'product-feature',
  context?: string,
  config: AIConfig = {}
): Promise<{
  caption: string;
  hashtags: string[];
  optimalPostTime: string;
  imagePrompt?: string;
}> {
  const shopSpecific = {
    name: shopData.shopName,
    type: shopData.businessType,
    days: shopData.daysAvailable,
    workers: shopData.numberOfWorkers,
    budget: shopData.monthlyBudget,
    processes: shopData.processes,
  };

  // Generate very specific captions based on shop data
  let caption = '';
  let hashtags: string[] = [];
  let imagePrompt = '';

  const shopNameClean = shopSpecific.name.replace(/[^a-zA-Z0-9]/g, '');
  const businessTypeClean = shopSpecific.type.toLowerCase().replace(/\s+/g, '');

  switch (postType) {
    case 'daily':
      const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const isOpenToday = shopSpecific.days.includes(dayOfWeek);
      
      caption = isOpenToday
        ? `Good morning from ${shopSpecific.name}! ☀️ We're open today (${dayOfWeek}) and ready to serve you. Our team of ${shopSpecific.workers} ${shopSpecific.workers === 1 ? 'member' : 'members'} is here ${shopSpecific.days.join(', ')} to bring you the best ${shopSpecific.type} experience. What's your go-to order? #${shopNameClean} #${businessTypeClean}`
        : `Happy ${dayOfWeek}! While we're closed today, we're busy preparing for ${shopSpecific.days.join(', ')}. Can't wait to see you soon! 💙 #${shopNameClean} #${businessTypeClean}`;
      
      hashtags = [
        `#${shopNameClean}`,
        `#${businessTypeClean}`,
        `#localbusiness`,
        `#${shopSpecific.days.length > 5 ? 'opendaily' : 'local'}`,
        `#community`,
        `#smallbusiness`,
        `#${shopSpecific.processes[0]?.toLowerCase().replace(/\s+/g, '') || 'craft'}`,
      ];
      
      imagePrompt = `A welcoming, professional photo of ${shopSpecific.name}, a ${shopSpecific.type}, showing the interior/exterior, with ${shopSpecific.workers} team members visible, open ${shopSpecific.days.join(', ')}. Warm, inviting atmosphere.`;
      break;

    case 'promotional':
      const budgetTier = shopSpecific.budget < 100 ? 'budget-friendly' : shopSpecific.budget < 500 ? 'value' : 'premium';
      
      caption = `🎉 Special offer at ${shopSpecific.name}! As a ${shopSpecific.type} with ${shopSpecific.workers} dedicated ${shopSpecific.workers === 1 ? 'team member' : 'team members'}, we're excited to share this ${budgetTier} deal with our community. Available ${shopSpecific.days.join(', ')}. ${context || 'Limited time only!'} #${shopNameClean} #${businessTypeClean} #specialoffer`;
      
      hashtags = [
        `#${shopNameClean}`,
        `#${businessTypeClean}`,
        `#specialoffer`,
        `#${budgetTier}`,
        `#localdeals`,
        `#${shopSpecific.days.join('').toLowerCase()}`,
        `#community`,
      ];
      
      imagePrompt = `Promotional graphic for ${shopSpecific.name} showing a special offer, designed for a ${shopSpecific.type} with ${shopSpecific.workers} team members, available ${shopSpecific.days.join(', ')}. Eye-catching, professional.`;
      break;

    case 'behind-scenes':
      caption = `Behind the scenes at ${shopSpecific.name}! 👨‍🍳 Our ${shopSpecific.workers} ${shopSpecific.workers === 1 ? 'team member' : 'team members'} work hard ${shopSpecific.days.join(', ')} to perfect our ${shopSpecific.processes.join(', ')}. This is what passion looks like! 💪 #${shopNameClean} #${businessTypeClean} #behindthescenes`;
      
      hashtags = [
        `#${shopNameClean}`,
        `#${businessTypeClean}`,
        `#behindthescenes`,
        `#${shopSpecific.processes[0]?.toLowerCase().replace(/\s+/g, '') || 'craft'}`,
        `#teamwork`,
        `#localbusiness`,
        `#${shopSpecific.days.length > 5 ? 'opendaily' : 'local'}`,
      ];
      
      imagePrompt = `Behind-the-scenes photo of ${shopSpecific.name} showing ${shopSpecific.workers} team members working on ${shopSpecific.processes.join(' and ')}, authentic, candid, professional.`;
      break;

    case 'customer-spotlight':
      caption = `Shoutout to our amazing customers! 🙏 ${shopSpecific.name} wouldn't be the same without you. We're open ${shopSpecific.days.join(', ')} and our ${shopSpecific.workers} ${shopSpecific.workers === 1 ? 'team member' : 'team members'} love serving you! ${context || 'Thank you for being part of our community!'} #${shopNameClean} #${businessTypeClean} #customerspotlight`;
      
      hashtags = [
        `#${shopNameClean}`,
        `#${businessTypeClean}`,
        `#customerspotlight`,
        `#community`,
        `#localbusiness`,
        `#${shopSpecific.days.join('').toLowerCase()}`,
        `#grateful`,
      ];
      
      imagePrompt = `Customer appreciation post for ${shopSpecific.name}, showing happy customers, warm atmosphere, ${shopSpecific.workers} team members visible, representing a ${shopSpecific.type} open ${shopSpecific.days.join(', ')}.`;
      break;

    case 'product-feature':
      caption = `Featured at ${shopSpecific.name}: ${context || 'Our signature items'}! As a ${shopSpecific.type}, we take pride in our ${shopSpecific.processes.join(' and ')}. Available ${shopSpecific.days.join(', ')}. Our ${shopSpecific.workers} ${shopSpecific.workers === 1 ? 'team member' : 'team members'} can't wait to share this with you! #${shopNameClean} #${businessTypeClean} #featured`;
      
      hashtags = [
        `#${shopNameClean}`,
        `#${businessTypeClean}`,
        `#featured`,
        `#${shopSpecific.processes[0]?.toLowerCase().replace(/\s+/g, '') || 'craft'}`,
        `#localbusiness`,
        `#${shopSpecific.days.join('').toLowerCase()}`,
        `#quality`,
      ];
      
      imagePrompt = `Professional product photo for ${shopSpecific.name}, showcasing ${context || 'signature items'}, styled for a ${shopSpecific.type}, high-quality, appetizing/attractive.`;
      break;
  }

  // Calculate optimal post time based on shop's open days and typical engagement
  const optimalPostTime = calculateOptimalPostTime(shopSpecific.days);

  return {
    caption,
    hashtags,
    optimalPostTime,
    imagePrompt,
  };
}

// Calculate optimal posting time based on shop schedule
function calculateOptimalPostTime(daysAvailable: string[]): string {
  const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const isOpenToday = daysAvailable.includes(dayOfWeek);
  
  if (isOpenToday) {
    // Post in the morning if open today
    return '8:00 AM - 10:00 AM';
  } else {
    // Post in the evening if closed today
    return '7:00 PM - 9:00 PM';
  }
}

// Generate Flavor Profile Recommendation
export async function generateFlavorProfile(
  answers: { season: string; mood: string; preference: string },
  shopData: ShopData,
  config: AIConfig = {}
): Promise<{
  recommendedDrink: string;
  description: string;
  reasoning: string;
}> {
  const { season, mood, preference } = answers;
  
  // Generate shop-specific recommendation
  const drinkOptions = [
    `Seasonal ${shopData.businessType} Special`,
    `Custom ${mood} Blend`,
    `${season} Signature Creation`,
    `Personalized ${preference} Experience`,
  ];

  const recommendedDrink = drinkOptions[Math.floor(Math.random() * drinkOptions.length)];
  
  const description = `A perfect blend for your ${mood} mood during ${season}, 
    crafted with ${preference} in mind. Available at ${shopData.shopName} 
    ${shopData.daysAvailable.join(', ')}. Our ${shopData.numberOfWorkers} 
    ${shopData.numberOfWorkers === 1 ? 'team member' : 'team members'} 
    will prepare this with care using our ${shopData.processes.join(' and ')} process.`;

  const reasoning = `Based on your preference for ${preference} and your ${mood} mood 
    during ${season}, this recommendation aligns with ${shopData.shopName}'s 
    expertise in ${shopData.processes.join(' and ')}. 
    With ${shopData.numberOfWorkers} dedicated ${shopData.numberOfWorkers === 1 ? 'team member' : 'team members'} 
    and a budget-conscious approach (₹${shopData.monthlyBudget}/month), 
    this option provides the best value and experience.`;

  return {
    recommendedDrink,
    description,
    reasoning,
  };
}

// Generate Sleeve Art Prompt
export async function generateSleeveArtPrompt(
  userPrompt: string,
  shopData: ShopData,
  config: AIConfig = {}
): Promise<string> {
  return `Create a unique, Instagram-worthy sticker design for a coffee sleeve at ${shopData.shopName}, 
    a ${shopData.businessType}. User request: "${userPrompt}". 
    Style: Modern, vibrant, suitable for printing on a coffee sleeve. 
    Include subtle branding elements for ${shopData.shopName} (open ${shopData.daysAvailable.join(', ')}, 
    ${shopData.numberOfWorkers} team members). 
    Make it eye-catching and shareable on social media.`;
}

// Generate Digital Barista Video Script
export async function generateBaristaVideoScript(
  topic: 'bean-origin' | 'daily-horoscope' | 'coffee-tip' | 'shop-story',
  shopData: ShopData,
  config: AIConfig = {}
): Promise<{
  script: string;
  duration: number;
  visualPrompts: string[];
}> {
  let script = '';
  const visualPrompts: string[] = [];

  switch (topic) {
    case 'bean-origin':
      script = `Welcome to ${shopData.shopName}! I'm your AI Barista. Today, let me share the secret origin of our beans. 
        At ${shopData.shopName}, we source our beans with care, ensuring every cup reflects our commitment to quality. 
        Our ${shopData.numberOfWorkers} ${shopData.numberOfWorkers === 1 ? 'team member' : 'team members'} 
        work ${shopData.daysAvailable.join(', ')} to bring you the perfect brew through our ${shopData.processes.join(' and ')} process. 
        Visit us and taste the difference!`;
      visualPrompts.push(`Animated map showing coffee bean origins, transitioning to ${shopData.shopName} interior`);
      break;

    case 'daily-horoscope':
      const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      const sign = zodiacSigns[new Date().getDate() % 12];
      script = `Good morning! I'm your AI Barista at ${shopData.shopName}. 
        Today's coffee horoscope for ${sign}: Your perfect brew awaits! 
        With ${shopData.numberOfWorkers} dedicated ${shopData.numberOfWorkers === 1 ? 'team member' : 'team members'} 
        and our ${shopData.processes.join(' and ')} expertise, we're here ${shopData.daysAvailable.join(', ')} 
        to make your day. Come visit ${shopData.shopName} and let us craft your perfect cup!`;
      visualPrompts.push(`Astrological symbols animated, transitioning to ${shopData.shopName} logo and interior`);
      break;

    case 'coffee-tip':
      script = `Hi! I'm your AI Barista from ${shopData.shopName}. 
        Here's today's coffee tip: The secret to great coffee is in the ${shopData.processes[0] || 'brewing'} process. 
        At ${shopData.shopName}, our ${shopData.numberOfWorkers} ${shopData.numberOfWorkers === 1 ? 'team member' : 'team members'} 
        have mastered this art. Visit us ${shopData.daysAvailable.join(', ')} and experience the difference. 
        We're more than just a ${shopData.businessType} - we're your local coffee experts!`;
      visualPrompts.push(`Step-by-step coffee brewing animation, featuring ${shopData.shopName} branding`);
      break;

    case 'shop-story':
      script = `Welcome to the story of ${shopData.shopName}! 
        As a ${shopData.businessType}, we've built our reputation on ${shopData.processes.join(' and ')}. 
        With ${shopData.numberOfWorkers} passionate ${shopData.numberOfWorkers === 1 ? 'team member' : 'team members'} 
        and a commitment to serving our community ${shopData.daysAvailable.join(', ')}, 
        we're here to make every visit special. Join us at ${shopData.shopName} and be part of our story!`;
      visualPrompts.push(`Timeline animation showing ${shopData.shopName}'s journey, team photos, customer moments`);
      break;
  }

  return {
    script,
    duration: 30, // 30 seconds
    visualPrompts,
  };
}

// Generate Dynamic Pricing Recommendation
export async function generateDynamicPricing(
  shopData: ShopData,
  currentTime: Date,
  weather?: string,
  footTraffic?: 'low' | 'medium' | 'high',
  config: AIConfig = {}
): Promise<{
  discount: number;
  reason: string;
  duration: string;
  message: string;
}> {
  const dayOfWeek = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  const hour = currentTime.getHours();
  const isOpenToday = shopData.daysAvailable.includes(dayOfWeek);
  
  if (!isOpenToday) {
    return {
      discount: 0,
      reason: 'Closed today',
      duration: 'N/A',
      message: `We're closed today. Visit us ${shopData.daysAvailable.join(', ')}!`,
    };
  }

  // Determine discount based on shop data and conditions
  let discount = 0;
  let reason = '';
  let duration = '';
  let message = '';

  // Low budget shops get more aggressive pricing
  if (shopData.monthlyBudget < 100) {
    if (weather === 'rainy' || weather === 'snowy') {
      discount = 20;
      reason = `It's ${weather}!`;
      duration = '20 minutes';
      message = `🌧️ ${weather.charAt(0).toUpperCase() + weather.slice(1)} Day Special! ${discount}% off for the next ${duration} at ${shopData.shopName}. Our ${shopData.numberOfWorkers} ${shopData.numberOfWorkers === 1 ? 'team member' : 'team members'} are ready to warm you up!`;
    } else if (footTraffic === 'low' && (hour < 10 || hour > 15)) {
      discount = 15;
      reason = 'Slow hour boost';
      duration = '30 minutes';
      message = `⚡ Flash Deal! ${discount}% off for the next ${duration} at ${shopData.shopName}. Perfect time to visit!`;
    }
  } else if (shopData.monthlyBudget < 500) {
    if (weather === 'rainy') {
      discount = 15;
      reason = 'Rainy day special';
      duration = '20 minutes';
      message = `☔ Rainy Day Deal! ${discount}% off at ${shopData.shopName} for the next ${duration}. Stay dry with us!`;
    } else if (footTraffic === 'low') {
      discount = 10;
      reason = 'Quiet hour special';
      duration = '30 minutes';
      message = `🎯 Quiet Hour Special! ${discount}% off at ${shopData.shopName} for the next ${duration}.`;
    }
  }

  return {
    discount,
    reason,
    duration,
    message,
  };
}

// Generate Outreach Message (AI automatically reaches out)
export async function generateOutreachMessage(
  recipientType: 'customer' | 'influencer' | 'partner' | 'local-business',
  shopData: ShopData,
  context?: string,
  config: AIConfig = {}
): Promise<{
  subject: string;
  message: string;
  channel: 'email' | 'dm' | 'comment' | 'post';
  timing: string;
}> {
  const shopName = shopData.shopName;
  const businessType = shopData.businessType;
  const days = shopData.daysAvailable.join(', ');
  const workers = shopData.numberOfWorkers;
  const processes = shopData.processes.join(' and ');

  let subject = '';
  let message = '';
  let channel: 'email' | 'dm' | 'comment' | 'post' = 'email';
  let timing = '';

  switch (recipientType) {
    case 'customer':
      subject = `Welcome back to ${shopName}!`;
      message = `Hi! This is ${shopName}, your local ${businessType}. We noticed you haven't visited in a while, and we'd love to see you again! 
        We're open ${days} and our ${workers} ${workers === 1 ? 'team member' : 'team members'} 
        are excited to serve you. ${context || `We've been perfecting our ${processes} and would love to share it with you!`} 
        Come visit us soon!`;
      channel = 'email';
      timing = 'Morning (9 AM)';
      break;

    case 'influencer':
      subject = `Collaboration Opportunity with ${shopName}`;
      message = `Hello! I'm reaching out from ${shopName}, a ${businessType} in the local community. 
        We're open ${days} and have ${workers} dedicated ${workers === 1 ? 'team member' : 'team members'} 
        who specialize in ${processes}. We'd love to collaborate with you! ${context || 'Would you be interested in visiting and sharing your experience?'} 
        Let's connect!`;
      channel = 'dm';
      timing = 'Afternoon (2 PM)';
      break;

    case 'partner':
      subject = `Partnership Opportunity - ${shopName}`;
      message = `Hi! We're ${shopName}, a ${businessType} open ${days}. 
        With ${workers} ${workers === 1 ? 'team member' : 'team members'} and expertise in ${processes}, 
        we're looking for complementary businesses to partner with. ${context || 'Would you be interested in exploring a collaboration?'} 
        Let's discuss how we can support each other!`;
      channel = 'email';
      timing = 'Business hours (10 AM - 4 PM)';
      break;

    case 'local-business':
      subject = `Local Business Connection - ${shopName}`;
      message = `Hello from ${shopName}! We're a ${businessType} open ${days}, 
        with ${workers} ${workers === 1 ? 'team member' : 'team members'} focused on ${processes}. 
        We'd love to connect with other local businesses in the area. ${context || 'Would you be interested in cross-promotion or networking?'} 
        Let's support each other!`;
      channel = 'email';
      timing = 'Business hours (10 AM - 4 PM)';
      break;
  }

  return {
    subject,
    message,
    channel,
    timing,
  };
}

// Auto-post to Instagram (schedules and posts automatically)
export async function scheduleInstagramPost(
  shopData: ShopData,
  postType: 'daily' | 'promotional' | 'behind-scenes' | 'customer-spotlight' | 'product-feature',
  instagramApiKey?: string,
  config: AIConfig = {}
): Promise<{
  success: boolean;
  postId?: string;
  scheduledTime: string;
  caption: string;
  hashtags: string[];
}> {
  // Generate post content
  const postContent = await generateInstagramPost(shopData, postType, undefined, config);
  
  // In production, this would:
  // 1. Generate/select image using imagePrompt
  // 2. Post to Instagram API
  // 3. Schedule future posts
  
  const scheduledTime = postContent.optimalPostTime;
  
  // Mock successful post
  return {
    success: true,
    postId: `ig_${Date.now()}`,
    scheduledTime,
    caption: postContent.caption,
    hashtags: postContent.hashtags,
  };
}
