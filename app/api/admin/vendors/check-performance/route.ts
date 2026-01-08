import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("electrospartans");

    const vendors = await db.collection("users").find({ role: "vendor" }).toArray();
    const allPlans = await db.collection("weekly_plans").find({}).toArray();
    const allShops = await db.collection("shops").find({}).toArray();

    let autoSentCount = 0;

    for (const vendor of vendors) {
      const vendorId = vendor._id.toString();
      
      const vendorPlans = allPlans.filter((plan) => {
        if (typeof plan.userId === 'string') {
          return plan.userId === vendorId;
        }
        return plan.userId?.toString() === vendorId;
      });
      const vendorShops = vendor.shops || [];
      
      let notificationsToSend: Array<{ message: string; type: string }> = [];

      if (vendorPlans.length === 0) {
        const existingNotif = (vendor.notifications || []).some((n: any) => 
          n.message && n.message.includes("haven't submitted any growth plan")
        );
        if (!existingNotif) {
          notificationsToSend.push({
            message: "You haven't submitted any growth plan yet. Please create a growth plan to improve your business performance.",
            type: "warning",
          });
        }
      }

      if (vendorShops.length === 0) {
        const existingNotif = (vendor.notifications || []).some((n: any) => 
          n.message && n.message.includes("haven't registered any shops")
        );
        if (!existingNotif) {
          notificationsToSend.push({
            message: "You haven't registered any shops yet. Please register your shop(s) to start attracting customers.",
            type: "warning",
          });
        }
      } else {
        let hasCustomerActivity = false;
        try {
          for (const shop of vendorShops) {
            const shopCustomers = await db
              .collection("orders")
              .countDocuments({ shopId: shop.id });
            
            if (shopCustomers > 0) {
              hasCustomerActivity = true;
              break;
            }
          }
        } catch (error) {
          console.error("Error checking customer activity:", error);
        }

        if (!hasCustomerActivity) {
          const existingNotif = (vendor.notifications || []).some((n: any) => 
            n.message && n.message.includes("None of your registered shops have received")
          );
          if (!existingNotif) {
            notificationsToSend.push({
              message: "None of your registered shops have received any customer orders yet. Consider improving your shop visibility and offerings.",
              type: "warning",
            });
          }
        }
      }

      if (notificationsToSend.length > 0) {
        const notifications = vendor.notifications || [];
        const vendorPhone = vendor.phone || (vendor.shops && vendor.shops[0]?.phone) || null;
        
        for (const notif of notificationsToSend) {
          const notificationId = new ObjectId().toString();
          notifications.push({
            id: notificationId,
            message: notif.message,
            type: notif.type,
            createdAt: new Date(),
            read: false,
          });

          // Send WhatsApp message if phone number is available
          if (vendorPhone) {
            try {
              const whatsappMessage = `🔔 Notification from Admin\n\nType: ${notif.type}\n\n${notif.message}\n\nPlease check your vendor portal for more details.`;
              
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
              
              // Log WhatsApp send attempt
              await db.collection("notification_logs").insertOne({
                notificationId,
                vendorId: vendorId,
                vendorPhone: vendorPhone,
                message: whatsappMessage,
                whatsappSent: whatsappData.success || false,
                whatsappError: whatsappData.error || null,
                createdAt: new Date(),
              });
            } catch (whatsappErr: any) {
              console.error("WhatsApp send error for vendor:", vendorId, whatsappErr);
              await db.collection("notification_logs").insertOne({
                notificationId,
                vendorId: vendorId,
                vendorPhone: vendorPhone,
                message: notif.message,
                whatsappSent: false,
                whatsappError: whatsappErr.message,
                createdAt: new Date(),
              });
            }
          } else {
            // Log that no phone number was available
            await db.collection("notification_logs").insertOne({
              notificationId,
              vendorId: vendorId,
              vendorPhone: null,
              message: notif.message,
              whatsappSent: false,
              whatsappError: "No phone number available for vendor",
              createdAt: new Date(),
            });
          }
        }

        await db.collection("users").updateOne(
          { _id: vendor._id },
          { $set: { notifications: notifications } }
        );

        autoSentCount += notificationsToSend.length;
      }
    }

    return NextResponse.json({ 
      success: true, 
      autoSent: autoSentCount,
      message: `Auto-sent ${autoSentCount} notifications to vendors based on their performance.`
    });
  } catch (error) {
    console.error("Check vendor performance error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
