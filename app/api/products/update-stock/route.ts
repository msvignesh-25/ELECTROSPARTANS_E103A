import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const { productId, quantity } = await req.json();

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: "Product ID and quantity are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("electrospartans");

    await db.collection("products").updateOne(
      { _id: new ObjectId(productId) },
      { $inc: { stock: -quantity } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Stock update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
