import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId, ...inputs } = await req.json();

  const client = await clientPromise;
  const db = client.db("electrospartans");

  const budget = parseFloat(inputs.budget) || 0;
  const timePerDay = parseFloat(inputs.timePerDay) || 0;
  const workers = parseInt(inputs.numberOfWorkers) || 1;
  const growthGoal = inputs.growthGoal || "visibility";
  const businessType = (inputs.businessType || "business").toLowerCase();

  const normalizeBusinessType = (type: string): "bakery" | "repair shop" | "cool drinks" | "other" => {
    const normalized = type.toLowerCase();
    if (normalized.includes("bakery") || normalized.includes("baker")) return "bakery";
    if (normalized.includes("repair") || normalized.includes("mobile") || normalized.includes("laptop")) return "repair shop";
    if (normalized.includes("cool") || normalized.includes("drink") || normalized.includes("beverage")) return "cool drinks";
    return "other";
  };

  const normalizedBusinessType = normalizeBusinessType(businessType);

  const generateBusinessSpecificTasks = (
    day: string,
    workerIndex: number,
    workerBudget: number
  ): Array<{
    text: string;
    reasoning: string;
    category: "AI-Prepared" | "AI-Assisted" | "Manual Action";
    budgetAllocated: number;
  }> => {
    const tasks: Array<{
      text: string;
      reasoning: string;
      category: "AI-Prepared" | "AI-Assisted" | "Manual Action";
      budgetAllocated: number;
    }> = [];

    if (normalizedBusinessType === "bakery") {
      if (day === "Monday") {
        tasks.push({
          text: "Reach out to 10-15 potential customers in local area for daily fresh bread orders",
          reasoning: "Personal outreach builds customer relationships. Direct contact is essential for bakery business.",
          category: "Manual Action",
          budgetAllocated: Math.min(workerBudget * 0.1, 200),
        });
        tasks.push({
          text: "Update Google Business Profile with today's special items and photos",
          reasoning: "AI can help structure content, but you need to add fresh bakery photos.",
          category: "AI-Assisted",
          budgetAllocated: 0,
        });
      } else if (day === "Tuesday") {
        tasks.push({
          text: "Distribute promotional flyers in nearby residential areas (200-300 flyers)",
          reasoning: "Physical marketing helps reach local customers. Budget covers printing and distribution.",
          category: "Manual Action",
          budgetAllocated: Math.min(workerBudget * 0.25, 500),
        });
        tasks.push({
          text: "Post on social media about fresh baked goods with customer photos",
          reasoning: "AI can draft posts, but you need to take photos and review before posting.",
          category: "AI-Assisted",
          budgetAllocated: 0,
        });
      } else if (day === "Wednesday") {
        tasks.push({
          text: "Partner with 2-3 local cafes or restaurants for supply contracts",
          reasoning: "B2B partnerships require human negotiation and relationship building.",
          category: "Manual Action",
          budgetAllocated: Math.min(workerBudget * 0.15, 300),
        });
      } else if (day === "Thursday") {
        tasks.push({
          text: "Organize a small sampling event at your bakery location",
          reasoning: "Events require human organization and customer interaction.",
          category: "Manual Action",
          budgetAllocated: Math.min(workerBudget * 0.3, 800),
        });
      } else if (day === "Friday") {
        tasks.push({
          text: "Follow up with previous customers for feedback and weekend orders",
          reasoning: "Customer retention requires personal touch and relationship management.",
          category: "Manual Action",
          budgetAllocated: Math.min(workerBudget * 0.1, 200),
        });
        tasks.push({
          text: "Review week's sales data and plan next week's special items",
          reasoning: "AI can analyze data, but you need to make decisions based on local preferences.",
          category: "AI-Assisted",
          budgetAllocated: 0,
        });
      }
    } else if (normalizedBusinessType === "repair shop") {
      if (day === "Monday") {
        tasks.push({
          text: "Reach out to 15-20 mobile/laptop owners in local area for repair services",
          reasoning: "Direct outreach helps build customer base. Many people need repair services.",
          category: "Manual Action",
          budgetAllocated: Math.min(workerBudget * 0.2, 400),
        });
        tasks.push({
          text: "List services on Justdial, Sulekha, and IndiaMART with AI-optimized descriptions",
          reasoning: "AI can help write compelling service descriptions for better visibility.",
          category: "AI-Assisted",
          budgetAllocated: 0,
        });
      } else if (day === "Tuesday") {
        tasks.push({
          text: "Distribute business cards and flyers near IT parks, colleges, and residential areas",
          reasoning: "Targeted distribution reaches potential customers who need repair services.",
          category: "Manual Action",
          budgetAllocated: Math.min(workerBudget * 0.3, 600),
        });
      } else if (day === "Wednesday") {
        tasks.push({
          text: "Partner with mobile shops, laptop dealers, and electronics stores for referral partnerships",
          reasoning: "Business partnerships require negotiation and relationship building.",
          category: "Manual Action",
          budgetAllocated: Math.min(workerBudget * 0.2, 400),
        });
      } else if (day === "Thursday") {
        tasks.push({
          text: "Offer door-to-door pickup service for repairs in nearby areas",
          reasoning: "Convenience service helps attract customers. Requires human coordination.",
          category: "Manual Action",
          budgetAllocated: Math.min(workerBudget * 0.15, 300),
        });
        tasks.push({
          text: "Create social media posts showcasing successful repairs and customer testimonials",
          reasoning: "AI can draft posts, but you need photos of repaired devices and customer approval.",
          category: "AI-Assisted",
          budgetAllocated: 0,
        });
      } else if (day === "Friday") {
        tasks.push({
          text: "Follow up with previous customers for repeat business and referrals",
          reasoning: "Customer retention and referrals are crucial for repair business growth.",
          category: "Manual Action",
          budgetAllocated: Math.min(workerBudget * 0.15, 300),
        });
      }
    } else if (normalizedBusinessType === "cool drinks") {
      if (day === "Monday") {
        tasks.push({
          text: "Reach out to 20-25 local shops, restaurants, and event organizers for bulk orders",
          reasoning: "B2B sales require personal outreach and relationship building.",
          category: "Manual Action",
          budgetAllocated: Math.min(workerBudget * 0.25, 500),
        });
        tasks.push({
          text: "Update social media with refreshing drink photos and special offers",
          reasoning: "AI can draft posts, but fresh product photos are essential.",
          category: "AI-Assisted",
          budgetAllocated: 0,
        });
      } else if (day === "Tuesday") {
        tasks.push({
          text: "Distribute samples at busy locations like markets, bus stops, and events",
          reasoning: "Taste sampling directly converts to sales. Requires physical presence.",
          category: "Manual Action",
          budgetAllocated: Math.min(workerBudget * 0.3, 700),
        });
      } else if (day === "Wednesday") {
        tasks.push({
          text: "Partner with local events, parties, and gatherings for bulk supply contracts",
          reasoning: "Event partnerships require negotiation and reliable delivery.",
          category: "Manual Action",
          budgetAllocated: Math.min(workerBudget * 0.2, 400),
        });
      } else if (day === "Thursday") {
        tasks.push({
          text: "Set up a mobile kiosk or stall at high-footfall locations",
          reasoning: "Physical presence in high-traffic areas increases visibility and sales.",
          category: "Manual Action",
          budgetAllocated: Math.min(workerBudget * 0.15, 300),
        });
      } else if (day === "Friday") {
        tasks.push({
          text: "Follow up with restaurant and shop owners for weekend bulk orders",
          reasoning: "Weekend planning requires early coordination with businesses.",
          category: "Manual Action",
          budgetAllocated: Math.min(workerBudget * 0.1, 200),
        });
      }
    } else {
      if (day === "Monday") {
        tasks.push({
          text: "Reach out to 10-15 potential customers via phone or WhatsApp",
          reasoning: "Personal outreach helps build customer relationships and awareness.",
          category: "Manual Action",
          budgetAllocated: Math.min(workerBudget * 0.2, 400),
        });
        tasks.push({
          text: "Optimize Google Business Profile with business details and photos",
          reasoning: "AI can help structure content, but you need to add authentic photos.",
          category: "AI-Assisted",
          budgetAllocated: 0,
        });
      } else if (day === "Tuesday") {
        tasks.push({
          text: "List business on local directories (Justdial, Sulekha, IndiaMART)",
          reasoning: "Online visibility is crucial. AI can help optimize listings.",
          category: "AI-Assisted",
          budgetAllocated: 0,
        });
        if (budget >= 500) {
          tasks.push({
            text: "Distribute promotional materials in target areas",
            reasoning: "Physical marketing complements online efforts.",
            category: "Manual Action",
            budgetAllocated: Math.min(workerBudget * 0.3, 600),
          });
        }
      } else if (day === "Wednesday") {
        tasks.push({
          text: "Partner with complementary local businesses for cross-promotion",
          reasoning: "Partnerships expand reach. Requires human negotiation.",
          category: "Manual Action",
          budgetAllocated: Math.min(workerBudget * 0.15, 300),
        });
      } else if (day === "Thursday") {
        tasks.push({
          text: "Create and post social media content about your business",
          reasoning: "AI can draft posts, but you need authentic content and photos.",
          category: "AI-Assisted",
          budgetAllocated: 0,
        });
      } else if (day === "Friday") {
        tasks.push({
          text: "Analyze week's performance and plan next week's strategy",
          reasoning: "AI can analyze data, but strategic decisions need human insight.",
          category: "AI-Assisted",
          budgetAllocated: 0,
        });
        tasks.push({
          text: "Follow up with customers for feedback and repeat business",
          reasoning: "Customer retention requires personal touch.",
          category: "Manual Action",
          budgetAllocated: Math.min(workerBudget * 0.15, 300),
        });
      }
    }

    if (tasks.length === 0) {
      tasks.push({
        text: `Continue ${businessType} growth activities based on your resources`,
        reasoning: "Consistent daily effort is key to achieving your growth goals.",
        category: "Manual Action",
        budgetAllocated: Math.min(workerBudget * 0.1, 200),
      });
    }

    return tasks;
  };

  const budgetPerWorker = Math.floor(budget / workers);
  const workerAssignments: Array<{
    worker: string;
    weeklyPlan: Array<{
      day: string;
      tasks: Array<{
        text: string;
        reasoning: string;
        category: "AI-Prepared" | "AI-Assisted" | "Manual Action";
        budgetAllocated: number;
      }>;
    }>;
    totalBudgetAllocated: number;
  }> = [];

  for (let i = 0; i < workers; i++) {
    const workerName = i === 0 ? "You" : `Worker ${i + 1}`;
    const workerBudget = i === 0 ? budgetPerWorker + (budget % workers) : budgetPerWorker;
    
    const weeklyPlan = [
      {
        day: "Monday",
        tasks: generateBusinessSpecificTasks("Monday", i, workerBudget),
      },
      {
        day: "Tuesday",
        tasks: generateBusinessSpecificTasks("Tuesday", i, workerBudget),
      },
      {
        day: "Wednesday",
        tasks: generateBusinessSpecificTasks("Wednesday", i, workerBudget),
      },
      {
        day: "Thursday",
        tasks: generateBusinessSpecificTasks("Thursday", i, workerBudget),
      },
      {
        day: "Friday",
        tasks: generateBusinessSpecificTasks("Friday", i, workerBudget),
      },
    ];

    const totalBudgetAllocated = weeklyPlan.reduce(
      (sum, day) =>
        sum + day.tasks.reduce((taskSum, task) => taskSum + task.budgetAllocated, 0),
      0
    );

    workerAssignments.push({
      worker: workerName,
      weeklyPlan,
      totalBudgetAllocated,
    });
  }

  const collaborationIdeas = [
    "Partner with complementary local businesses for cross-promotion",
    "Collaborate with local influencers or micro-influencers for free product/service exchange",
    "Join or create a local business association for shared marketing efforts",
    "Partner with local community centers or schools for events",
  ];

  const plan = {
    inputs,
    workerAssignments,
    collaborationIdeas,
    businessType: normalizedBusinessType,
    userId: userId || null,
    createdAt: new Date(),
  };

  await db.collection("weekly_plans").insertOne(plan);

  if (userId) {
    const { ObjectId } = await import("mongodb");
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { lastPlanSubmitted: new Date() } }
    );
  }

  return NextResponse.json({ success: true });
}