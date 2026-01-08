import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("electrospartans");

    const users = await db.collection("users").find({}).toArray();

    const usersList = users.map((user) => ({
      _id: user._id.toString(),
      name: user.name || "",
      email: user.email || "",
      role: user.role || "",
      id: user.id || null,
      businessType: user.businessType || null,
      shops: user.shops || [],
    }));

    return NextResponse.json({ users: usersList });
  } catch (error) {
    console.error("Users fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
