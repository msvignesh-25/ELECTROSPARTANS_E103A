import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { sendSaleNotification } from "@/services/whatsappService";

export async function POST(req: Request) {
  try {
    const { userId, cart, orderId } = await req.json();

    if (!userId || !cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { error: "User ID and cart items are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("electrospartans");

    // Get user information including phone number
    const user = await db.collection("users").findOne({ 
      _id: new ObjectId(userId)
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Calculate total
    const total = cart.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    // Create order
    const order = {
      orderId: orderId || `ORD-${Date.now()}`,
      userId: user._id,
      userEmail: user.email,
      userName: user.name,
      items: cart.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: total,
      status: "confirmed",
      createdAt: new Date(),
    };

    // Save order to database
    await db.collection("orders").insertOne(order);

    // Clear user's cart
    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { cart: [] } }
    );

    // Update product stock
    for (const item of cart) {
      await db.collection("products").updateOne(
        { id: item.productId },
        { $inc: { stock: -item.quantity } }
      );
    }

    // Send WhatsApp notification if customer has phone number
    if (user.phoneNumber) {
      try {
        const orderDetails = {
          orderId: order.orderId,
          items: order.items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price * item.quantity,
          })),
          total: total,
          date: new Date().toLocaleString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        // Send WhatsApp notification
        // Note: The sendSaleNotification function will create a WhatsApp Web URL
        // In production, you might want to use WhatsApp Business API or a queue system
        await sendSaleNotification(user.phoneNumber, orderDetails);
        
        // Log the notification (in production, you might want to store this in a queue)
        console.log(`WhatsApp notification prepared for order ${order.orderId} to ${user.phoneNumber}`);
      } catch (whatsappError) {
        console.error("Error sending WhatsApp notification:", whatsappError);
        // Don't fail the order if WhatsApp fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      order: {
        orderId: order.orderId,
        total: total,
        items: order.items,
      },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
