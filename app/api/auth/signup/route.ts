import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, password, role, name, businessType, id, phoneNumber } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("electrospartans");

    const existingUser = await db
      .collection("users")
      .findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 400 }
      );
    }

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const user = {
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role.toLowerCase(),
      name: name || "",
      id: id || null,
      phoneNumber: phoneNumber || null,
      businessType: businessType || null,
      createdAt: new Date(),
      cart: role === "customer" ? [] : undefined,
      businesses: role === "investor" ? [] : undefined,
    };

    await db.collection("users").insertOne(user);

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
