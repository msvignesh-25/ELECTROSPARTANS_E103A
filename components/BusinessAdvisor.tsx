'use client';

import React, { useState, useEffect } from 'react';
import { sendWhatsAppMessage } from '@/services/whatsappService';
import { scheduleTasksFromWeeklyPlan } from '@/services/schedulingService';
import SchedulingCalendar from './SchedulingCalendar';

interface BusinessInputs {
  businessType: string;
  budget: string;
  timePerDay: string;
  numberOfWorkers: string;
  growthGoal: 'visibility' | 'sales' | 'expansion';
  targetTimeSpan: string;
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
  businessSummary: string;
  growthGoalIdentified: string;
  methods: Array<{ method: string; explanation: string }>;
  automatedTasks: string[];
  aiAssistedTasks: string[];
  humanOnlyTasks: string[];
  weeklyPlan: DayPlan[];
  aiContribution: string[];
  collaborations?: string[];
  fundraising?: string[];
}

export default function BusinessAdvisor() {
  const [inputs, setInputs] = useState<BusinessInputs>({
    businessType: '',
    budget: '',
    timePerDay: '',
    numberOfWorkers: '',
    growthGoal: 'visibility',
    targetTimeSpan: '',
  });
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [taskStatuses, setTaskStatuses] = useState<Record<string, TaskStatus>>({});

  // Load task statuses from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('businessAdvisor_taskStatuses');
    if (saved) {
      try {
        setTaskStatuses(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load task statuses:', e);
      }
    }
  }, []);

  // Save task statuses to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(taskStatuses).length > 0) {
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
    const content: any = {};

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
        reasoning += `Since your budget is $${budget}, free listings are your best investment. `;
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
        reasoning += `Since your budget is $${budget}, promotional messaging is a cost-effective way to boost sales. `;
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

    // 1) Business Summary
    let businessSummary = `You run a ${data.businessType || 'business'} with `;
    if (hasMinimalResources) {
      businessSummary += 'very limited resources. ';
    } else if (isLowBudget || hasLimitedTime || isSmallTeam) {
      businessSummary += 'limited resources. ';
    } else {
      businessSummary += 'moderate resources. ';
    }
    
    businessSummary += `You have ₹${budget.toFixed(0)} per month budget, ${timePerDay} hours available per day, and ${workers} worker${workers !== 1 ? 's' : ''}. `;
    
    if (hasMinimalResources) {
      businessSummary += 'Given these constraints, we\'ll prioritize the most impactful, low-cost methods that require minimal ongoing effort.';
    } else if (hasLimitedTime && isLowBudget) {
      businessSummary += 'Since time and budget are limited, we\'ll prioritize methods that can be automated or require minimal daily effort.';
    } else if (hasLimitedTime) {
      businessSummary += 'With limited time available, we\'ll focus on efficient methods that can be managed with minimal daily involvement.';
    } else if (isLowBudget) {
      businessSummary += 'With a limited budget, we\'ll emphasize free and low-cost strategies that maximize your resources.';
    }

    // 2) Growth Goal Identified
    let growthGoalIdentified = '';
    if (growthGoal === 'visibility') {
      growthGoalIdentified = `🎯 INCREASE VISIBILITY: Your goal is to make your ${data.businessType || 'business'} more discoverable and recognizable within ${timeSpan} days. This means focusing on awareness and discovery - getting your business noticed online, in local search results, and in your community. We'll prioritize local search presence, community outreach, and basic social media presence. Sales tactics are secondary here - this is about making sure people know you exist and can find you when they need what you offer.`;
    } else if (growthGoal === 'sales') {
      growthGoalIdentified = `💰 INCREASE SALES: Your goal is revenue growth within ${timeSpan} days. This is conversion-focused - turning interested people into paying customers. We'll prioritize direct marketing, promotions, customer outreach, and conversion optimization. Visibility methods are secondary here - this is about driving immediate purchases through offers, repeat customer engagement, and creating urgency. Every strategy will be measured by its ability to generate revenue.`;
    } else if (growthGoal === 'expansion') {
      growthGoalIdentified = `🚀 BUSINESS EXPANSION: Your goal is to scale and grow your business within ${timeSpan} days. This isn't about short-term visibility or immediate sales - it's about building the foundation for long-term growth. We'll focus on scalability, partnerships, collaborations, market research, and operational improvements. Short-term promotional tactics are avoided - this is about preparing your business to handle more locations, more customers, or new revenue streams.`;
    }

    // 3) Recommended Growth Methods (Goal-Specific) with explanations
    const methods: Array<{ method: string; explanation: string }> = [];
    
    if (growthGoal === 'visibility') {
      // Visibility-focused methods with WHY explanations
      methods.push({
        method: 'Google Business Profile setup and optimization',
        explanation: 'WHY: Free and essential for local visibility. When people search for your business type in your area, your profile appears first. This is the foundation of local discovery - 46% of Google searches are local.'
      });
      methods.push({
        method: 'Submit to all major local directories (Yelp, Yellow Pages, Bing Places, etc.)',
        explanation: 'WHY: Increases your chances of being found across multiple platforms. Each directory listing is another opportunity for discovery. People use different platforms, so being everywhere maximizes visibility.'
      });
      methods.push({
        method: 'Focus on collecting and responding to online reviews',
        explanation: 'WHY: Reviews improve your search rankings and build trust. More reviews = higher visibility in search results. Responding shows you care, which encourages more customers to leave reviews.'
      });
      
      if (canDoSocialMedia) {
        if (timePerDay >= 1.5) {
          methods.push({
            method: 'Instagram account with daily posts focusing on brand awareness',
            explanation: 'WHY: Visual platform perfect for showing your business personality. Daily posts keep you top-of-mind and help people discover you through hashtags and location tags.'
          });
        }
        if (timePerDay >= 2) {
          methods.push({
            method: 'Facebook business page with regular updates',
            explanation: 'WHY: Most people use Facebook - having a presence there makes you discoverable to local community members. Regular updates keep your business visible in their feeds.'
          });
        }
        if (timePerDay >= 2 && workers >= 2) {
          methods.push({
            method: 'YouTube channel with behind-the-scenes and educational content',
            explanation: 'WHY: Video content ranks well in search and helps people get to know your business. Educational content positions you as an expert, increasing visibility and trust.'
          });
        }
      }
      
      methods.push({
        method: 'Local SEO optimization (keywords, location tags, local backlinks)',
        explanation: 'WHY: Makes your website appear when people search for what you offer in your area. Proper keywords and location tags ensure search engines understand where you are and what you do.'
      });
      methods.push({
        method: 'Participate in local community events for brand visibility',
        explanation: 'WHY: Face-to-face presence builds local recognition. People remember businesses they see at events, and it creates word-of-mouth visibility that online methods can\'t replace.'
      });
      methods.push({
        method: 'Engage with local community groups and forums',
        explanation: 'WHY: Being active in local online communities puts your business name in front of potential customers. Helpful participation builds visibility and trust without being salesy.'
      });
      
      if (budget >= 50) {
        methods.push({
          method: `Google Ads local search campaigns (budget: ₹${Math.min(budget * 0.4, 150).toFixed(0)}/month)`,
          explanation: 'WHY: Paid ads guarantee your business appears at the top of search results for relevant local searches. This accelerates visibility when organic methods need time to work.'
        });
      }
      
    } else if (growthGoal === 'sales') {
      // Sales-focused methods with WHY explanations
      methods.push({
        method: 'Google Business Profile with special offers and promotions prominently displayed',
        explanation: 'WHY: When people find you, they immediately see your offers. This converts discovery into sales. Promotions create urgency and drive immediate action.'
      });
      methods.push({
        method: 'Create and promote limited-time discounts or special offers',
        explanation: 'WHY: Scarcity and urgency drive purchases. Limited-time offers create FOMO (fear of missing out) and motivate people to buy now rather than later.'
      });
      methods.push({
        method: 'Direct customer outreach via phone/email to previous customers',
        explanation: 'WHY: Past customers are your easiest sales - they already know and trust you. Personal outreach has the highest conversion rate. A simple call or email can bring back business.'
      });
      
      if (!hasVeryLimitedTime) {
        methods.push({
          method: 'In-store promotions and upselling strategies',
          explanation: 'WHY: Maximizes revenue from customers already in your store. Upselling increases average transaction value - turning a ₹500 sale into ₹750 with minimal effort.'
        });
        methods.push({
          method: 'Customer referral program with incentives',
          explanation: 'WHY: Your existing customers become your sales team. Referrals convert at 3x the rate of cold leads. Incentives motivate customers to bring friends, creating new sales.'
        });
        methods.push({
          method: 'Follow-up campaigns for customers who haven\'t purchased recently',
          explanation: 'WHY: Reactivating past customers is cheaper than finding new ones. A simple "we miss you" message with an offer can bring back lapsed customers and generate immediate sales.'
        });
      }
      
      if (canDoSocialMedia && timePerDay >= 1.5) {
        methods.push({
          method: 'Instagram/Facebook with promotional posts and sales announcements',
          explanation: 'WHY: Social media reaches customers where they spend time. Promotional posts create awareness of offers and drive traffic to your store or website, converting to sales.'
        });
        methods.push({
          method: 'Email marketing campaigns for special offers',
          explanation: 'WHY: Email has the highest ROI of any marketing channel. Sending targeted offers to your email list directly drives sales. People check email regularly, so your offers get seen.'
        });
      }
      
      methods.push({
        method: 'Optimize pricing and create urgency (limited stock, flash sales)',
        explanation: 'WHY: Psychological triggers like scarcity and urgency increase conversion rates. "Only 3 left" or "Sale ends today" motivates immediate purchase decisions.'
      });
      methods.push({
        method: 'Partner with complementary businesses for cross-promotions',
        explanation: 'WHY: Access to each other\'s customer bases multiplies your reach. Joint promotions create value for both businesses and drive sales through new customer acquisition.'
      });
      
      if (budget >= 100) {
        methods.push({
          method: `Targeted social media ads promoting specific products/services (budget: ₹${Math.min(budget * 0.6, 300).toFixed(0)}/month)`,
          explanation: 'WHY: Paid ads target people actively looking to buy. You can show ads to people interested in your products, in your area, at the right time - maximizing conversion potential.'
        });
      }
      
    } else if (growthGoal === 'expansion') {
      // Expansion-focused methods with WHY explanations
      methods.push({
        method: 'Market research for potential new locations or target markets',
        explanation: 'WHY: Expansion without research is risky. Understanding new markets, customer needs, and competition prevents costly mistakes and identifies the best opportunities for growth.'
      });
      methods.push({
        method: 'Analyze competitors and identify expansion opportunities',
        explanation: 'WHY: Learning from competitors shows what works and what doesn\'t. You can identify gaps in the market and opportunities they\'ve missed, giving you a competitive advantage in expansion.'
      });
      methods.push({
        method: 'Build strategic partnerships for scaling',
        explanation: 'WHY: Partnerships provide resources, expertise, and market access you don\'t have alone. They accelerate expansion by sharing costs, risks, and knowledge needed for growth.'
      });
      
      if (!hasVeryLimitedTime) {
        methods.push({
          method: 'Network with other business owners and industry contacts',
          explanation: 'WHY: Relationships open doors. Networking provides access to suppliers, investors, mentors, and opportunities. Many expansion opportunities come through personal connections.'
        });
        methods.push({
          method: 'Attend trade shows or industry events',
          explanation: 'WHY: Industry events are where expansion opportunities are found. You meet suppliers, partners, investors, and learn about new markets and technologies that support growth.'
        });
      }
      
      methods.push({
        method: 'Strengthen online presence to support multiple locations/channels',
        explanation: 'WHY: A strong online presence supports expansion by making you discoverable in new markets. It also allows you to test new markets online before committing to physical locations.'
      });
      methods.push({
        method: 'Develop systems and processes that can scale',
        explanation: 'WHY: Without scalable systems, expansion fails. Documented processes ensure quality and consistency as you grow. What works for one location must work for multiple locations.'
      });
      methods.push({
        method: 'Build supplier and vendor relationships for growth',
        explanation: 'WHY: Reliable suppliers are essential for expansion. Strong relationships ensure you can get products/services at good prices and in the quantities needed for growth.'
      });
      
      if (canDoSocialMedia) {
        methods.push({
          method: 'Social media showcasing business growth and success stories',
          explanation: 'WHY: Demonstrating success attracts partners, investors, and customers. Success stories build credibility and show your business is ready for and capable of expansion.'
        });
      }
      
      if (budget >= 200) {
        methods.push({
          method: `Professional business consulting or market analysis services (budget: ₹${Math.min(budget * 0.3, 500).toFixed(0)}/month)`,
          explanation: 'WHY: Expert guidance prevents costly expansion mistakes. Consultants provide market insights, strategic planning, and experience you may lack, significantly improving expansion success rates.'
        });
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

    // 5) Weekly Action Plan (Goal-Specific) with worker assignments
    let weeklyPlanPlain: { day: string; tasks: string[] }[] = [];

    if (growthGoal === 'visibility') {
      if (workers === 1) {
        // Single worker plan
        weeklyPlanPlain = [
          {
            day: 'Monday',
            tasks: [
              'You: Respond to all new reviews and customer messages (AI drafts responses, you personalize)',
              'AI: Auto-posts 1-2 visibility-focused social media updates (you approve)',
              'You: Research and submit to 2-3 new local directories (AI suggests directories)',
            ],
          },
          {
            day: 'Tuesday',
            tasks: [
              'You: Take 5-7 new photos for online listings and social media',
              'You: Update Google Business Profile with new photos (AI suggests captions)',
              'You: Engage with local community groups online (20-30 minutes)',
            ],
          },
          {
            day: 'Wednesday',
            tasks: [
              'AI: Creates content calendar for next week\'s social media (you review and approve)',
              'You: Optimize existing listings with better keywords (AI suggests keywords)',
              'You: Research local events to attend or sponsor',
            ],
          },
          {
            day: 'Thursday',
            tasks: [
              'AI: Posts social media update and drafts comment responses (you engage personally)',
              'You: Reach out to local influencers or bloggers (AI drafts outreach message)',
              'You: Check SEO rankings and make improvements',
            ],
          },
          {
            day: 'Friday',
            tasks: [
              'AI: Compiles visibility metrics report (you review and decide next steps)',
              'You: Plan weekend community event participation',
              'AI: Schedules next week\'s visibility-focused tasks (you approve schedule)',
            ],
          },
        ];
      } else if (workers === 2) {
        // Two worker plan with assignments
        weeklyPlanPlain = [
          {
            day: 'Monday',
            tasks: [
              'Worker 1: Respond to all new reviews and customer messages (AI drafts, Worker 1 personalizes)',
              'Worker 2: Post 1-2 visibility-focused social media updates (AI creates content, Worker 2 posts)',
              'Worker 1: Research and submit to 2-3 new local directories (AI suggests directories)',
            ],
          },
          {
            day: 'Tuesday',
            tasks: [
              'Worker 2: Take 5-7 new photos for online listings and social media',
              'Worker 1: Update Google Business Profile with new photos (AI suggests captions)',
              'Worker 2: Engage with local community groups online (20-30 minutes)',
            ],
          },
          {
            day: 'Wednesday',
            tasks: [
              'AI: Creates content calendar for next week (both workers review)',
              'Worker 1: Optimize existing listings with keywords (AI suggests keywords)',
              'Worker 2: Research local events to attend or sponsor',
            ],
          },
          {
            day: 'Thursday',
            tasks: [
              'Worker 2: Posts social media update and engages with comments (AI drafts responses)',
              'Worker 1: Reaches out to local influencers (AI drafts outreach message)',
              'Worker 2: Checks SEO rankings and makes improvements',
            ],
          },
          {
            day: 'Friday',
            tasks: [
              'AI: Compiles visibility metrics report (both workers review together)',
              'Worker 1: Plans weekend community event participation',
              'Worker 2: Reviews and approves next week\'s AI-scheduled tasks',
            ],
          },
        ];
      } else {
        // Three or more workers
        weeklyPlanPlain = [
          {
            day: 'Monday',
            tasks: [
              'Worker 1: Responds to reviews and messages (AI drafts, Worker 1 personalizes)',
              'Worker 2: Posts social media updates (AI creates content)',
              'Worker 3: Submits to local directories (AI suggests directories)',
            ],
          },
          {
            day: 'Tuesday',
            tasks: [
              'Worker 2: Takes photos for listings (AI suggests photo ideas)',
              'Worker 1: Updates Google Business Profile (AI suggests captions)',
              'Worker 3: Engages with community groups (AI suggests talking points)',
            ],
          },
          {
            day: 'Wednesday',
            tasks: [
              'AI: Creates content calendar (all workers review)',
              'Worker 1: Optimizes listings (AI suggests keywords)',
              'Worker 2: Researches local events',
            ],
          },
          {
            day: 'Thursday',
            tasks: [
              'Worker 2: Posts social media and engages (AI drafts responses)',
              'Worker 1: Reaches out to influencers (AI drafts messages)',
              'Worker 3: Checks SEO and makes improvements',
            ],
          },
          {
            day: 'Friday',
            tasks: [
              'AI: Compiles metrics report (all workers review)',
              'Worker 1: Plans weekend events',
              'Worker 2: Reviews next week\'s AI-scheduled tasks',
            ],
          },
        ];
      }
      
    } else if (growthGoal === 'sales') {
      if (workers === 1) {
        weeklyPlanPlain = [
          {
            day: 'Monday',
            tasks: [
              'You: Launch weekly promotion (AI creates promotional copy, you finalize)',
              'AI: Announces promotion on all social media and email (you approve before sending)',
              'You: Train yourself on current promotions and upselling techniques',
            ],
          },
          {
            day: 'Tuesday',
            tasks: [
              'You: Reach out to 5-10 previous customers with special offer (AI drafts personalized messages)',
              'You: Update Google Business Profile with current promotions',
              'You: Check inventory and create urgency messaging (AI suggests urgency copy)',
            ],
          },
          {
            day: 'Wednesday',
            tasks: [
              'You: Follow up on pending inquiries and convert to sales',
              'AI: Creates promotional content for next week (you review and approve)',
              'You: Analyze which products sell best and promote them (AI suggests promotion ideas)',
            ],
          },
          {
            day: 'Thursday',
            tasks: [
              'AI: Posts reminder about current promotion (you approve)',
              'You: Contact customers who haven\'t purchased recently (AI drafts messages)',
              'You: Evaluate promotion performance and adjust (AI provides analytics)',
            ],
          },
          {
            day: 'Friday',
            tasks: [
              'AI: Compiles sales data and revenue report (you review)',
              'You: Plan next week\'s promotions (AI suggests ideas)',
              'AI: Sends end-of-week promotional email (you approve)',
            ],
          },
        ];
      } else if (workers === 2) {
        weeklyPlanPlain = [
          {
            day: 'Monday',
            tasks: [
              'Worker 1: Launches weekly promotion (AI creates copy, Worker 1 finalizes)',
              'Worker 2: Announces promotion on social media (AI creates posts, Worker 2 posts)',
              'Worker 1: Trains Worker 2 on promotions and upselling',
            ],
          },
          {
            day: 'Tuesday',
            tasks: [
              'Worker 1: Reaches out to 5-10 previous customers (AI drafts messages)',
              'Worker 2: Updates Google Business Profile with promotions',
              'Worker 1: Checks inventory and creates urgency messaging (AI suggests copy)',
            ],
          },
          {
            day: 'Wednesday',
            tasks: [
              'Worker 2: Follows up on pending inquiries and converts to sales',
              'AI: Creates promotional content for next week (both workers review)',
              'Worker 1: Analyzes best-selling products (AI provides data)',
            ],
          },
          {
            day: 'Thursday',
            tasks: [
              'Worker 2: Posts promotion reminder (AI creates post)',
              'Worker 1: Contacts lapsed customers (AI drafts messages)',
              'Worker 2: Evaluates promotion performance (AI provides analytics)',
            ],
          },
          {
            day: 'Friday',
            tasks: [
              'AI: Compiles sales report (both workers review together)',
              'Worker 1: Plans next week\'s promotions (AI suggests ideas)',
              'Worker 2: Sends promotional email (AI drafts, Worker 2 approves)',
            ],
          },
        ];
      } else {
        weeklyPlanPlain = [
          {
            day: 'Monday',
            tasks: [
              'Worker 1: Launches promotion (AI creates copy)',
              'Worker 2: Announces on social media (AI creates posts)',
              'Worker 3: Trains team on upselling techniques',
            ],
          },
          {
            day: 'Tuesday',
            tasks: [
              'Worker 1: Reaches out to previous customers (AI drafts messages)',
              'Worker 2: Updates Google Business Profile',
              'Worker 3: Creates urgency messaging (AI suggests copy)',
            ],
          },
          {
            day: 'Wednesday',
            tasks: [
              'Worker 2: Follows up on inquiries',
              'AI: Creates next week\'s content (all review)',
              'Worker 1: Analyzes sales data (AI provides insights)',
            ],
          },
          {
            day: 'Thursday',
            tasks: [
              'Worker 3: Posts promotion reminders (AI creates)',
              'Worker 1: Contacts lapsed customers (AI drafts)',
              'Worker 2: Evaluates performance (AI provides analytics)',
            ],
          },
          {
            day: 'Friday',
            tasks: [
              'AI: Compiles sales report (all review)',
              'Worker 1: Plans next promotions (AI suggests)',
              'Worker 2: Sends email (AI drafts)',
            ],
          },
        ];
      }
      
    } else if (growthGoal === 'expansion') {
      if (workers === 1) {
        weeklyPlanPlain = [
          {
            day: 'Monday',
            tasks: [
              'You: Research potential expansion opportunities (AI compiles market data)',
              'You: Analyze competitor expansion strategies (AI provides competitor analysis)',
              'You: Review business financials and expansion readiness (AI creates financial summary)',
            ],
          },
          {
            day: 'Tuesday',
            tasks: [
              'You: Network with other business owners (AI drafts networking messages)',
              'You: Research suppliers/vendors for scaling (AI suggests suppliers)',
              'You: Document current processes (AI creates documentation templates)',
            ],
          },
          {
            day: 'Wednesday',
            tasks: [
              'You: Reach out to potential partners (AI drafts partnership proposals)',
              'You: Develop expansion strategy (AI creates strategy framework)',
              'You: Research local regulations (AI compiles regulatory information)',
            ],
          },
          {
            day: 'Thursday',
            tasks: [
              'You: Attend networking events or industry meetings',
              'You: Evaluate potential new markets (AI provides market analysis)',
              'You: Create systems for scaling (AI suggests scalable process templates)',
            ],
          },
          {
            day: 'Friday',
            tasks: [
              'AI: Compiles expansion research summary (you review and make decisions)',
              'You: Update business plan with expansion goals (AI creates plan template)',
              'You: Plan next steps and prioritize expansion tasks (AI suggests priorities)',
            ],
          },
        ];
      } else if (workers === 2) {
        weeklyPlanPlain = [
          {
            day: 'Monday',
            tasks: [
              'Worker 1: Researches expansion opportunities (AI compiles data)',
              'Worker 2: Analyzes competitor strategies (AI provides analysis)',
              'Worker 1: Reviews financials (AI creates summary)',
            ],
          },
          {
            day: 'Tuesday',
            tasks: [
              'Worker 2: Networks with business owners (AI drafts messages)',
              'Worker 1: Researches suppliers (AI suggests options)',
              'Worker 2: Documents processes (AI creates templates)',
            ],
          },
          {
            day: 'Wednesday',
            tasks: [
              'Worker 1: Reaches out to partners (AI drafts proposals)',
              'Worker 2: Develops expansion strategy (AI creates framework)',
              'Worker 1: Researches regulations (AI compiles info)',
            ],
          },
          {
            day: 'Thursday',
            tasks: [
              'Worker 2: Attends networking events',
              'Worker 1: Evaluates new markets (AI provides analysis)',
              'Worker 2: Creates scalable systems (AI suggests templates)',
            ],
          },
          {
            day: 'Friday',
            tasks: [
              'AI: Compiles research summary (both workers review together)',
              'Worker 1: Updates business plan (AI creates template)',
              'Worker 2: Plans next steps (AI suggests priorities)',
            ],
          },
        ];
      } else {
        weeklyPlanPlain = [
          {
            day: 'Monday',
            tasks: [
              'Worker 1: Researches opportunities (AI compiles data)',
              'Worker 2: Analyzes competitors (AI provides analysis)',
              'Worker 3: Reviews financials (AI creates summary)',
            ],
          },
          {
            day: 'Tuesday',
            tasks: [
              'Worker 1: Networks (AI drafts messages)',
              'Worker 2: Researches suppliers (AI suggests)',
              'Worker 3: Documents processes (AI creates templates)',
            ],
          },
          {
            day: 'Wednesday',
            tasks: [
              'Worker 1: Reaches out to partners (AI drafts proposals)',
              'Worker 2: Develops strategy (AI creates framework)',
              'Worker 3: Researches regulations (AI compiles)',
            ],
          },
          {
            day: 'Thursday',
            tasks: [
              'Worker 2: Attends events',
              'Worker 1: Evaluates markets (AI provides analysis)',
              'Worker 3: Creates systems (AI suggests templates)',
            ],
          },
          {
            day: 'Friday',
            tasks: [
              'AI: Compiles summary (all review)',
              'Worker 1: Updates business plan (AI creates template)',
              'Worker 2: Plans next steps (AI suggests priorities)',
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

    // 6) AI Contribution Summary
    const aiContribution: string[] = [
      'AI drafts all social media content, email templates, and marketing copy - you just review and approve',
      'AI generates SEO-optimized descriptions and keywords for all your listings automatically',
      'AI creates personalized customer outreach messages based on your business data',
      'AI analyzes your resources and prioritizes tasks to maximize impact with minimal effort',
      'AI schedules and organizes your weekly plan based on available time and workers',
      'AI prepares all content calendars, posting schedules, and marketing templates',
      'AI reduces manual work by 60-70%, allowing you to focus on customer service and business operations',
      'AI provides data-driven recommendations, but YOU make all final decisions',
    ];

    // Optional collaborations (only for expansion)
    let collaborations: string[] | undefined = undefined;
    
    if (growthGoal === 'expansion') {
      collaborations = [
        'Form strategic partnerships with suppliers or distributors',
        'Partner with complementary businesses for joint expansion',
        'Collaborate with investors or business mentors',
        'Join industry associations for expansion networking',
      ];
    }

    // Fundraising (optional, only if expansion goal)
    const fundraising: string[] | undefined = 
      growthGoal === 'expansion' && budget < 500
        ? [
            'Consider small crowdfunding campaign for specific expansion goals (OPTIONAL - only if comfortable)',
            'Explore local small business grants or loans (OPTIONAL - research carefully)',
            'Look into community investment programs (OPTIONAL - understand terms first)',
            'Research SBA loans or small business financing options (OPTIONAL - consult financial advisor)',
          ]
        : undefined;

    return {
      businessSummary,
      growthGoalIdentified,
      methods,
      automatedTasks,
      aiAssistedTasks,
      humanOnlyTasks,
      weeklyPlan,
      aiContribution,
      collaborations,
      fundraising,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Automatically send WhatsApp message when data is entered
    try {
      await sendWhatsAppMessage({
        shopName: inputs.businessType || 'New Business',
        businessType: inputs.businessType || 'Business',
        websiteLink: window.location.origin,
      });
    } catch (error) {
      console.error('WhatsApp message error:', error);
      // Continue even if WhatsApp fails
    }
    
    // Simulate processing time for better UX
    setTimeout(() => {
      const recs = generateRecommendations(inputs);
      setRecommendations(recs);
      
      // Schedule tasks from weekly plan
      if (recs.weeklyPlan && recs.weeklyPlan.length > 0) {
        const weeklyPlanPlain = recs.weeklyPlan.map(day => ({
          day: day.day,
          tasks: day.tasks.map(t => t.text),
        }));
        scheduleTasksFromWeeklyPlan(weeklyPlanPlain, parseInt(inputs.numberOfWorkers) || 1);
      }
      
      setIsLoading(false);
      
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
                Monthly Budget (₹ INR) *
              </label>
              <input
                type="number"
                id="budget"
                min="0"
                step="10"
                value={inputs.budget}
                onChange={(e) => setInputs({ ...inputs, budget: e.target.value })}
                placeholder="0"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Analyzing...' : 'Get My Growth Strategy'}
          </button>
        </form>
      </div>

      {recommendations && (
        <div id="results" className="space-y-6">
          {/* 1) Business Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1) Business Summary
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {recommendations.businessSummary}
            </p>
          </div>

          {/* 2) Growth Goal Identified */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2) Growth Goal Identified
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {recommendations.growthGoalIdentified}
            </p>
          </div>

          {/* 3) Recommended Growth Methods (Goal-Specific) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3) Recommended Growth Methods (Goal-Specific)
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 italic">
              Each method is specifically chosen for your selected growth goal. Here's WHY each one fits:
            </p>
            <div className="space-y-4">
              {recommendations.methods.map((methodItem, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 dark:bg-green-900/10 rounded-r">
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1 font-bold">✓</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">
                        {methodItem.method}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        {methodItem.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4) Task Breakdown (Goal-Specific) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4) Task Breakdown (Goal-Specific)
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 italic">
              Tasks are organized based on your selected growth goal. These lists change completely depending on whether you chose Visibility, Sales, or Expansion.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-3">
                  🤖 Automated Tasks (AI)
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400 mb-3">
                  AI can fully handle these without your input:
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
                  AI prepares, you review and approve:
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
                  Requires your personal touch and decision-making:
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
          </div>

          {/* 6) AI Contribution Summary */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg shadow-lg p-6 border-l-4 border-indigo-500">
            <h2 className="text-2xl font-bold text-indigo-800 dark:text-indigo-300 mb-4">
              6) AI Contribution Summary
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 italic">
              Here's exactly how AI reduces your workload and complexity:
            </p>
            <ul className="space-y-3">
              {recommendations.aiContribution.map((contribution, index) => (
                <li key={index} className="flex items-start text-indigo-700 dark:text-indigo-300">
                  <span className="text-indigo-500 mr-2 mt-1">🤖</span>
                  <span className="text-sm">{contribution}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 5) Weekly Action Plan (Goal-Specific) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5) Weekly Action Plan (Goal-Specific)
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This plan is completely customized for your selected growth goal and uses your available workers intelligently. Tasks are assigned to specific workers when you have multiple team members.
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

          {/* Optional Collaborations (only for expansion) */}
          {recommendations.collaborations && recommendations.collaborations.length > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-purple-800 dark:text-purple-300 mb-4">
                Optional Collaboration Ideas
              </h2>
              <p className="text-sm text-purple-700 dark:text-purple-400 mb-3 italic">
                Only suggested for Business Expansion goal. These are optional - consider only if they align with your vision.
              </p>
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

          {/* Optional Fundraising (only for expansion) */}
          {recommendations.fundraising && recommendations.fundraising.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-orange-800 dark:text-orange-300 mb-4">
                Optional Fundraising & Investment Ideas
              </h2>
              <p className="text-sm text-orange-700 dark:text-orange-400 mb-3 italic">
                Only suggested for Business Expansion goal. These are completely optional - only consider if you're comfortable with them. Always consult with financial advisors before making investment decisions.
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

          {/* Scheduling Calendar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <SchedulingCalendar
              weeklyPlan={recommendations.weeklyPlan.map(day => ({
                day: day.day,
                tasks: day.tasks.map(t => t.text),
              }))}
              workers={parseInt(inputs.numberOfWorkers) || 1}
            />
          </div>

          {/* 7) Safety & Responsibility Note */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-lg p-6 border-l-4 border-gray-400">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              7) Safety & Responsibility Note
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
              <strong>Results are not guaranteed.</strong> This AI assistant provides guidance and suggestions based on your inputs. All final decisions remain with you, the business owner.
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
              <strong>All spending, collaboration, and investment is optional and owner-controlled.</strong> You decide what to implement, when to implement it, and how much to spend. The AI only provides recommendations - you have full control.
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              Results may vary based on your local market, competition, execution quality, and many other factors. Always consider what feels right for your business and customers. This is a tool to assist you, not replace your judgment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}