import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("electrospartans");

    // Fetch all orders
    const orders = await db.collection("orders").find({}).toArray();

    // Transform orders to match the expected format
    const transformedOrders = orders.map((order: any) => ({
      id: order._id.toString(),
      orderId: order.orderId,
      userId: order.userId?.toString(),
      items: order.items || [],
      productId: order.items?.[0]?.productId,
      productName: order.items?.[0]?.name || order.items?.[0]?.productName,
      price: order.items?.[0]?.price || 0,
      quantity: order.items?.[0]?.quantity || 1,
      date: order.createdAt || new Date(),
      customerId: order.userId?.toString(),
      customerName: order.userName,
    }));

    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
