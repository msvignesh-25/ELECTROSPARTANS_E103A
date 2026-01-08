import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");
    const months = parseInt(searchParams.get("months") || "12");

    const client = await clientPromise;
    const db = client.db("electrospartans");

    // Get orders from database
    const orders = await db.collection("orders").find({}).toArray();

    // Calculate monthly revenue
    const monthlyRevenue: Record<string, number> = {};
    const now = new Date();

    // Initialize last N months
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyRevenue[monthKey] = 0;
    }

    // Calculate revenue from orders
    orders.forEach((order: any) => {
      const orderDate = new Date(order.createdAt || order.date || new Date());
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, "0")}`;
      
      if (monthlyRevenue.hasOwnProperty(monthKey)) {
        const amount = (order.price || 0) * (order.quantity || 1);
        monthlyRevenue[monthKey] += amount;
      }
    });

    // Convert to array format
    const revenueData = Object.entries(monthlyRevenue)
      .map(([month, revenue]) => {
        const [year, monthNum] = month.split("-");
        const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        return {
          month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          monthKey: month,
          revenue: Math.round(revenue),
          year: parseInt(year),
          monthNumber: parseInt(monthNum),
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.monthNumber - b.monthNumber;
      });

    return NextResponse.json({
      success: true,
      data: revenueData,
      totalRevenue: revenueData.reduce((sum, d) => sum + d.revenue, 0),
    });
  } catch (error: any) {
    console.error("Revenue fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
