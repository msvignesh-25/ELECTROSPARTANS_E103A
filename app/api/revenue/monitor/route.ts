import { NextResponse } from "next/server";

// This endpoint should be called periodically (e.g., via cron job or scheduled task)
// to check revenue thresholds and send notifications

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    
    // Call the check-threshold endpoint
    const response = await fetch(`${baseUrl}/api/revenue/check-threshold`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: "Revenue monitoring completed",
      ...data,
    });
  } catch (error: any) {
    console.error("Revenue monitoring error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
