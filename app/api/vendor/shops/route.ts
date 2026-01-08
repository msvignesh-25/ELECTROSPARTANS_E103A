import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const client = await clientPromise;
    const db = client.db("electrospartans");

    if (userId) {
      const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
      if (user && user.shops) {
        return NextResponse.json({ shops: user.shops });
      }
      return NextResponse.json({ shops: [] });
    }

    const vendors = await db.collection("users").find({ role: "vendor" }).toArray();
    const allShops: any[] = [];
    
    vendors.forEach((vendor, vendorIndex) => {
      if (vendor.shops && Array.isArray(vendor.shops)) {
        vendor.shops.forEach((shop: any, shopIndex: number) => {
          // Less strict validation - include shop if it has name OR businessType
          if (shop && (shop.name || shop.businessType || shop.id)) {
            const shopId = shop.id || shop._id?.toString() || new ObjectId().toString();
            allShops.push({
              id: shopId,
              name: shop.name || shop.businessType || `Shop ${vendorIndex}-${shopIndex}`,
              businessType: shop.businessType || "other",
              address: shop.address || "",
              phone: shop.phone || "",
              vendorId: vendor._id.toString(),
              vendorName: vendor.name || vendor.email || "Unknown Vendor",
            });
          }
        });
      }
    });

    return NextResponse.json({ shops: allShops });
  } catch (error) {
    console.error("Shops fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId, shop } = await req.json();

    if (!userId || !shop) {
      return NextResponse.json(
        { error: "User ID and shop details are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("electrospartans");

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

    if (!user || user.role !== "vendor") {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    }

    const shops = user.shops || [];
    shops.push({
      ...shop,
      id: new ObjectId().toString(),
      createdAt: new Date(),
    });

    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { shops: shops } }
    );

    return NextResponse.json({ success: true, shops });
  } catch (error) {
    console.error("Shop add error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
