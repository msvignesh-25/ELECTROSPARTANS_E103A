import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");

    if (!vendorId) {
      return NextResponse.json({ error: "Vendor ID required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("electrospartans");

    const vendor = await db.collection("users").findOne({ _id: new ObjectId(vendorId) });

    if (!vendor || vendor.role !== "vendor") {
      return NextResponse.json({ error: "Invalid vendor" }, { status: 400 });
    }

    const notifications = vendor.notifications || [];

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { vendorId, notification } = await req.json();

    if (!vendorId || !notification) {
      return NextResponse.json(
        { error: "Vendor ID and notification are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("electrospartans");

    const vendor = await db.collection("users").findOne({ _id: new ObjectId(vendorId) });

    if (!vendor || vendor.role !== "vendor") {
      return NextResponse.json({ error: "Invalid vendor" }, { status: 400 });
    }

    const notifications = vendor.notifications || [];
    notifications.push({
      ...notification,
      id: new ObjectId().toString(),
      createdAt: new Date(),
      read: false,
    });

    await db.collection("users").updateOne(
      { _id: new ObjectId(vendorId) },
      { $set: { notifications: notifications } }
    );

    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error("Notification add error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { vendorId, notificationId } = await req.json();

    if (!vendorId || !notificationId) {
      return NextResponse.json(
        { error: "Vendor ID and notification ID are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("electrospartans");

    const vendor = await db.collection("users").findOne({ _id: new ObjectId(vendorId) });

    if (!vendor || vendor.role !== "vendor") {
      return NextResponse.json({ error: "Invalid vendor" }, { status: 400 });
    }

    const notifications = vendor.notifications || [];
    const updatedNotifications = notifications.map((notif: any) =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    );

    await db.collection("users").updateOne(
      { _id: new ObjectId(vendorId) },
      { $set: { notifications: updatedNotifications } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notification update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
