// Detailed Marketing Plan Service - Generates VERY SPECIFIC, ACTION-ORIENTED plans
// Follows strict rules: no generic phrases, exact rupee breakdown, worker assignments

export interface DetailedAction {
  action: string; // WHAT to do
  how: string; // HOW to do it
  who: string; // WHO does it (Worker 1, Worker 2, etc.)
  cost: number; // Exact cost in rupees
  location?: string; // WHERE (if applicable)
  timing: string; // WHEN (daily, weekly, specific days)
}

export interface DetailedBudgetBreakdown {
  item: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  purpose: string;
}

export interface DetailedPlan {
  businessSummary: string;
  selectedGoal: string;
  exactActions: DetailedAction[];
  budgetBreakdown: DetailedBudgetBreakdown[];
  workerAssignments: Array<{
    worker: string;
    tasks: string[];
    timePerDay: number;
  }>;
  timeBasedExecution: Array<{
    period: string;
    actions: string[];
    expectedResults: string;
  }>;
  taskClassification: {
    automated: string[];
    aiAssisted: string[];
    humanOnly: string[];
  };
  aiContribution: string;
  safetyNote: string;
}

export function generateDetailedPlan(
  businessType: string,
  budget: number,
  timePerDay: number,
  workers: number,
  growthGoal: 'visibility' | 'sales' | 'expansion',
  timeSpan: number
): DetailedPlan {
  const actions: DetailedAction[] = [];
  const budgetItems: DetailedBudgetBreakdown[] = [];
  const workerTasks: Array<{ worker: string; tasks: string[]; timePerDay: number }> = [];
  const timeExecution: Array<{ period: string; actions: string[]; expectedResults: string }> = [];
  
  let remainingBudget = budget;
  const timePerWorker = timePerDay / workers;

  // Business Summary
  const businessSummary = `You run a ${businessType} with ₹${budget.toLocaleString('en-IN')} monthly budget, ${timePerDay} hours per day, and ${workers} worker${workers !== 1 ? 's' : ''}. Target: ${growthGoal === 'visibility' ? 'Increase Visibility' : growthGoal === 'sales' ? 'Increase Sales' : 'Business Expansion'} within ${timeSpan} days.`;

  // Goal-specific plan generation
  if (growthGoal === 'visibility') {
    // VISIBILITY GOAL - Only awareness actions
    
    // Pamphlet distribution
    if (remainingBudget >= 50) {
      const pamphletCost = Math.min(remainingBudget * 0.3, 200);
      const pamphletCount = Math.floor(pamphletCost / 0.4); // ₹0.40 per pamphlet
      remainingBudget -= pamphletCost;
      
      actions.push({
        action: `Distribute ${pamphletCount} pamphlets`,
        how: `Print ${pamphletCount} A5-sized pamphlets with shop name, address, phone, and key services. AI generates the content.`,
        who: workers >= 2 ? 'Worker 1' : 'You',
        cost: pamphletCost,
        location: 'Nearby bus stops, apartment complexes, local markets',
        timing: 'Every morning for first 5 days'
      });
      
      budgetItems.push({
        item: 'Pamphlets',
        quantity: pamphletCount,
        unitCost: 0.4,
        totalCost: pamphletCost,
        purpose: 'Physical awareness distribution'
      });
    }

    // Poster placement
    if (remainingBudget >= 30) {
      const posterCost = Math.min(remainingBudget * 0.2, 150);
      const posterCount = Math.floor(posterCost / 15); // ₹15 per poster
      remainingBudget -= posterCost;
      
      actions.push({
        action: `Place ${posterCount} posters`,
        how: `Print ${posterCount} A3 posters. AI designs content. Worker places them on community notice boards, local shops, and public spaces.`,
        who: workers >= 2 ? 'Worker 2' : 'You',
        cost: posterCost,
        location: 'Community notice boards, local shops, public spaces',
        timing: 'Week 1, then refresh every 2 weeks'
      });
      
      budgetItems.push({
        item: 'Posters',
        quantity: posterCount,
        unitCost: 15,
        totalCost: posterCost,
        purpose: 'Static visibility in high-traffic areas'
      });
    }

    // Google Maps optimization
    actions.push({
      action: 'Optimize Google Business Profile',
      how: 'Complete all profile sections: hours, photos, services, posts. AI writes descriptions. Worker takes and uploads photos.',
      who: 'You',
      cost: 0,
      location: 'Online (Google Business Profile)',
      timing: 'Day 1-2, then weekly updates'
    });

    // Local directory submissions
    actions.push({
      action: 'Submit to local directories',
      how: 'List business on Justdial, Sulekha, IndiaMART. AI writes business descriptions. Worker completes registrations.',
      who: workers >= 2 ? 'Worker 1' : 'You',
      cost: 0,
      location: 'Online directories',
      timing: 'Week 1, 2 hours total'
    });

    // Review collection
    actions.push({
      action: 'Collect and respond to reviews',
      how: 'Ask customers for Google reviews. AI drafts thank-you responses. Worker sends requests and responds.',
      who: workers >= 2 ? 'Worker 2' : 'You',
      cost: 0,
      location: 'Google Business Profile',
      timing: 'Daily, 15 minutes per day'
    });

    // Worker assignments
    for (let i = 1; i <= workers; i++) {
      const workerName = i === 1 ? 'You' : `Worker ${i}`;
      const tasks: string[] = [];
      
      if (i === 1) {
        tasks.push(`Optimize Google Business Profile (${Math.min(timePerWorker * 60, 120)} min on Day 1-2)`);
        tasks.push(`Submit to online directories (${Math.min(timePerWorker * 60, 120)} min in Week 1)`);
        if (budget >= 50) {
          tasks.push(`Distribute ${Math.floor((budget * 0.3) / 0.4)} pamphlets daily for 5 days (${Math.min(timePerWorker * 60, 60)} min per day)`);
        }
      } else if (i === 2) {
        tasks.push(`Place ${Math.floor((budget * 0.2) / 15)} posters in Week 1 (${Math.min(timePerWorker * 60, 90)} min)`);
        tasks.push(`Collect and respond to reviews daily (${Math.min(timePerWorker * 60, 15)} min per day)`);
      } else {
        tasks.push(`Assist with pamphlet distribution (${Math.min(timePerWorker * 60, 45)} min per day)`);
        tasks.push(`Help with directory submissions (${Math.min(timePerWorker * 60, 30)} min)`);
      }
      
      workerTasks.push({
        worker: workerName,
        tasks,
        timePerDay: timePerWorker
      });
    }

    // Time-based execution
    const weeks = Math.ceil(timeSpan / 7);
    for (let week = 1; week <= Math.min(weeks, 4); week++) {
      if (week === 1) {
        timeExecution.push({
          period: 'Week 1',
          actions: [
            'Day 1-2: Optimize Google Business Profile (You, 2 hours)',
            'Day 1-3: Submit to directories (Worker 1, 2 hours)',
            `Day 1-5: Distribute ${Math.floor((budget * 0.3) / 0.4)} pamphlets daily (Worker 1, 60 min/day)`,
            'Day 3-7: Place posters (Worker 2, 90 min total)',
            'Daily: Collect reviews (Worker 2, 15 min/day)'
          ],
          expectedResults: 'Business appears in Google Maps, listed in 3+ directories, 50+ people see pamphlets'
        });
      } else if (week === 2) {
        timeExecution.push({
          period: 'Week 2',
          actions: [
            'Continue daily review collection (15 min/day)',
            'Refresh posters if needed',
            'Respond to directory inquiries',
            'Post weekly updates on Google Business Profile'
          ],
          expectedResults: '5-10 new Google reviews, inquiries from directories start coming'
        });
      } else {
        timeExecution.push({
          period: `Week ${week}`,
          actions: [
            'Maintain review collection',
            'Update Google Business Profile weekly',
            'Respond to all directory inquiries promptly'
          ],
          expectedResults: `Steady increase in profile views and local search visibility`
        });
      }
    }

  } else if (growthGoal === 'sales') {
    // SALES GOAL - Only conversion actions
    
    // WhatsApp offer messages
    actions.push({
      action: 'Send WhatsApp offer messages to existing customers',
      how: 'AI generates personalized offers. Worker sends messages every Friday with limited-time discounts.',
      who: workers >= 2 ? 'Worker 1' : 'You',
      cost: 0,
      location: 'WhatsApp',
      timing: 'Every Friday, 30 minutes'
    });

    // In-store upselling
    actions.push({
      action: 'Implement in-store upselling',
      how: 'AI creates upselling scripts. Workers practice and use during customer interactions.',
      who: 'All workers',
      cost: 0,
      location: 'In-store',
      timing: 'Daily during customer interactions'
    });

    // Repeat customer reminders
    actions.push({
      action: 'Send reminders to repeat customers',
      how: 'AI identifies customers who haven\'t visited in 2+ weeks. Worker sends personalized reminder messages.',
      who: workers >= 2 ? 'Worker 2' : 'You',
      cost: 0,
      location: 'WhatsApp/SMS',
      timing: 'Weekly, 45 minutes'
    });

    // Limited-time offers
    if (remainingBudget >= 100) {
      const offerPrintCost = Math.min(remainingBudget * 0.4, 300);
      remainingBudget -= offerPrintCost;
      
      actions.push({
        action: 'Print and distribute limited-time offer flyers',
        how: `Print ${Math.floor(offerPrintCost / 0.5)} offer flyers. AI designs offers. Worker distributes to existing customers and nearby areas.`,
        who: workers >= 2 ? 'Worker 1' : 'You',
        cost: offerPrintCost,
        location: 'In-store and nearby areas',
        timing: 'Week 1 and Week 3, 2 hours each'
      });
      
      budgetItems.push({
        item: 'Offer Flyers',
        quantity: Math.floor(offerPrintCost / 0.5),
        unitCost: 0.5,
        totalCost: offerPrintCost,
        purpose: 'Promote limited-time offers to drive immediate sales'
      });
    }

    // Packaging inserts
    if (remainingBudget >= 50) {
      const insertCost = Math.min(remainingBudget, 200);
      remainingBudget -= insertCost;
      
      actions.push({
        action: 'Add offer inserts to packaging',
        how: `Print ${Math.floor(insertCost / 0.3)} small offer cards. AI writes offers. Worker inserts in every order.`,
        who: 'All workers',
        cost: insertCost,
        location: 'In-store packaging',
        timing: 'Daily with every order'
      });
      
      budgetItems.push({
        item: 'Packaging Inserts',
        quantity: Math.floor(insertCost / 0.3),
        unitCost: 0.3,
        totalCost: insertCost,
        purpose: 'Upsell and repeat purchase incentives'
      });
    }

    // Worker assignments
    for (let i = 1; i <= workers; i++) {
      const workerName = i === 1 ? 'You' : `Worker ${i}`;
      const tasks: string[] = [];
      
      if (i === 1) {
        tasks.push(`Send WhatsApp offers every Friday (${Math.min(timePerWorker * 60, 30)} min)`);
        tasks.push(`In-store upselling during shifts (${Math.min(timePerWorker * 60, 20)} min/day)`);
        if (budget >= 100) {
          tasks.push(`Distribute offer flyers in Week 1 and 3 (${Math.min(timePerWorker * 60, 120)} min each)`);
        }
      } else if (i === 2) {
        tasks.push(`Send repeat customer reminders weekly (${Math.min(timePerWorker * 60, 45)} min)`);
        tasks.push(`In-store upselling during shifts (${Math.min(timePerWorker * 60, 20)} min/day)`);
        tasks.push(`Add offer inserts to packaging (${Math.min(timePerWorker * 60, 10)} min/day)`);
      } else {
        tasks.push(`In-store upselling during shifts (${Math.min(timePerWorker * 60, 20)} min/day)`);
        tasks.push(`Add offer inserts to packaging (${Math.min(timePerWorker * 60, 10)} min/day)`);
      }
      
      workerTasks.push({
        worker: workerName,
        tasks,
        timePerDay: timePerWorker
      });
    }

    // Time-based execution
    const weeks = Math.ceil(timeSpan / 7);
    for (let week = 1; week <= Math.min(weeks, 4); week++) {
      if (week === 1) {
        timeExecution.push({
          period: 'Week 1',
          actions: [
            'Day 1: Print offer flyers (if budget allows)',
            'Day 1-7: Implement in-store upselling (all workers, daily)',
            'Day 1-7: Add offer inserts to every order (all workers, daily)',
            'Day 5 (Friday): Send WhatsApp offers to existing customers (Worker 1, 30 min)',
            'Day 7: Send repeat customer reminders (Worker 2, 45 min)'
          ],
          expectedResults: 'Immediate sales boost from offers, 10-20% increase in average order value from upselling'
        });
      } else if (week === 2) {
        timeExecution.push({
          period: 'Week 2',
          actions: [
            'Continue daily upselling and inserts',
            'Day 12 (Friday): Send second round of WhatsApp offers',
            'Day 14: Send reminders to customers who didn\'t respond to Week 1 offers'
          ],
          expectedResults: 'Repeat purchases from Week 1 customers, steady sales growth'
        });
      } else if (week === 3) {
        timeExecution.push({
          period: 'Week 3',
          actions: [
            'Day 15-17: Distribute new offer flyers (if budget allows)',
            'Continue all weekly routines',
            'Day 19 (Friday): Send third round of WhatsApp offers'
          ],
          expectedResults: 'Peak sales week from combined offers and flyers'
        });
      } else {
        timeExecution.push({
          period: `Week ${week}`,
          actions: [
            'Maintain all weekly routines',
            'Analyze which offers work best',
            'Focus on most effective methods'
          ],
          expectedResults: 'Sustained sales growth, optimized offer strategy'
        });
      }
    }

  } else {
    // EXPANSION GOAL - Only scale-oriented actions
    
    // Partner identification
    actions.push({
      action: 'Identify potential partners',
      how: 'AI researches nearby complementary businesses. Worker visits and discusses collaboration opportunities.',
      who: workers >= 2 ? 'Worker 1' : 'You',
      cost: 0,
      location: 'Nearby businesses',
      timing: 'Week 1-2, 2 hours per week'
    });

    // Collaboration meetings
    if (remainingBudget >= 200) {
      const meetingCost = Math.min(remainingBudget * 0.3, 500);
      remainingBudget -= meetingCost;
      
      actions.push({
        action: 'Conduct partnership meetings',
        how: 'AI drafts partnership proposals. Worker schedules and attends meetings with potential partners.',
        who: 'You',
        cost: meetingCost,
        location: 'Partner locations or neutral venues',
        timing: 'Week 2-3, 2-3 meetings'
      });
      
      budgetItems.push({
        item: 'Partnership Meetings',
        quantity: 2,
        unitCost: meetingCost / 2,
        totalCost: meetingCost,
        purpose: 'Establish collaboration agreements'
      });
    }

    // Pilot delivery tests
    if (remainingBudget >= 100) {
      const pilotCost = Math.min(remainingBudget * 0.2, 300);
      remainingBudget -= pilotCost;
      
      actions.push({
        action: 'Run pilot delivery/cross-selling tests',
        how: 'AI designs pilot program. Worker executes small-scale test with 1-2 partners.',
        who: workers >= 2 ? 'Worker 2' : 'You',
        cost: pilotCost,
        location: 'Partner locations',
        timing: 'Week 3-4, 4 hours total'
      });
      
      budgetItems.push({
        item: 'Pilot Program',
        quantity: 1,
        unitCost: pilotCost,
        totalCost: pilotCost,
        purpose: 'Test expansion feasibility'
      });
    }

    // Documentation
    actions.push({
      action: 'Create expansion documentation',
      how: 'AI drafts partnership agreements, expansion plans, and resource requirements. Worker reviews and finalizes.',
      who: 'You',
      cost: 0,
      location: 'Office/home',
      timing: 'Week 2-4, 1 hour per week'
    });

    // Worker assignments
    for (let i = 1; i <= workers; i++) {
      const workerName = i === 1 ? 'You' : `Worker ${i}`;
      const tasks: string[] = [];
      
      if (i === 1) {
        tasks.push(`Identify potential partners (${Math.min(timePerWorker * 60, 120)} min/week in Week 1-2)`);
        tasks.push(`Conduct partnership meetings (${Math.min(timePerWorker * 60, 180)} min in Week 2-3)`);
        tasks.push(`Create expansion documentation (${Math.min(timePerWorker * 60, 60)} min/week)`);
      } else if (i === 2) {
        tasks.push(`Assist with partner research (${Math.min(timePerWorker * 60, 60)} min/week)`);
        tasks.push(`Run pilot tests (${Math.min(timePerWorker * 60, 240)} min in Week 3-4)`);
      } else {
        tasks.push(`Support expansion activities (${Math.min(timePerWorker * 60, 90)} min/week)`);
      }
      
      workerTasks.push({
        worker: workerName,
        tasks,
        timePerDay: timePerWorker
      });
    }

    // Time-based execution
    const weeks = Math.ceil(timeSpan / 7);
    for (let week = 1; week <= Math.min(weeks, 4); week++) {
      if (week === 1) {
        timeExecution.push({
          period: 'Week 1',
          actions: [
            'Day 1-3: AI researches potential partners (You, 2 hours)',
            'Day 4-7: Visit 3-5 nearby businesses to discuss partnerships (You, 4 hours)',
            'Day 5-7: AI drafts initial partnership proposals (automated)'
          ],
          expectedResults: 'List of 3-5 potential partners, initial interest from 2-3 businesses'
        });
      } else if (week === 2) {
        timeExecution.push({
          period: 'Week 2',
          actions: [
            'Day 8-10: Schedule partnership meetings (You, 1 hour)',
            'Day 11-14: Conduct 2-3 partnership meetings (You, 3 hours, ₹' + Math.min(budget * 0.3, 500).toLocaleString('en-IN') + ')',
            'Day 12-14: AI creates detailed partnership agreements (automated)'
          ],
          expectedResults: '2-3 partnership agreements in principle, clear expansion roadmap'
        });
      } else if (week === 3) {
        timeExecution.push({
          period: 'Week 3',
          actions: [
            'Day 15-17: Finalize partnership agreements (You, 2 hours)',
            'Day 18-21: Start pilot delivery/cross-selling tests (Worker 2, 4 hours, ₹' + Math.min(budget * 0.2, 300).toLocaleString('en-IN') + ')',
            'Day 19-21: AI monitors pilot performance (automated)'
          ],
          expectedResults: '1-2 active partnerships, pilot test results, expansion feasibility confirmed'
        });
      } else {
        timeExecution.push({
          period: `Week ${week}`,
          actions: [
            'Scale successful partnerships',
            'Document lessons learned',
            'Plan next expansion phase'
          ],
          expectedResults: 'Sustainable expansion foundation, clear growth path'
        });
      }
    }
  }

  // Use remaining budget
  if (remainingBudget > 0 && budgetItems.length > 0) {
    const lastItem = budgetItems[budgetItems.length - 1];
    lastItem.totalCost += remainingBudget;
    lastItem.quantity = Math.floor(lastItem.totalCost / lastItem.unitCost);
  }

  // Task classification
  const automated = [
    'AI generates pamphlet/poster content',
    'AI writes business descriptions for directories',
    'AI drafts WhatsApp offer messages',
    'AI creates upselling scripts',
    'AI identifies repeat customers for reminders',
    'AI researches potential partners',
    'AI drafts partnership proposals'
  ];

  const aiAssisted = [
    'Worker reviews and approves AI-generated content before printing',
    'Worker uses AI-written scripts during customer interactions',
    'Worker sends AI-drafted messages after personalization',
    'Worker uses AI research to prioritize partner visits'
  ];

  const humanOnly = [
    'Physical pamphlet distribution',
    'Poster placement at locations',
    'Taking and uploading photos',
    'In-store customer interactions',
    'Attending partnership meetings',
    'Executing pilot tests'
  ];

  // AI Contribution Summary
  const aiContribution = `AI reduces your planning and content creation time by 70%. AI writes all text content (pamphlets, posters, offers, proposals), researches partners, identifies customers, and creates scripts. You only review, approve, and execute. This saves ${Math.round(timePerDay * 0.7 * workers)} hours per day across all workers.`;

  // Safety Note
  const safetyNote = `Results are not guaranteed. All spending, partnerships, and expansion decisions remain under your control. AI only assists with planning and content creation - you make all final decisions.`;

  return {
    businessSummary,
    selectedGoal: growthGoal === 'visibility' ? 'Increase Visibility' : growthGoal === 'sales' ? 'Increase Sales' : 'Business Expansion',
    exactActions: actions,
    budgetBreakdown: budgetItems,
    workerAssignments: workerTasks,
    timeBasedExecution: timeExecution,
    taskClassification: {
      automated,
      aiAssisted,
      humanOnly
    },
    aiContribution,
    safetyNote
  };
}
