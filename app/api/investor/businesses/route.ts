import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("electrospartans");

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

    if (!user || user.role !== "investor") {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    }

    const businesses = user.businesses || [];

    return NextResponse.json({ businesses });
  } catch (error) {
    console.error("Businesses fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId, business } = await req.json();

    if (!userId || !business) {
      return NextResponse.json(
        { error: "User ID and business are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("electrospartans");

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

    if (!user || user.role !== "investor") {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    }

    const businesses = user.businesses || [];
    businesses.push({
      ...business,
      id: new ObjectId().toString(),
      createdAt: new Date(),
    });

    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { businesses: businesses } }
    );

    return NextResponse.json({ success: true, businesses });
  } catch (error) {
    console.error("Business add error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
