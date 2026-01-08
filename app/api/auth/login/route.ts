import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Check for hardcoded admin credentials
    if (normalizedEmail === "admin@gmail.com" && password === "adminai@assistant") {
      return NextResponse.json({
        success: true,
        user: {
          id: "admin",
          email: "admin@gmail.com",
          role: "admin",
          name: "Admin",
          businessType: null,
        },
      });
    }

    const client = await clientPromise;
    const db = client.db("electrospartans");

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const user = await db.collection("users").findOne({
      email: normalizedEmail,
      password: hashedPassword,
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
        businessType: user.businessType || null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
