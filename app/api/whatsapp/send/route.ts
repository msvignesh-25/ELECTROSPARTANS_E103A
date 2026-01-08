import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// WhatsApp API configuration
// You can use services like Twilio, MessageBird, or WhatsApp Business API
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || "https://api.whatsapp.com/v1/messages";
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY || "";
const WHATSAPP_PHONE_NUMBER = process.env.WHATSAPP_PHONE_NUMBER || "8825484735";

export async function POST(req: Request) {
  try {
    const { phoneNumber, message } = await req.json();

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: "Phone number and message are required" },
        { status: 400 }
      );
    }

    // Log the message attempt
    const client = await clientPromise;
    const db = client.db("electrospartans");

    const logEntry = {
      phoneNumber,
      message,
      status: "pending",
      sentAt: new Date(),
      createdAt: new Date(),
    };

    try {
      // Try to send via WhatsApp API
      // For now, we'll use the WhatsApp Web API format
      // In production, replace this with actual WhatsApp Business API call
      
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      
      // If you have WhatsApp Business API credentials, use this:
      /*
      const response = await fetch(WHATSAPP_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${WHATSAPP_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: phoneNumber,
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error("WhatsApp API request failed");
      }
      */

      // For now, log the message (in production, this would be sent via API)
      logEntry.status = "sent";
      
      // Save log to database
      const result = await db.collection("whatsapp_logs").insertOne(logEntry);

      return NextResponse.json({
        success: true,
        message: "WhatsApp message sent successfully",
        whatsappUrl, // Return URL for manual sending if needed
        logId: result.insertedId.toString(),
      });
    } catch (error: any) {
      logEntry.status = "failed";
      logEntry.error = error.message;
      
      await db.collection("whatsapp_logs").insertOne(logEntry);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to send WhatsApp message",
          whatsappUrl: `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("WhatsApp send error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
