import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const { vendorId, message, type } = await req.json();

    if (!vendorId || !message || !type) {
      return NextResponse.json(
        { error: "Vendor ID, message, and type are required" },
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
    const notification = {
      id: new ObjectId().toString(),
      message,
      type,
      createdAt: new Date(),
      read: false,
    };
    notifications.push(notification);

    await db.collection("users").updateOne(
      { _id: new ObjectId(vendorId) },
      { $set: { notifications: notifications } }
    );

    // Send WhatsApp message to vendor
    let whatsappSent = false;
    let whatsappError = null;
    
    // Get vendor's phone number (from shops or user profile)
    const vendorPhone = vendor.phone || (vendor.shops && vendor.shops[0]?.phone) || null;
    
    if (vendorPhone) {
      try {
        const whatsappMessage = `🔔 Notification from Admin\n\nType: ${type}\n\n${message}\n\nPlease check your vendor portal for more details.`;
        
        const whatsappRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/whatsapp/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phoneNumber: vendorPhone.replace(/\D/g, ""), // Remove non-digits
            message: whatsappMessage,
          }),
        });

        const whatsappData = await whatsappRes.json();
        whatsappSent = whatsappData.success || false;
        
        if (!whatsappSent) {
          whatsappError = whatsappData.error || "Unknown error";
        }

        // Log WhatsApp send attempt
        await db.collection("notification_logs").insertOne({
          notificationId: notification.id,
          vendorId: vendorId,
          vendorPhone: vendorPhone,
          message: whatsappMessage,
          whatsappSent,
          whatsappError,
          createdAt: new Date(),
        });
      } catch (whatsappErr: any) {
        whatsappError = whatsappErr.message;
        console.error("WhatsApp send error:", whatsappErr);
        
        // Still log the attempt
        await db.collection("notification_logs").insertOne({
          notificationId: notification.id,
          vendorId: vendorId,
          vendorPhone: vendorPhone,
          message: message,
          whatsappSent: false,
          whatsappError: whatsappError,
          createdAt: new Date(),
        });
      }
    } else {
      // Log that no phone number was available
      await db.collection("notification_logs").insertOne({
        notificationId: notification.id,
        vendorId: vendorId,
        vendorPhone: null,
        message: message,
        whatsappSent: false,
        whatsappError: "No phone number available for vendor",
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      notificationId: notification.id,
      whatsappSent,
      whatsappError,
    });
  } catch (error: any) {
    console.error("Send notification error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
