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

    if (!user || user.role !== "customer") {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    }

    return NextResponse.json({ cart: user.cart || [] });
  } catch (error) {
    console.error("Cart fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId, cart } = await req.json();

    if (!userId || !cart) {
      return NextResponse.json(
        { error: "User ID and cart are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("electrospartans");

    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { cart: cart } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
