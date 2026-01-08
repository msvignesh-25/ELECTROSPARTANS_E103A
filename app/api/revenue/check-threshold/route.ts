import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

const MINIMUM_REVENUE_THRESHOLD = parseFloat(process.env.MINIMUM_REVENUE_THRESHOLD || "50000");

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("electrospartans");

    // Get all vendors
    const vendors = await db.collection("users").find({ role: "vendor" }).toArray();
    
    // Get current month orders
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const orders = await db.collection("orders").find({}).toArray();

    // Calculate current month revenue per vendor
    const vendorRevenues: Record<string, number> = {};

    orders.forEach((order: any) => {
      const orderDate = new Date(order.createdAt || order.date || new Date());
      if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
        const vendorId = order.vendorId || order.userId || "unknown";
        const amount = (order.price || 0) * (order.quantity || 1);
        vendorRevenues[vendorId] = (vendorRevenues[vendorId] || 0) + amount;
      }
    });

    const notificationsSent: Array<{
      vendorId: string;
      vendorName: string;
      revenue: number;
      phoneNumber: string | null;
      whatsappSent: boolean;
    }> = [];

    // Check each vendor
    for (const vendor of vendors) {
      const vendorId = vendor._id.toString();
      const currentRevenue = vendorRevenues[vendorId] || 0;

      if (currentRevenue >= MINIMUM_REVENUE_THRESHOLD) {
        // Check if notification already sent this month
        const existingNotification = (vendor.notifications || []).find((n: any) => {
          const notifDate = new Date(n.createdAt);
          return (
            n.message?.includes("reached the minimum revenue threshold") &&
            notifDate.getMonth() === currentMonth &&
            notifDate.getFullYear() === currentYear
          );
        });

        if (!existingNotification) {
          // Get vendor phone number
          const vendorPhone = vendor.phone || (vendor.shops && vendor.shops[0]?.phone) || null;

          // Add notification
          const notifications = vendor.notifications || [];
          const notification = {
            id: new ObjectId().toString(),
            message: `🎉 Congratulations! Your business has reached the minimum revenue threshold of ₹${MINIMUM_REVENUE_THRESHOLD.toLocaleString('en-IN')} this month. Current revenue: ₹${currentRevenue.toLocaleString('en-IN')}. Keep up the great work!`,
            type: "info",
            createdAt: new Date(),
            read: false,
          };
          notifications.push(notification);

          await db.collection("users").updateOne(
            { _id: vendor._id },
            { $set: { notifications: notifications } }
          );

          // Send WhatsApp message
          let whatsappSent = false;
          if (vendorPhone) {
            try {
              const whatsappMessage = `🎉 Revenue Milestone Achieved!\n\nYour business has reached the minimum revenue threshold of ₹${MINIMUM_REVENUE_THRESHOLD.toLocaleString('en-IN')} this month.\n\nCurrent Revenue: ₹${currentRevenue.toLocaleString('en-IN')}\n\nKeep up the great work! 🚀`;

              const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
              const whatsappRes = await fetch(`${baseUrl}/api/whatsapp/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  phoneNumber: vendorPhone.replace(/\D/g, ""),
                  message: whatsappMessage,
                }),
              });

              const whatsappData = await whatsappRes.json();
              whatsappSent = whatsappData.success || false;

              // Log notification
              await db.collection("notification_logs").insertOne({
                notificationId: notification.id,
                vendorId: vendorId,
                vendorPhone: vendorPhone,
                message: whatsappMessage,
                whatsappSent,
                whatsappError: whatsappData.error || null,
                revenue: currentRevenue,
                threshold: MINIMUM_REVENUE_THRESHOLD,
                createdAt: new Date(),
              });
            } catch (whatsappErr: any) {
              console.error("WhatsApp send error:", whatsappErr);
              await db.collection("notification_logs").insertOne({
                notificationId: notification.id,
                vendorId: vendorId,
                vendorPhone: vendorPhone,
                message: notification.message,
                whatsappSent: false,
                whatsappError: whatsappErr.message,
                revenue: currentRevenue,
                threshold: MINIMUM_REVENUE_THRESHOLD,
                createdAt: new Date(),
              });
            }
          }

          notificationsSent.push({
            vendorId,
            vendorName: vendor.name || vendor.email || "Unknown",
            revenue: currentRevenue,
            phoneNumber: vendorPhone,
            whatsappSent,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      threshold: MINIMUM_REVENUE_THRESHOLD,
      notificationsSent: notificationsSent.length,
      vendors: notificationsSent,
    });
  } catch (error: any) {
    console.error("Check revenue threshold error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
