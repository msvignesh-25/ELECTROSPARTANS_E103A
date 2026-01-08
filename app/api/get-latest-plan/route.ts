import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") || "vendor";
  const vendorBusinessType = searchParams.get("businessType") || "";

  const client = await clientPromise;
  const db = client.db("electrospartans");

  if (role === "investor") {
    const allPlans = await db
      .collection("weekly_plans")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    const plansByType = {
      bakery: allPlans.filter((p) => p.businessType === "bakery"),
      "repair shop": allPlans.filter((p) => p.businessType === "repair shop"),
      "cool drinks": allPlans.filter((p) => p.businessType === "cool drinks"),
    };

    return NextResponse.json({
      role: "investor",
      plansByType,
      totalPlans: allPlans.length,
    });
  } else if (role === "vendor") {
    const normalizedBusinessType = vendorBusinessType
      .toLowerCase()
      .includes("bakery")
      ? "bakery"
      : vendorBusinessType.toLowerCase().includes("repair") ||
        vendorBusinessType.toLowerCase().includes("mobile") ||
        vendorBusinessType.toLowerCase().includes("laptop")
      ? "repair shop"
      : vendorBusinessType.toLowerCase().includes("cool") ||
        vendorBusinessType.toLowerCase().includes("drink")
      ? "cool drinks"
      : "";

    const query: any = {};
    if (normalizedBusinessType) {
      query.businessType = normalizedBusinessType;
    }

    const vendorPlan = await db
      .collection("weekly_plans")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    return NextResponse.json(vendorPlan[0] || null);
  } else {
    const latestPlan = await db
      .collection("weekly_plans")
      .find()
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    return NextResponse.json(latestPlan[0] || null);
  }
}