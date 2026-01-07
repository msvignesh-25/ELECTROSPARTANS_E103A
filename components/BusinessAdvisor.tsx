'use client';

import React, { useState, useEffect } from 'react';
import { setOwnerMobileNumber } from '@/services/notificationService';
import { generateDetailedPlan, type DetailedPlan } from '@/services/detailedMarketingPlanService';

interface BusinessInputs {
  businessType: string;
  budget: string;
  timePerDay: string;
  numberOfWorkers: string;
  growthGoal: 'visibility' | 'sales' | 'expansion';
  targetTimeSpan: string;
  ownerMobile?: string;
}

type TaskCategory = 'AI-Prepared' | 'Human Review Required' | 'Manual Action';
type TaskStatus = 'pending' | 'completed' | 'skipped';

interface TaskItem {
  id: string;
  text: string;
  category: TaskCategory;
  reasoning: string;
  aiPreparedContent?: {
    captions?: string[];
    contentIdeas?: string[];
    postingTimes?: string[];
    checklist?: string[];
  };
}

interface DayPlan {
  day: string;
  tasks: TaskItem[];
}

interface Recommendation {
  analysis: string;
  methods: string[];
  automatedTasks: string[];
  aiAssistedTasks: string[];
  humanOnlyTasks: string[];
  weeklyPlan: DayPlan[];
  collaborations?: string[];
  fundraising?: string[];
  aiContributionSummary?: string;
}

export default function BusinessAdvisor() {
  const [inputs, setInputs] = useState<BusinessInputs>({
    businessType: '',
    budget: '',
    timePerDay: '',
    numberOfWorkers: '',
    growthGoal: 'visibility',
    targetTimeSpan: '',
    ownerMobile: '',
  });
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null);
  const [detailedPlan, setDetailedPlan] = useState<DetailedPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [taskStatuses, setTaskStatuses] = useState<Record<string, TaskStatus>>({});

  // Load task statuses from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('businessAdvisor_taskStatuses');
      if (saved) {
        try {
          setTaskStatuses(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load task statuses:', e);
        }
      }
    }
  }, []);

  // Save task statuses to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(taskStatuses).length > 0) {
      localStorage.setItem('businessAdvisor_taskStatuses', JSON.stringify(taskStatuses));
    }
  }, [taskStatuses]);

  // Helper: Generate AI-prepared content based on task type and context
  const generateAIPreparedContent = (
    taskText: string,
    businessType: string,
    growthGoal: string,
    category: TaskCategory
  ) => {
    const content: {
      captions?: string[];
      postingTimes?: string[];
      contentIdeas?: string[];
      checklist?: string[];
    } = {};

    // Generate social media captions
    if (taskText.toLowerCase().includes('social media') || taskText.toLowerCase().includes('post')) {
      content.captions = [
        `Exciting things happening at ${businessType}! Stay tuned for updates. 🎉`,
        `We're grateful for our amazing customers at ${businessType}. Thank you for your support! 🙏`,
        `New updates and improvements at ${businessType} - we're constantly working to serve you better. 💪`,
        `${businessType} is here for you! Have questions? Feel free to reach out. 💬`,
      ];

      if (growthGoal === 'sales') {
        content.captions.push(
          `Special offer this week at ${businessType}! Don't miss out. 🎁`,
          `Limited time promotion - visit us today at ${businessType}! ⏰`
        );
      } else if (growthGoal === 'visibility') {
        content.captions.push(
          `Welcome to ${businessType}! We're your local experts. 📍`,
          `Did you know about ${businessType}? We're here in your community! 🏘️`
        );
      }

      // Posting time windows (optimal engagement times)
      content.postingTimes = [
        '8:00 AM - 10:00 AM (Morning coffee/commute)',
        '12:00 PM - 1:00 PM (Lunch break)',
        '5:00 PM - 7:00 PM (Evening after work)',
        '7:00 PM - 9:00 PM (Evening relaxation)',
      ];
    }

    // Generate content ideas
    if (taskText.toLowerCase().includes('content') || taskText.toLowerCase().includes('create')) {
      content.contentIdeas = [
        `Behind-the-scenes look at ${businessType}`,
        `Customer success stories or testimonials`,
        `Tips and educational content related to ${businessType}`,
        `Seasonal or holiday-themed content`,
        `Product/service highlights and features`,
        `Community involvement and events`,
      ];
    }

    // Generate checklists for structured tasks
    if (taskText.toLowerCase().includes('setup') || taskText.toLowerCase().includes('update')) {
      content.checklist = [
        'Verify all information is accurate',
        'Add high-quality photos (at least 3-5)',
        'Include business hours and contact information',
        'Add relevant keywords for search',
        'Review and respond to any existing reviews',
        'Keep information updated regularly',
      ];
    }

    return Object.keys(content).length > 0 ? content : undefined;
  };

  // Helper: Categorize task based on its nature
  const categorizeTask = (taskText: string): TaskCategory => {
    const lower = taskText.toLowerCase();
    
    // AI-Prepared: Content creation, writing, scheduling
    if (
      lower.includes('post') ||
      lower.includes('create content') ||
      lower.includes('caption') ||
      lower.includes('generate') ||
      lower.includes('write') ||
      lower.includes('draft') ||
      (lower.includes('social media') && lower.includes('update'))
    ) {
      return 'AI-Prepared';
    }
    
    // Human Review Required: Tasks that need approval or personal touch
    if (
      lower.includes('review') ||
      lower.includes('approve') ||
      lower.includes('check') ||
      lower.includes('update') ||
      lower.includes('analyze') ||
      lower.includes('optimize') ||
      lower.includes('verify')
    ) {
      return 'Human Review Required';
    }
    
    // Manual Action: Direct human interaction
    return 'Manual Action';
  };

  // Helper: Generate reasoning for why a task is suggested
  const generateReasoning = (
    taskText: string,
    businessType: string,
    budget: number,
    timePerDay: number,
    workers: number,
    growthGoal: string,
    day: string,
    hasLimitedTime: boolean
  ): string => {
    const lower = taskText.toLowerCase();
    let reasoning = '';

    // Base reasoning on task type
    if (lower.includes('social media') || lower.includes('post')) {
      reasoning = `Social media engagement is crucial for ${growthGoal === 'visibility' ? 'getting your business noticed' : growthGoal === 'sales' ? 'promoting your offers' : 'showing your business growth'}. `;
      if (timePerDay >= 1.5) {
        reasoning += `With ${timePerDay} hours available, you can maintain regular posting. `;
      }
      reasoning += `Posts help ${businessType} stay top-of-mind with customers.`;
    } else if (lower.includes('google business') || lower.includes('directory')) {
      reasoning = `Local search visibility is essential - 46% of Google searches are local. `;
      if (budget < 100) {
        reasoning += `Since your budget is ₹${budget.toLocaleString('en-IN')}, free listings are your best investment. `;
      }
      reasoning += `Optimizing your ${businessType} profile helps customers find you.`;
    } else if (lower.includes('customer') || lower.includes('reach out')) {
      reasoning = `Direct customer contact has the highest conversion rate. `;
      if (workers >= 2) {
        reasoning += `With ${workers} workers, you can divide outreach efforts. `;
      } else {
        reasoning += `Even with limited staff, personal outreach builds strong relationships. `;
      }
      reasoning += `${day} is ideal for follow-ups as customers are back in their weekly routine.`;
    } else if (lower.includes('photo') || lower.includes('photos')) {
      reasoning = `Visual content gets 94% more views than text-only. `;
      if (growthGoal === 'visibility') {
        reasoning += `High-quality photos help your ${businessType} stand out in local searches and social media. `;
      } else if (growthGoal === 'sales') {
        reasoning += `Appealing photos of your products/services can directly influence purchasing decisions. `;
      }
      reasoning += `Fresh photos keep your online presence current and engaging.`;
    } else if (lower.includes('review') || lower.includes('feedback')) {
      reasoning = `Customer reviews influence 93% of purchasing decisions. `;
      if (workers >= 1) {
        reasoning += `Responding to reviews shows ${businessType} values customer input and builds trust. `;
      }
      reasoning += `${day} is a good time to catch up on any accumulated reviews.`;
    } else if (lower.includes('promotion') || lower.includes('offer') || lower.includes('discount')) {
      reasoning = `Limited-time offers create urgency and drive immediate sales. `;
      if (budget < 100) {
        reasoning += `Since your budget is ₹${budget.toLocaleString('en-IN')}, promotional messaging is a cost-effective way to boost sales. `;
      }
      reasoning += `${day} is strategic for launching offers as it gives customers time to respond before the weekend.`;
    } else if (lower.includes('network') || lower.includes('event') || lower.includes('partner')) {
      reasoning = `Building relationships is key for ${growthGoal === 'expansion' ? 'scaling your business' : 'long-term growth'}. `;
      if (workers >= 2) {
        reasoning += `With ${workers} team members, networking efforts can be shared. `;
      }
      reasoning += `Face-to-face connections often lead to the best opportunities.`;
    } else if (lower.includes('research') || lower.includes('analyze')) {
      reasoning = `Informed decisions are crucial for ${growthGoal === 'expansion' ? 'successful expansion' : 'effective marketing'}. `;
      if (timePerDay >= 2) {
        reasoning += `With ${timePerDay} hours available, dedicated research time prevents costly mistakes. `;
      }
      reasoning += `${day} provides a focused environment for analysis without weekend distractions.`;
    } else {
      // Generic reasoning based on constraints
      reasoning = `This task aligns with your goal to ${growthGoal}. `;
      if (hasLimitedTime) {
        reasoning += `Given ${timePerDay} hours per day, this task is prioritized for maximum impact. `;
      }
      reasoning += `${day} is strategically chosen to fit your weekly schedule.`;
    }

    return reasoning;
  };

  // Helper: Convert plain task strings to enhanced TaskItem objects
  const createTaskItem = (
    taskText: string,
    day: string,
    businessType: string,
    budget: number,
    timePerDay: number,
    workers: number,
    growthGoal: string,
    hasLimitedTime: boolean,
    dayIndex: number,
    taskIndex: number
  ): TaskItem => {
    const taskId = `${day.toLowerCase()}_${dayIndex}_${taskIndex}_${taskText.substring(0, 20).replace(/\s/g, '_')}`;
    const category = categorizeTask(taskText);
    const reasoning = generateReasoning(taskText, businessType, budget, timePerDay, workers, growthGoal, day, hasLimitedTime);
    const aiPreparedContent = category === 'AI-Prepared' 
      ? generateAIPreparedContent(taskText, businessType, growthGoal, category)
      : undefined;

    return {
      id: taskId,
      text: taskText,
      category,
      reasoning,
      aiPreparedContent,
    };
  };

  // Helper: Get feedback from previous plans to adjust recommendations
  const getFeedbackAdjustment = (taskText: string, businessType: string): number => {
    // Check if similar tasks were completed/skipped
    const lower = taskText.toLowerCase();
    let adjustment = 0;

    Object.entries(taskStatuses).forEach(([taskId, status]) => {
      const taskIdLower = taskId.toLowerCase();
      // If similar task was completed, slightly boost priority
      if (status === 'completed' && (
        (lower.includes('social') && taskIdLower.includes('social')) ||
        (lower.includes('customer') && taskIdLower.includes('customer')) ||
        (lower.includes('photo') && taskIdLower.includes('photo'))
      )) {
        adjustment += 0.1; // Small boost
      }
      // If similar task was skipped multiple times, reduce priority
      if (status === 'skipped' && (
        (lower.includes('social') && taskIdLower.includes('social')) ||
        (lower.includes('network') && taskIdLower.includes('network'))
      )) {
        adjustment -= 0.05; // Small reduction
      }
    });

    return Math.min(Math.max(adjustment, -0.2), 0.2); // Cap between -0.2 and 0.2
  };

  // Helper: Update task status
  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTaskStatuses((prev) => ({
      ...prev,
      [taskId]: status,
    }));
  };

  const generateRecommendations = (data: BusinessInputs): Recommendation => {
    const budget = parseFloat(data.budget) || 0;
    const timePerDay = parseFloat(data.timePerDay) || 0;
    const workers = parseInt(data.numberOfWorkers) || 1;
    const timeSpan = parseInt(data.targetTimeSpan) || 30;
    const growthGoal = data.growthGoal;

    // Analyze the situation
    const isLowBudget = budget < 100;
    const isVeryLowBudget = budget < 50;
    const hasLimitedTime = timePerDay < 2;
    const hasVeryLimitedTime = timePerDay < 1;
    const isSmallTeam = workers <= 2;
    const hasMinimalResources = isLowBudget && hasLimitedTime && isSmallTeam;
    const canDoSocialMedia = timePerDay >= 1 && workers >= 1 && !hasVeryLimitedTime;

    // Build analysis following the new format: Business Summary + Growth Goal Identified
    let analysis = `1) BUSINESS SUMMARY\n\n`;
    analysis += `You run a ${data.businessType || 'business'} with `;
    if (hasMinimalResources) {
      analysis += 'very limited resources. ';
    } else if (isLowBudget || hasLimitedTime || isSmallTeam) {
      analysis += 'limited resources. ';
    } else {
      analysis += 'moderate resources. ';
    }
    
    analysis += `You have ₹${budget.toLocaleString('en-IN')} per month, ${timePerDay} hours per day, and ${workers} worker${workers !== 1 ? 's' : ''}. `;
    
    if (hasMinimalResources) {
      analysis += 'Given these constraints, we\'ll prioritize the most impactful, low-cost methods that require minimal ongoing effort.';
    } else if (hasLimitedTime && isLowBudget) {
      analysis += 'Since time and budget are limited, we\'ll prioritize methods that can be automated or require minimal daily effort.';
    } else if (hasLimitedTime) {
      analysis += 'With limited time available, we\'ll focus on efficient methods that can be managed with minimal daily involvement.';
    } else if (isLowBudget) {
      analysis += 'With a limited budget, we\'ll emphasize free and low-cost strategies that maximize your resources.';
    }
    
    analysis += `\n\n2) GROWTH GOAL IDENTIFIED\n\n`;
    // Goal-specific analysis with clear explanation
    if (growthGoal === 'visibility') {
      analysis += `Your selected goal is: INCREASE VISIBILITY within ${timeSpan} days.\n\n`;
      analysis += `This means focusing on awareness and discovery - getting your business noticed online and in your local community. `;
      analysis += `We will NOT focus heavily on sales or investment. Instead, we'll prioritize local search presence, community outreach, and basic social media presence to help potential customers find and discover your business.`;
    } else if (growthGoal === 'sales') {
      analysis += `Your selected goal is: INCREASE SALES within ${timeSpan} days.\n\n`;
      analysis += `This means focusing on conversion-driven methods - turning awareness into revenue. `;
      analysis += `We will prioritize offers, repeat customers, direct communication, and limited promotions. Visibility methods are secondary. Our primary focus is driving immediate revenue through targeted marketing and customer engagement.`;
    } else if (growthGoal === 'expansion') {
      analysis += `Your selected goal is: BUSINESS EXPANSION within ${timeSpan} days.\n\n`;
      analysis += `This means focusing on scalability, partnerships, collaborations, and long-term planning. `;
      analysis += `We will avoid short-term promotional tactics. Instead, we'll focus on market research, strategic partnerships, scaling operations, and preparing for growth opportunities that allow your business to expand sustainably.`;
    }

    // Goal-specific methods with explanations (WHY each method fits the goal)
    const methods: string[] = [];
    
    if (growthGoal === 'visibility') {
      // Visibility-focused methods with WHY explanations - VERY SPECIFIC to shop data
      const businessTypeLower = (data.businessType || '').toLowerCase();
      const isFoodService = businessTypeLower.includes('coffee') || businessTypeLower.includes('cafe') || businessTypeLower.includes('restaurant') || businessTypeLower.includes('bakery');
      const isServiceBusiness = businessTypeLower.includes('repair') || businessTypeLower.includes('service') || businessTypeLower.includes('shop');
      
      methods.push(`Google Business Profile setup and optimization for ${data.businessType || 'your business'} (WHY: Free and essential - when people search "${data.businessType || 'your business type'}" in your area, you'll appear in results. With ₹${budget.toLocaleString('en-IN')}/month budget, this free method is perfect for your ${workers === 1 ? 'solo operation' : `${workers}-person team`})`);
      
      if (isFoodService) {
        methods.push(`Submit to food-specific directories like Zomato, Swiggy, and local food blogs (WHY: Food businesses get ${budget < 100 ? '80%' : '60%'} of customers from food discovery platforms. With ${workers} ${workers === 1 ? 'worker' : 'workers'} handling ${data.businessType || 'operations'}, online visibility is crucial)`);
      } else if (isServiceBusiness) {
        methods.push(`Submit to service directories like Justdial, Sulekha, and local business listings (WHY: Service businesses get ${budget < 100 ? '70%' : '50%'} of customers from local search. Your ${workers} ${workers === 1 ? 'team member' : 'team members'} can handle inquiries from these platforms)`);
      } else {
        methods.push(`Submit to all major local directories like Yelp, Yellow Pages, Bing Places (WHY: Each directory listing increases discovery chances. With ${workers} ${workers === 1 ? 'person' : 'people'} and ₹${budget.toLocaleString('en-IN')}/month, free listings maximize your visibility)`);
      }
      
      methods.push(`Focus on collecting and responding to online reviews (WHY: Reviews improve local search ranking. With ${workers} ${workers === 1 ? 'worker' : 'workers'} and ${timePerDay} hours/day, responding to reviews takes ${workers === 1 ? '15 minutes' : '10 minutes'} daily but significantly boosts visibility)`);
      
      if (canDoSocialMedia) {
        if (timePerDay >= 1.5) {
          methods.push('Instagram account with daily posts focusing on brand awareness (WHY: Visual platform helps people discover your business through hashtags and local discovery features)');
        }
        if (timePerDay >= 2) {
          methods.push('Facebook business page with regular updates (WHY: Facebook\'s local business features help neighbors and community members find you)');
        }
        if (timePerDay >= 2 && workers >= 2) {
          methods.push('YouTube channel with behind-the-scenes and educational content (WHY: Video content ranks well in search and helps establish your business as a local authority)');
        }
      }
      
      methods.push('Local SEO optimization with keywords, location tags, and local backlinks (WHY: When people search "your business type near me", optimized content helps you appear first)');
      methods.push('Participate in local community events for brand visibility (WHY: Face-to-face presence builds local recognition and word-of-mouth awareness)');
      methods.push('Engage with local community groups and forums (WHY: Being active in local online communities puts your business name in front of potential customers)');
      
      if (budget >= 50) {
        methods.push(`Optional: Google Ads local search campaigns (WHY: Paid ads appear at the top of search results, increasing visibility for people actively searching for your services. Budget: ₹${Math.min(budget * 0.4, 15000).toLocaleString('en-IN')}/month)`);
      }
      
    } else if (growthGoal === 'sales') {
      // Sales-focused methods with WHY explanations
      methods.push('Google Business Profile with special offers and promotions prominently displayed (WHY: People already searching for you will see your offers immediately, increasing conversion chances)');
      methods.push('Create and promote limited-time discounts or special offers (WHY: Urgency and value drive immediate purchasing decisions from existing and potential customers)');
      methods.push('Direct customer outreach via phone/email to previous customers (WHY: Past customers have the highest conversion rate - personal outreach converts better than broad advertising)');
      
      if (!hasVeryLimitedTime) {
        methods.push('In-store promotions and upselling strategies (WHY: Converting existing visitors to higher-value purchases directly increases revenue)');
        methods.push('Customer referral program with incentives (WHY: Existing customers bring new customers who are pre-qualified and more likely to purchase)');
        methods.push('Follow-up campaigns for customers who haven\'t purchased recently (WHY: Re-engaging lapsed customers recovers lost revenue with minimal acquisition cost)');
      }
      
      if (canDoSocialMedia && timePerDay >= 1.5) {
        methods.push('Instagram/Facebook with promotional posts and sales announcements (WHY: Social media reaches existing followers who already know your business, making promotional posts highly effective for sales)');
        methods.push('Email marketing campaigns for special offers (WHY: Email has high conversion rates and allows direct communication with customers interested in your offers)');
      }
      
      methods.push('Optimize pricing and create urgency with limited stock or flash sales (WHY: Scarcity and time pressure motivate immediate purchase decisions)');
      methods.push('Partner with complementary businesses for cross-promotions (WHY: Access to partner\'s customer base expands your reach to people likely to purchase)');
      
      if (budget >= 100) {
        methods.push(`Optional: Targeted social media ads promoting specific products/services (WHY: Paid ads can target people likely to purchase, driving immediate sales. Budget: ₹${Math.min(budget * 0.6, 30000).toLocaleString('en-IN')}/month)`);
      }
      
    } else if (growthGoal === 'expansion') {
      // Expansion-focused methods with WHY explanations
      methods.push('Market research for potential new locations or target markets (WHY: Understanding new markets prevents costly expansion mistakes and identifies best opportunities)');
      methods.push('Analyze competitors and identify expansion opportunities (WHY: Learning from competitors\' expansion successes and failures guides your strategic growth)');
      methods.push('Build strategic partnerships for scaling (WHY: Partnerships provide resources, expertise, and market access needed for sustainable expansion)');
      
      if (!hasVeryLimitedTime) {
        methods.push('Network with other business owners and industry contacts (WHY: Relationships with experienced business owners provide expansion insights and potential partnership opportunities)');
        methods.push('Attend trade shows or industry events (WHY: Industry events reveal expansion trends, supplier relationships, and market opportunities)');
      }
      
      methods.push('Strengthen online presence to support multiple locations or channels (WHY: A strong digital foundation allows you to manage and promote multiple locations efficiently)');
      methods.push('Develop systems and processes that can scale (WHY: Standardized processes ensure quality and efficiency as you grow beyond current capacity)');
      methods.push('Build supplier and vendor relationships for growth (WHY: Reliable supplier relationships ensure you can meet increased demand during expansion)');
      
      if (canDoSocialMedia) {
        methods.push('Social media showcasing business growth and success stories (WHY: Demonstrating growth builds credibility with potential partners, investors, and new market customers)');
      }
      
      if (budget >= 200) {
        methods.push(`Optional: Professional business consulting or market analysis services (WHY: Expert guidance reduces expansion risks and accelerates growth planning. Budget: ₹${Math.min(budget * 0.3, 50000).toLocaleString('en-IN')}/month)`);
      }
    }

    // Goal-specific tasks
    let automatedTasks: string[] = [];
    let aiAssistedTasks: string[] = [];
    let humanOnlyTasks: string[] = [];

    if (growthGoal === 'visibility') {
      automatedTasks = [
        'Set up Google Business Profile with complete business info, hours, photos',
        'Submit business to 10+ free local directories automatically',
        'Set up automated review request emails after customer interactions',
        'Configure Google Analytics and Search Console tracking',
      ];
      
      aiAssistedTasks = [
        'Generate SEO-optimized business descriptions for listings (AI drafts, you review)',
        'Create social media content calendar focused on visibility (AI suggests topics, you approve)',
        'Generate local SEO keywords and meta descriptions (AI suggests, you choose)',
        'Draft engaging social media captions for brand awareness (AI creates, you personalize)',
      ];
      
      humanOnlyTasks = [
        'Take professional photos showcasing your business location and products',
        'Engage personally with online reviews and customer interactions',
        'Attend local events and network for brand visibility',
        'Build relationships with local influencers or bloggers',
        'Create authentic, personal social media content',
        'Develop your unique brand story and messaging',
      ];
      
    } else if (growthGoal === 'sales') {
      automatedTasks = [
        'Set up Google Business Profile highlighting current promotions',
        'Configure automated email campaigns for sales promotions',
        'Set up abandoned cart recovery emails (if applicable)',
        'Automate inventory-based promotional messages',
      ];
      
      aiAssistedTasks = [
        'Create promotional email templates and sales copy (AI drafts, you approve)',
        'Generate product/service descriptions optimized for conversions (AI suggests, you review)',
        'Draft social media posts promoting special offers (AI creates, you personalize)',
        'Develop customer outreach scripts and templates (AI suggests, you customize)',
      ];
      
      humanOnlyTasks = [
        'Personally reach out to previous customers about new offers',
        'Train staff on upselling and cross-selling techniques',
        'Design and implement in-store promotions',
        'Create urgency with limited-time offers and inventory updates',
        'Build personal relationships with high-value customers',
        'Monitor sales data and adjust strategies based on performance',
      ];
      
    } else if (growthGoal === 'expansion') {
      automatedTasks = [
        'Set up systems for tracking multiple locations or channels',
        'Automate reporting and analytics across business units',
        'Configure inventory management systems for scale',
        'Set up standardized processes documentation',
      ];
      
      aiAssistedTasks = [
        'Generate market research summaries (AI compiles, you analyze)',
        'Create business plan templates and expansion strategies (AI suggests structure, you fill in)',
        'Draft partnership proposal templates (AI creates framework, you customize)',
        'Generate financial projection models (AI suggests formulas, you input data)',
      ];
      
      humanOnlyTasks = [
        'Conduct market research and competitor analysis',
        'Build relationships with potential partners and investors',
        'Visit potential new locations or markets',
        'Develop scaling strategies and operational plans',
        'Network with other business owners who have expanded',
        'Make critical expansion decisions based on research',
      ];
    }

    // Goal-specific weekly plans (start with plain strings, convert to TaskItems later)
    let weeklyPlanPlain: { day: string; tasks: string[] }[] = [];

    if (growthGoal === 'visibility') {
      // Visibility weekly plan with worker assignments
      if (workers === 1) {
        weeklyPlanPlain = [
          {
            day: 'Monday',
            tasks: [
              'You: Respond to all new reviews and customer messages (30 min)',
              'You: Post 1-2 visibility-focused social media updates (20 min)',
              'You: Research and submit to 2-3 new local directories (30 min)',
            ],
          },
          {
            day: 'Tuesday',
            tasks: [
              'You: Take 5-7 new photos for online listings and social media (45 min)',
              'You: Update Google Business Profile with new photos and posts (20 min)',
              'You: Engage with local community groups online (20-30 min)',
            ],
          },
          {
            day: 'Wednesday',
            tasks: [
              'You: Create content for next week\'s social media - focus on brand awareness (60 min)',
              'You: Optimize existing listings with better keywords and descriptions (30 min)',
              'You: Research local events to attend or sponsor (30 min)',
            ],
          },
          {
            day: 'Thursday',
            tasks: [
              'You: Post social media update and engage with comments (30 min)',
              'You: Reach out to local influencers or bloggers for collaboration (45 min)',
              'You: Check SEO rankings and make improvements (30 min)',
            ],
          },
          {
            day: 'Friday',
            tasks: [
              'You: Review visibility metrics - website traffic, search appearances, social reach (30 min)',
              'You: Plan weekend community event participation (30 min)',
              'You: Schedule next week\'s visibility-focused tasks (30 min)',
            ],
          },
        ];
      } else if (workers === 2) {
        weeklyPlanPlain = [
          {
            day: 'Monday',
            tasks: [
              'Worker 1: Respond to all new reviews and customer messages (30 min)',
              'Worker 1: Post 1-2 visibility-focused social media updates (20 min)',
              'Worker 2: Research and submit to 2-3 new local directories (30 min)',
              'Worker 2: Engage with local community groups online (20 min)',
            ],
          },
          {
            day: 'Tuesday',
            tasks: [
              'Worker 1: Take 5-7 new photos for online listings and social media (45 min)',
              'Worker 2: Update Google Business Profile with new photos and posts (20 min)',
              'Worker 1: Optimize existing listings with better keywords (30 min)',
              'Worker 2: Research local events to attend or sponsor (30 min)',
            ],
          },
          {
            day: 'Wednesday',
            tasks: [
              'Worker 1: Create content for next week\'s social media - focus on brand awareness (60 min)',
              'Worker 2: Draft SEO-optimized descriptions for new listings (45 min)',
              'Worker 1: Check SEO rankings and make improvements (30 min)',
            ],
          },
          {
            day: 'Thursday',
            tasks: [
              'Worker 1: Post social media update and engage with comments (30 min)',
              'Worker 2: Reach out to local influencers or bloggers for collaboration (45 min)',
              'Worker 1: Update all directory listings with new information (30 min)',
            ],
          },
          {
            day: 'Friday',
            tasks: [
              'Worker 1: Review visibility metrics - website traffic, search appearances, social reach (30 min)',
              'Worker 2: Plan weekend community event participation (30 min)',
              'Both: Schedule next week\'s visibility-focused tasks together (30 min)',
            ],
          },
        ];
      } else {
        // 3+ workers
        weeklyPlanPlain = [
          {
            day: 'Monday',
            tasks: [
              'Worker 1: Respond to all new reviews and customer messages (30 min)',
              'Worker 2: Post 1-2 visibility-focused social media updates (20 min)',
              'Worker 3: Research and submit to 2-3 new local directories (30 min)',
              'Worker 1: Engage with local community groups online (20 min)',
            ],
          },
          {
            day: 'Tuesday',
            tasks: [
              'Worker 1: Take 5-7 new photos for online listings and social media (45 min)',
              'Worker 2: Update Google Business Profile with new photos and posts (20 min)',
              'Worker 3: Optimize existing listings with better keywords and descriptions (30 min)',
              'Worker 1: Research local events to attend or sponsor (30 min)',
            ],
          },
          {
            day: 'Wednesday',
            tasks: [
              'Worker 1: Create content for next week\'s social media - focus on brand awareness (60 min)',
              'Worker 2: Draft SEO-optimized descriptions for new listings (45 min)',
              'Worker 3: Check SEO rankings and make improvements (30 min)',
              'Worker 2: Reach out to local influencers or bloggers (30 min)',
            ],
          },
          {
            day: 'Thursday',
            tasks: [
              'Worker 1: Post social media update and engage with comments (30 min)',
              'Worker 2: Continue influencer outreach and collaboration (45 min)',
              'Worker 3: Update all directory listings with new information (30 min)',
              'Worker 1: Create visibility-focused content for various platforms (30 min)',
            ],
          },
          {
            day: 'Friday',
            tasks: [
              'Worker 1: Review visibility metrics - website traffic, search appearances, social reach (30 min)',
              'Worker 2: Plan weekend community event participation (30 min)',
              'Worker 3: Schedule next week\'s visibility-focused tasks (30 min)',
              'All: Weekly visibility strategy review meeting (30 min)',
            ],
          },
        ];
      }
      
    } else if (growthGoal === 'sales') {
      // Sales weekly plan with worker assignments
      if (workers === 1) {
        weeklyPlanPlain = [
          {
            day: 'Monday',
            tasks: [
              'You: Launch weekly promotion or special offer (30 min)',
              'You: Announce promotion on all social media and email list (30 min)',
              'You: Train yourself on current promotions and upselling techniques (30 min)',
            ],
          },
          {
            day: 'Tuesday',
            tasks: [
              'You: Reach out to 5-10 previous customers with special offer (60 min)',
              'You: Update Google Business Profile with current promotions (20 min)',
              'You: Check inventory and create urgency messaging if needed (20 min)',
            ],
          },
          {
            day: 'Wednesday',
            tasks: [
              'You: Follow up on pending inquiries and convert to sales (60 min)',
              'You: Create promotional content for next week\'s campaigns (45 min)',
              'You: Analyze which products/services sell best and promote them (30 min)',
            ],
          },
          {
            day: 'Thursday',
            tasks: [
              'You: Post reminder about current promotion - create urgency (20 min)',
              'You: Contact customers who haven\'t purchased recently (60 min)',
              'You: Evaluate promotion performance and adjust if needed (30 min)',
            ],
          },
          {
            day: 'Friday',
            tasks: [
              'You: Review sales data and revenue for the week (30 min)',
              'You: Plan next week\'s promotions and special offers (45 min)',
              'You: Send end-of-week promotional email to email list (20 min)',
            ],
          },
        ];
      } else if (workers === 2) {
        weeklyPlanPlain = [
          {
            day: 'Monday',
            tasks: [
              'Worker 1: Launch weekly promotion or special offer (30 min)',
              'Worker 1: Announce promotion on all social media and email list (30 min)',
              'Worker 2: Train staff on current promotions and upselling techniques (30 min)',
              'Worker 2: Update in-store promotional displays (30 min)',
            ],
          },
          {
            day: 'Tuesday',
            tasks: [
              'Worker 1: Reach out to 5-10 previous customers with special offer (60 min)',
              'Worker 2: Update Google Business Profile with current promotions (20 min)',
              'Worker 1: Check inventory and create urgency messaging if needed (20 min)',
              'Worker 2: Follow up on customer inquiries and convert to sales (60 min)',
            ],
          },
          {
            day: 'Wednesday',
            tasks: [
              'Worker 1: Create promotional content for next week\'s campaigns (60 min)',
              'Worker 2: Analyze which products/services sell best and promote them (45 min)',
              'Worker 1: Contact customers who haven\'t purchased recently (45 min)',
            ],
          },
          {
            day: 'Thursday',
            tasks: [
              'Worker 1: Post reminder about current promotion - create urgency (20 min)',
              'Worker 2: Evaluate promotion performance and adjust if needed (30 min)',
              'Worker 1: Send follow-up emails to interested customers (45 min)',
              'Worker 2: Update promotional messaging based on performance (30 min)',
            ],
          },
          {
            day: 'Friday',
            tasks: [
              'Worker 1: Review sales data and revenue for the week (30 min)',
              'Worker 2: Plan next week\'s promotions and special offers (45 min)',
              'Worker 1: Send end-of-week promotional email to email list (20 min)',
              'Both: Weekly sales strategy review meeting (30 min)',
            ],
          },
        ];
      } else {
        // 3+ workers
        weeklyPlanPlain = [
          {
            day: 'Monday',
            tasks: [
              'Worker 1: Launch weekly promotion or special offer (30 min)',
              'Worker 2: Announce promotion on all social media and email list (30 min)',
              'Worker 3: Train staff on current promotions and upselling techniques (30 min)',
              'Worker 1: Update in-store promotional displays (30 min)',
            ],
          },
          {
            day: 'Tuesday',
            tasks: [
              'Worker 1: Reach out to 5-10 previous customers with special offer (60 min)',
              'Worker 2: Update Google Business Profile with current promotions (20 min)',
              'Worker 3: Check inventory and create urgency messaging if needed (20 min)',
              'Worker 1: Follow up on customer inquiries and convert to sales (60 min)',
            ],
          },
          {
            day: 'Wednesday',
            tasks: [
              'Worker 1: Create promotional content for next week\'s campaigns (60 min)',
              'Worker 2: Analyze which products/services sell best and promote them (45 min)',
              'Worker 3: Contact customers who haven\'t purchased recently (60 min)',
              'Worker 2: Update promotional materials based on best sellers (30 min)',
            ],
          },
          {
            day: 'Thursday',
            tasks: [
              'Worker 1: Post reminder about current promotion - create urgency (20 min)',
              'Worker 2: Evaluate promotion performance and adjust if needed (30 min)',
              'Worker 3: Send follow-up emails to interested customers (60 min)',
              'Worker 1: Update promotional messaging based on performance (30 min)',
            ],
          },
          {
            day: 'Friday',
            tasks: [
              'Worker 1: Review sales data and revenue for the week (30 min)',
              'Worker 2: Plan next week\'s promotions and special offers (45 min)',
              'Worker 3: Send end-of-week promotional email to email list (20 min)',
              'All: Weekly sales strategy review meeting (30 min)',
            ],
          },
        ];
      }
      
    } else if (growthGoal === 'expansion') {
      // Expansion weekly plan with worker assignments
      if (workers === 1) {
        weeklyPlanPlain = [
          {
            day: 'Monday',
            tasks: [
              'You: Research potential expansion opportunities or locations (90 min)',
              'You: Analyze competitor expansion strategies (60 min)',
              'You: Review business financials and expansion readiness (60 min)',
            ],
          },
          {
            day: 'Tuesday',
            tasks: [
              'You: Network with other business owners or industry contacts (90 min)',
              'You: Research suppliers/vendors for scaling operations (60 min)',
              'You: Document current processes that need to be standardized (60 min)',
            ],
          },
          {
            day: 'Wednesday',
            tasks: [
              'You: Reach out to potential partners or investors (90 min)',
              'You: Develop expansion strategy and create action plan (90 min)',
              'You: Research local regulations or requirements for expansion (60 min)',
            ],
          },
          {
            day: 'Thursday',
            tasks: [
              'You: Attend networking events or industry meetings (120 min)',
              'You: Evaluate potential new markets or customer segments (60 min)',
              'You: Create systems and processes for scaling (60 min)',
            ],
          },
          {
            day: 'Friday',
            tasks: [
              'You: Review expansion research and make decisions (90 min)',
              'You: Update business plan with expansion goals (90 min)',
              'You: Plan next steps and assign expansion-related tasks (60 min)',
            ],
          },
        ];
      } else if (workers === 2) {
        weeklyPlanPlain = [
          {
            day: 'Monday',
            tasks: [
              'Worker 1: Research potential expansion opportunities or locations (90 min)',
              'Worker 2: Analyze competitor expansion strategies (90 min)',
              'Worker 1: Review business financials and expansion readiness (60 min)',
            ],
          },
          {
            day: 'Tuesday',
            tasks: [
              'Worker 1: Network with other business owners or industry contacts (90 min)',
              'Worker 2: Research suppliers/vendors for scaling operations (90 min)',
              'Worker 1: Document current processes that need to be standardized (60 min)',
            ],
          },
          {
            day: 'Wednesday',
            tasks: [
              'Worker 1: Reach out to potential partners or investors (90 min)',
              'Worker 2: Develop expansion strategy and create action plan (90 min)',
              'Worker 1: Research local regulations or requirements for expansion (60 min)',
            ],
          },
          {
            day: 'Thursday',
            tasks: [
              'Worker 1: Attend networking events or industry meetings (120 min)',
              'Worker 2: Evaluate potential new markets or customer segments (90 min)',
              'Worker 1: Create systems and processes for scaling (60 min)',
            ],
          },
          {
            day: 'Friday',
            tasks: [
              'Worker 1: Review expansion research and make decisions (90 min)',
              'Worker 2: Update business plan with expansion goals (90 min)',
              'Both: Plan next steps and assign expansion-related tasks together (60 min)',
            ],
          },
        ];
      } else {
        // 3+ workers
        weeklyPlanPlain = [
          {
            day: 'Monday',
            tasks: [
              'Worker 1: Research potential expansion opportunities or locations (90 min)',
              'Worker 2: Analyze competitor expansion strategies (90 min)',
              'Worker 3: Review business financials and expansion readiness (60 min)',
              'Worker 1: Compile initial expansion research report (30 min)',
            ],
          },
          {
            day: 'Tuesday',
            tasks: [
              'Worker 1: Network with other business owners or industry contacts (90 min)',
              'Worker 2: Research suppliers/vendors for scaling operations (90 min)',
              'Worker 3: Document current processes that need to be standardized (90 min)',
              'Worker 2: Create supplier comparison spreadsheet (30 min)',
            ],
          },
          {
            day: 'Wednesday',
            tasks: [
              'Worker 1: Reach out to potential partners or investors (90 min)',
              'Worker 2: Develop expansion strategy and create action plan (90 min)',
              'Worker 3: Research local regulations or requirements for expansion (90 min)',
              'Worker 1: Draft partnership proposal templates (60 min)',
            ],
          },
          {
            day: 'Thursday',
            tasks: [
              'Worker 1: Attend networking events or industry meetings (120 min)',
              'Worker 2: Evaluate potential new markets or customer segments (90 min)',
              'Worker 3: Create systems and processes for scaling (90 min)',
              'Worker 2: Develop market analysis reports (60 min)',
            ],
          },
          {
            day: 'Friday',
            tasks: [
              'Worker 1: Review expansion research and make decisions (90 min)',
              'Worker 2: Update business plan with expansion goals (90 min)',
              'Worker 3: Plan next steps and assign expansion-related tasks (60 min)',
              'All: Weekly expansion strategy review meeting (60 min)',
            ],
          },
        ];
      }
    }

    // Convert plain task strings to enhanced TaskItem objects
    const weeklyPlan: DayPlan[] = weeklyPlanPlain.map((dayPlan, dayIndex) => {
      let taskStrings = dayPlan.tasks;

      // Adjust based on time constraints
      if (hasVeryLimitedTime) {
        taskStrings = taskStrings.slice(0, 1); // Only one task per day
      } else if (hasLimitedTime) {
        taskStrings = taskStrings.slice(0, 2); // Two tasks per day
      }

      // Remove social media tasks if not recommended
      if (!canDoSocialMedia) {
        taskStrings = taskStrings.filter(
          (task) =>
            !task.toLowerCase().includes('social media') &&
            !task.toLowerCase().includes('instagram') &&
            !task.toLowerCase().includes('facebook')
        );
      }

      // Convert to TaskItems
      const enhancedTasks: TaskItem[] = taskStrings.map((taskText, taskIndex) =>
        createTaskItem(
          taskText,
          dayPlan.day,
          data.businessType || 'business',
          budget,
          timePerDay,
          workers,
          growthGoal,
          hasLimitedTime,
          dayIndex,
          taskIndex
        )
      );

      return {
        day: dayPlan.day,
        tasks: enhancedTasks,
      };
    });

    // Collaborations - ONLY for expansion goal (as per new instructions)
    let collaborations: string[] | undefined = undefined;
    
    if (growthGoal === 'expansion') {
      collaborations = [
        'Form strategic partnerships with suppliers or distributors (WHY: Reliable supply chains are essential for scaling operations)',
        'Partner with complementary businesses for joint expansion (WHY: Shared resources and market access accelerate growth)',
        'Collaborate with investors or business mentors (WHY: Access to capital and expertise supports sustainable expansion)',
        'Join industry associations for expansion networking (WHY: Industry connections provide expansion opportunities and best practices)',
      ];
    }
    // Note: Collaborations are NOT included for visibility or sales goals per new instructions

    // Fundraising (optional, only if expansion goal)
    const fundraising: string[] | undefined = 
      growthGoal === 'expansion' && budget < 500
        ? [
            'Consider small crowdfunding campaign for specific expansion goals (OPTIONAL - AI only provides guidance, final decision is yours)',
            'Explore local small business grants or loans (OPTIONAL - AI only provides guidance, final decision is yours)',
            'Look into community investment programs (OPTIONAL - AI only provides guidance, final decision is yours)',
            'Research SBA loans or small business financing options (OPTIONAL - AI only provides guidance, final decision is yours)',
          ]
        : undefined;

    // AI Contribution Summary - clearly showing how AI reduces effort
    let aiContributionSummary = `6) AI CONTRIBUTION SUMMARY\n\n`;
    aiContributionSummary += `The AI plays a MAJOR role in reducing your workload and complexity:\n\n`;
    
    if (growthGoal === 'visibility') {
      aiContributionSummary += `• DRAFTING CONTENT: AI generates ready-to-use social media captions, SEO-optimized business descriptions, and content calendars - saving you ${Math.ceil(timePerDay * 0.3)} hours per day\n`;
      aiContributionSummary += `• CREATING PLANS: AI designs your weekly visibility action plan based on your time, budget, and workers - eliminating planning time\n`;
      aiContributionSummary += `• GENERATING MESSAGES: AI drafts review request emails, directory submission content, and community engagement messages - ready for your review\n`;
      aiContributionSummary += `• PRIORITIZING ACTIONS: AI identifies which visibility methods will have the most impact given your resources - preventing wasted effort\n`;
      aiContributionSummary += `• REDUCING MANUAL EFFORT: AI handles ${automatedTasks.length} fully automated tasks and prepares ${aiAssistedTasks.length} tasks for your approval - reducing your daily workload by approximately ${Math.ceil((automatedTasks.length * 0.5) + (aiAssistedTasks.length * 0.3))} hours\n\n`;
      aiContributionSummary += `The AI does NOT replace your personal touch, judgment, or authentic voice - it handles the time-consuming preparation work so you can focus on building genuine customer relationships.`;
    } else if (growthGoal === 'sales') {
      aiContributionSummary += `• DRAFTING CONTENT: AI generates promotional email templates, sales copy, and social media posts promoting offers - saving you ${Math.ceil(timePerDay * 0.4)} hours per day\n`;
      aiContributionSummary += `• CREATING PLANS: AI designs your weekly sales action plan with specific promotions and customer outreach strategies - eliminating planning time\n`;
      aiContributionSummary += `• GENERATING MESSAGES: AI drafts customer outreach scripts, promotional announcements, and follow-up templates - ready for your personalization\n`;
      aiContributionSummary += `• PRIORITIZING ACTIONS: AI identifies which sales methods will drive the most revenue given your budget and time - maximizing ROI\n`;
      aiContributionSummary += `• REDUCING MANUAL EFFORT: AI handles ${automatedTasks.length} fully automated tasks (email campaigns, inventory alerts) and prepares ${aiAssistedTasks.length} tasks for your approval - reducing your daily workload by approximately ${Math.ceil((automatedTasks.length * 0.6) + (aiAssistedTasks.length * 0.4))} hours\n\n`;
      aiContributionSummary += `The AI does NOT replace your personal customer relationships or sales judgment - it handles the preparation work so you can focus on converting leads and building customer loyalty.`;
    } else if (growthGoal === 'expansion') {
      aiContributionSummary += `• DRAFTING CONTENT: AI generates market research summaries, business plan templates, partnership proposals, and financial models - saving you ${Math.ceil(timePerDay * 0.5)} hours per day\n`;
      aiContributionSummary += `• CREATING PLANS: AI designs your weekly expansion action plan with research tasks, networking strategies, and scaling processes - eliminating planning time\n`;
      aiContributionSummary += `• GENERATING MESSAGES: AI drafts partnership proposal templates, investor pitch frameworks, and expansion strategy documents - ready for your customization\n`;
      aiContributionSummary += `• PRIORITIZING ACTIONS: AI identifies which expansion opportunities align with your resources and goals - preventing costly mistakes\n`;
      aiContributionSummary += `• REDUCING MANUAL EFFORT: AI handles ${automatedTasks.length} fully automated tasks (reporting, documentation) and prepares ${aiAssistedTasks.length} tasks for your analysis - reducing your daily workload by approximately ${Math.ceil((automatedTasks.length * 0.4) + (aiAssistedTasks.length * 0.5))} hours\n\n`;
      aiContributionSummary += `The AI does NOT replace your strategic decision-making or business judgment - it provides research, templates, and analysis so you can make informed expansion decisions.`;
    }

    return {
      analysis,
      methods,
      automatedTasks,
      aiAssistedTasks,
      humanOnlyTasks,
      weeklyPlan,
      collaborations,
      fundraising,
      aiContributionSummary,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Send shop information message to 8825484735 immediately when form is submitted
    if (typeof window !== 'undefined') {
      import('@/services/whatsappAlertsService').then(({ sendWhatsAppAlert }) => {
        const shopInfoMessage = {
          type: 'special-occasion' as const,
          message: `🏪 NEW SHOP REGISTRATION - Growth Strategy Request

📋 Shop Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Business Type: ${inputs.businessType || 'Not specified'}
Monthly Budget: ₹${(parseFloat(inputs.budget) || 0).toLocaleString('en-IN')}
Time Available: ${inputs.timePerDay || '0'} hours per day
Number of Workers: ${inputs.numberOfWorkers || '1'}
Growth Goal: ${inputs.growthGoal === 'visibility' ? 'Increase Visibility' : inputs.growthGoal === 'sales' ? 'Increase Sales' : 'Business Expansion'}
Target Time Span: ${inputs.targetTimeSpan || '30'} days
Owner Mobile Number: ${inputs.ownerMobile || 'Not provided'}

✅ Shop data submitted successfully!
📅 Growth strategy is being generated...

This message was sent automatically when the owner clicked "Get My Growth Strategy".`,
          priority: 'medium' as const,
          timestamp: new Date(),
        };
        // Always send to 8825484735
        sendWhatsAppAlert(shopInfoMessage, '8825484735').then((success) => {
          if (success) {
            console.log('Shop information sent to 8825484735 successfully');
          } else {
            console.warn('Failed to send shop information to 8825484735');
          }
        });
      });
    }
    
    // Simulate processing time for better UX
    setTimeout(() => {
      const recs = generateRecommendations(inputs);
      setRecommendations(recs);
      
      // Generate detailed plan using new service
      const budget = parseFloat(inputs.budget) || 0;
      const timePerDay = parseFloat(inputs.timePerDay) || 0;
      const workers = parseInt(inputs.numberOfWorkers) || 1;
      const timeSpan = parseInt(inputs.targetTimeSpan) || 30;
      const detailed = generateDetailedPlan(
        inputs.businessType || 'Business',
        budget,
        timePerDay,
        workers,
        inputs.growthGoal,
        timeSpan
      );
      setDetailedPlan(detailed);
      
      setIsLoading(false);
      
      // Save weekly plan and owner mobile for Operational Dashboard
      if (typeof window !== 'undefined') {
        // Convert DayPlan[] to simple format for operational service
        const simplePlan = recs.weeklyPlan.map(dayPlan => ({
          day: dayPlan.day,
          tasks: dayPlan.tasks.map(task => task.text)
        }));
        localStorage.setItem('businessAdvisor_weeklyPlan', JSON.stringify(simplePlan));
        
        // Save owner mobile number
        if (inputs.ownerMobile) {
          setOwnerMobileNumber(inputs.ownerMobile);
        }
      }
      
      // Scroll to results
      setTimeout(() => {
        const resultsElement = document.getElementById('results');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Business Growth Assistant
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Get personalized, realistic growth strategies tailored to your resources and constraints.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Business Type *
            </label>
            <input
              type="text"
              id="businessType"
              value={inputs.businessType}
              onChange={(e) => setInputs({ ...inputs, businessType: e.target.value })}
              placeholder="e.g., Coffee Shop, Bakery, Repair Shop, etc."
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Monthly Budget (in rupees) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">₹</span>
                <input
                  type="number"
                  id="budget"
                  min="0"
                  step="10"
                  value={inputs.budget}
                  onChange={(e) => setInputs({ ...inputs, budget: e.target.value })}
                  placeholder="0"
                  required
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter your monthly marketing budget in Indian Rupees (₹)
              </p>
            </div>

            <div>
              <label htmlFor="timePerDay" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hours Available Per Day *
              </label>
              <input
                type="number"
                id="timePerDay"
                min="0.5"
                max="24"
                step="0.5"
                value={inputs.timePerDay}
                onChange={(e) => setInputs({ ...inputs, timePerDay: e.target.value })}
                placeholder="1.5"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="numberOfWorkers" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Number of Workers (including yourself) *
              </label>
              <input
                type="number"
                id="numberOfWorkers"
                min="1"
                value={inputs.numberOfWorkers}
                onChange={(e) => setInputs({ ...inputs, numberOfWorkers: e.target.value })}
                placeholder="1"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="targetTimeSpan" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Time Span (days) *
              </label>
              <input
                type="number"
                id="targetTimeSpan"
                min="7"
                value={inputs.targetTimeSpan}
                onChange={(e) => setInputs({ ...inputs, targetTimeSpan: e.target.value })}
                placeholder="30"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="growthGoal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Desired Growth Goal *
            </label>
            <select
              id="growthGoal"
              value={inputs.growthGoal}
              onChange={(e) => setInputs({ ...inputs, growthGoal: e.target.value as any })}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="visibility">Increase Visibility</option>
              <option value="sales">Increase Sales</option>
              <option value="expansion">Business Expansion</option>
            </select>
          </div>

          <div>
            <label htmlFor="ownerMobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Owner Mobile Number (for WhatsApp alerts) *
            </label>
            <input
              type="tel"
              id="ownerMobile"
              value={inputs.ownerMobile || ''}
              onChange={(e) => setInputs({ ...inputs, ownerMobile: e.target.value })}
              placeholder="+91 9876543210"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This number will receive WhatsApp alerts for stock exhaustion, sales drops, and special occasions
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Analyzing...' : 'Get My Growth Strategy'}
          </button>
        </form>
      </div>

      {recommendations && detailedPlan && (
        <div id="results" className="space-y-6">
          {/* VERY DETAILED EXECUTION PLAN */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg shadow-lg p-6 border-2 border-blue-300 dark:border-blue-700">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              📋 VERY DETAILED STEP-BY-STEP EXECUTION PLAN
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              This is your actionable, physical/digital execution plan with exact rupee breakdown, worker assignments, and time-based steps.
            </p>

            {/* Business Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">1) Business Summary</h3>
              <p className="text-gray-700 dark:text-gray-300">{detailedPlan.businessSummary}</p>
            </div>

            {/* Selected Goal */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">2) Selected Growth Goal</h3>
              <p className="text-gray-700 dark:text-gray-300 font-semibold">{detailedPlan.selectedGoal}</p>
            </div>

            {/* Exact Marketing Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3) Exact Marketing Actions (NO Generic Language)</h3>
              <div className="space-y-3">
                {detailedPlan.exactActions.map((action, idx) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">{action.action}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1"><strong>HOW:</strong> {action.how}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1"><strong>WHO:</strong> {action.who}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1"><strong>COST:</strong> ₹{action.cost.toLocaleString('en-IN')}</p>
                    {action.location && <p className="text-sm text-gray-700 dark:text-gray-300 mb-1"><strong>WHERE:</strong> {action.location}</p>}
                    <p className="text-sm text-gray-700 dark:text-gray-300"><strong>WHEN:</strong> {action.timing}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Exact Budget Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4) Exact Budget Breakdown (₹-wise)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="px-3 py-2 text-left">Item</th>
                      <th className="px-3 py-2 text-right">Quantity</th>
                      <th className="px-3 py-2 text-right">Unit Cost</th>
                      <th className="px-3 py-2 text-right">Total Cost</th>
                      <th className="px-3 py-2 text-left">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailedPlan.budgetBreakdown.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-200 dark:border-gray-600">
                        <td className="px-3 py-2">{item.item}</td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">₹{item.unitCost.toLocaleString('en-IN')}</td>
                        <td className="px-3 py-2 text-right font-semibold">₹{item.totalCost.toLocaleString('en-IN')}</td>
                        <td className="px-3 py-2">{item.purpose}</td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50 dark:bg-blue-900/20 font-bold">
                      <td colSpan={3} className="px-3 py-2 text-right">Total Budget Used:</td>
                      <td className="px-3 py-2 text-right">₹{detailedPlan.budgetBreakdown.reduce((sum, item) => sum + item.totalCost, 0).toLocaleString('en-IN')}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Worker-Wise Task Assignment */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5) Worker-Wise Task Assignment</h3>
              <div className="space-y-4">
                {detailedPlan.workerAssignments.map((assignment, idx) => (
                  <div key={idx} className="border-l-4 border-purple-500 pl-4 py-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <p className="font-bold text-gray-900 dark:text-white mb-2">{assignment.worker} ({assignment.timePerDay.toFixed(1)} hours/day)</p>
                    <ul className="space-y-1">
                      {assignment.tasks.map((task, taskIdx) => (
                        <li key={taskIdx} className="text-sm text-gray-700 dark:text-gray-300">• {task}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Time-Based Execution Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6) Time-Based Execution Plan</h3>
              <div className="space-y-4">
                {detailedPlan.timeBasedExecution.map((period, idx) => (
                  <div key={idx} className="border-l-4 border-green-500 pl-4 py-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <p className="font-bold text-gray-900 dark:text-white mb-2">{period.period}</p>
                    <ul className="space-y-1 mb-2">
                      {period.actions.map((action, actionIdx) => (
                        <li key={actionIdx} className="text-sm text-gray-700 dark:text-gray-300">• {action}</li>
                      ))}
                    </ul>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400">Expected Results: {period.expectedResults}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Task Classification */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7) Task Classification</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded p-3">
                  <h4 className="font-bold text-green-800 dark:text-green-300 mb-2">Automated (AI)</h4>
                  <ul className="space-y-1 text-sm">
                    {detailedPlan.taskClassification.automated.map((task, idx) => (
                      <li key={idx} className="text-green-700 dark:text-green-300">• {task}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded p-3">
                  <h4 className="font-bold text-yellow-800 dark:text-yellow-300 mb-2">AI-Assisted</h4>
                  <ul className="space-y-1 text-sm">
                    {detailedPlan.taskClassification.aiAssisted.map((task, idx) => (
                      <li key={idx} className="text-yellow-700 dark:text-yellow-300">• {task}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3">
                  <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Human-Only</h4>
                  <ul className="space-y-1 text-sm">
                    {detailedPlan.taskClassification.humanOnly.map((task, idx) => (
                      <li key={idx} className="text-blue-700 dark:text-blue-300">• {task}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* AI Contribution Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">8) AI Contribution Summary</h3>
              <p className="text-gray-700 dark:text-gray-300">{detailedPlan.aiContribution}</p>
            </div>

            {/* Safety Note */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <h3 className="text-xl font-bold text-red-900 dark:text-red-300 mb-2">9) Safety Note</h3>
              <p className="text-red-800 dark:text-red-200">{detailedPlan.safetyNote}</p>
            </div>
          </div>
        </div>
      )}

      {recommendations && !detailedPlan && (
        <div id="results" className="space-y-6">
          {/* Analysis Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Growth Strategy Analysis
            </h2>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {recommendations.analysis}
            </div>
          </div>

          {/* Recommended Methods */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3) Recommended Growth Methods (Goal-Specific)
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Each method below is specifically chosen for your selected growth goal. The "WHY" explanation shows how each method fits your goal.
            </p>
            <ul className="space-y-2">
              {recommendations.methods.map((method, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">{method}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Task Categories */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4) Task Breakdown (Goal-Specific)
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Tasks are classified based on your selected growth goal. These lists change completely depending on whether you chose Visibility, Sales, or Expansion.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-3">
                🤖 Automated Tasks (AI)
              </h3>
              <p className="text-sm text-green-700 dark:text-green-400 mb-3">
                AI can fully handle these:
              </p>
              <ul className="space-y-2">
                {recommendations.automatedTasks.map((task, index) => (
                  <li key={index} className="text-sm text-green-700 dark:text-green-300">
                    • {task}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mb-3">
                🔧 AI-Assisted Tasks
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">
                AI prepares, human approves:
              </p>
              <ul className="space-y-2">
                {recommendations.aiAssistedTasks.map((task, index) => (
                  <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
                    • {task}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-3">
                👤 Human-Only Tasks
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                Requires your personal touch:
              </p>
              <ul className="space-y-2">
                {recommendations.humanOnlyTasks.map((task, index) => (
                  <li key={index} className="text-sm text-blue-700 dark:text-blue-300">
                    • {task}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Role Explanation */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg shadow-lg p-6 border-l-4 border-indigo-500">
            <h2 className="text-2xl font-bold text-indigo-800 dark:text-indigo-300 mb-4">
              🤖 Understanding the AI's Role
            </h2>
            <div className="space-y-3 text-indigo-700 dark:text-indigo-300">
              <div>
                <p className="font-semibold mb-1">What the AI Prepares Automatically:</p>
                <p className="text-sm">The AI generates ready-to-use content like social media captions, content ideas, posting schedules, and checklists. These are labeled "AI-Prepared" and can be used directly.</p>
              </div>
              <div>
                <p className="font-semibold mb-1">What Requires Your Review:</p>
                <p className="text-sm">Tasks labeled "Human Review Required" include AI suggestions that need your approval or personalization to match your brand voice and business values.</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Why Full Automation is Avoided:</p>
                <p className="text-sm">Your personal touch, judgment, and authentic voice are essential for building genuine customer relationships. The AI assists but doesn't replace your unique business perspective.</p>
              </div>
            </div>
          </div>

          {/* Weekly Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5) Weekly Action Plan (Goal-Specific)
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This weekly plan is specifically designed for your selected growth goal and uses your available time, budget, and workers intelligently. 
              Tasks are assigned to specific workers when multiple workers are available.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Click on any task to mark it as completed or skipped. Your feedback helps improve future recommendations.
            </p>
            <div className="space-y-6">
              {recommendations.weeklyPlan.map((day, dayIndex) => (
                <div key={dayIndex} className="border-l-4 border-blue-500 pl-4 py-3">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">
                    {day.day}
                  </h3>
                  <div className="space-y-4">
                    {day.tasks.map((task) => {
                      const status = taskStatuses[task.id] || 'pending';
                      const categoryColors = {
                        'AI-Prepared': 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
                        'Human Review Required': 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
                        'Manual Action': 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
                      };
                      const categoryLabels = {
                        'AI-Prepared': '🤖 AI-Prepared',
                        'Human Review Required': '🔍 Human Review Required',
                        'Manual Action': '👤 Manual Action',
                      };

                      return (
                        <div
                          key={task.id}
                          className={`border rounded-lg p-4 ${categoryColors[task.category]} ${
                            status === 'completed' ? 'opacity-75' : ''
                          } transition-all`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold px-2 py-1 rounded bg-white dark:bg-gray-800">
                                  {categoryLabels[task.category]}
                                </span>
                                {status === 'completed' && (
                                  <span className="text-xs font-semibold px-2 py-1 rounded bg-green-500 text-white">
                                    ✓ Completed
                                  </span>
                                )}
                                {status === 'skipped' && (
                                  <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-500 text-white">
                                    ⊘ Skipped
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-900 dark:text-white font-medium mb-2">
                                {task.text}
                              </p>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mb-3 italic">
                                💡 Why this task? {task.reasoning}
                              </div>
                            </div>
                          </div>

                          {/* AI-Prepared Content */}
                          {task.aiPreparedContent && (
                            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                ✨ AI-Prepared Content (Ready to Use):
                              </p>
                              {task.aiPreparedContent.captions && (
                                <div className="mb-3">
                                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Suggested Captions:
                                  </p>
                                  {task.aiPreparedContent.captions.map((caption, idx) => (
                                    <div
                                      key={idx}
                                      className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 p-2 rounded mb-2 font-mono cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                      onClick={() => navigator.clipboard?.writeText(caption)}
                                      title="Click to copy"
                                    >
                                      {caption}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {task.aiPreparedContent.postingTimes && (
                                <div className="mb-3">
                                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Optimal Posting Times:
                                  </p>
                                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                    {task.aiPreparedContent.postingTimes.map((time, idx) => (
                                      <li key={idx}>• {time}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {task.aiPreparedContent.contentIdeas && (
                                <div className="mb-3">
                                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Content Ideas:
                                  </p>
                                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                    {task.aiPreparedContent.contentIdeas.map((idea, idx) => (
                                      <li key={idx}>• {idea}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {task.aiPreparedContent.checklist && (
                                <div>
                                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Checklist:
                                  </p>
                                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                    {task.aiPreparedContent.checklist.map((item, idx) => (
                                      <li key={idx} className="flex items-center">
                                        <input
                                          type="checkbox"
                                          className="mr-2"
                                          onChange={(e) => {
                                            // Simple checklist tracking (optional enhancement)
                                          }}
                                        />
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Task Action Buttons */}
                          <div className="flex gap-2 mt-3">
                            {status !== 'completed' && (
                              <button
                                onClick={() => updateTaskStatus(task.id, 'completed')}
                                className="text-xs px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                              >
                                Mark Complete
                              </button>
                            )}
                            {status !== 'skipped' && (
                              <button
                                onClick={() => updateTaskStatus(task.id, 'skipped')}
                                className="text-xs px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
                              >
                                Skip
                              </button>
                            )}
                            {status !== 'pending' && (
                              <button
                                onClick={() => updateTaskStatus(task.id, 'pending')}
                                className="text-xs px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Collaborations */}
          {recommendations.collaborations && recommendations.collaborations.length > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-purple-800 dark:text-purple-300 mb-4">
                Optional Collaboration Ideas
              </h2>
              <ul className="space-y-2">
                {recommendations.collaborations.map((collab, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-500 mr-2 mt-1">•</span>
                    <span className="text-purple-700 dark:text-purple-300">{collab}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fundraising */}
          {recommendations.fundraising && recommendations.fundraising.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-orange-800 dark:text-orange-300 mb-4">
                Optional Fundraising & Investment Ideas
              </h2>
              <p className="text-sm text-orange-700 dark:text-orange-400 mb-3 italic">
                These are completely optional. Only consider if you're comfortable with them.
              </p>
              <ul className="space-y-2">
                {recommendations.fundraising.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-orange-500 mr-2 mt-1">•</span>
                    <span className="text-orange-700 dark:text-orange-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Contribution Summary */}
          {recommendations.aiContributionSummary && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-300 mb-4">
                🤖 AI Contribution Summary
              </h2>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {recommendations.aiContributionSummary}
              </div>
            </div>
          )}

          {/* Safety & Responsibility Note */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-300 mb-3">
              7) SAFETY & RESPONSIBILITY NOTE
            </h3>
            <div className="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
              <p>
                <strong>Results Not Guaranteed:</strong> This AI assistant provides guidance and suggestions based on your inputs. 
                Results may vary based on your local market, competition, execution quality, and external factors beyond our control.
              </p>
              <p>
                <strong>Optional Spending:</strong> Any spending, collaboration, investment, or fundraising suggestions are 
                <strong> OPTIONAL</strong> and <strong>OWNER-CONTROLLED</strong>. The AI only provides guidance - all final decisions 
                remain with you, the business owner.
              </p>
              <p>
                <strong>AI Role:</strong> The AI acts as a powerful assistant that reduces effort and complexity, but does NOT 
                replace human decision-making, personal judgment, or authentic business relationships.
              </p>
              <p>
                <strong>Your Responsibility:</strong> You are responsible for all business decisions, spending, partnerships, and 
                outcomes. Always verify information, consult professionals when needed, and make decisions that align with your 
                business values and goals.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}