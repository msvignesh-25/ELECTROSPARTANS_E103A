import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("electrospartans");

    let products = await db.collection("products").find({}).toArray();

    if (products.length === 0) {
      const defaultProducts = [
        {
          name: 'Premium Coffee Blend',
          description: 'Artisan roasted coffee beans sourced from premium farms. Rich, smooth flavor with notes of chocolate and caramel.',
          price: 2499,
          category: 'Beverages',
          image: '☕',
          stock: 50,
          rating: 4.8,
          reviews: 156,
          features: ['100% Arabica', 'Fair Trade', 'Fresh Roasted', '1lb Bag'],
          createdAt: new Date(),
        },
        {
          name: 'Fresh Baked Croissants',
          description: 'Buttery, flaky croissants baked fresh daily. Available in plain, chocolate, and almond varieties.',
          price: 350,
          category: 'Bakery',
          image: '🥐',
          stock: 30,
          rating: 4.9,
          reviews: 203,
          features: ['Fresh Daily', 'Butter Rich', 'Multiple Varieties', 'Vegan Option'],
          createdAt: new Date(),
        },
        {
          name: 'Phone Screen Repair',
          description: 'Professional screen replacement service for all major smartphone brands. Same-day service available.',
          price: 8999,
          category: 'Services',
          image: '📱',
          stock: 10,
          rating: 4.7,
          reviews: 342,
          features: ['Same-Day Service', 'Warranty Included', 'All Brands', 'Professional Grade'],
          createdAt: new Date(),
        },
        {
          name: 'Laptop Diagnostic Service',
          description: 'Comprehensive laptop diagnostic and repair service. We identify and fix hardware and software issues.',
          price: 4999,
          category: 'Services',
          image: '💻',
          stock: 15,
          rating: 4.6,
          reviews: 128,
          features: ['Full Diagnostic', 'Hardware Repair', 'Software Fix', 'Data Recovery'],
          createdAt: new Date(),
        },
        {
          name: 'Artisan Sourdough Bread',
          description: 'Traditional sourdough bread made with natural fermentation. Crusty exterior, soft interior.',
          price: 699,
          category: 'Bakery',
          image: '🍞',
          stock: 25,
          rating: 4.9,
          reviews: 187,
          features: ['Natural Fermentation', 'No Preservatives', 'Large Loaf', 'Freezes Well'],
          createdAt: new Date(),
        },
        {
          name: 'Specialty Tea Collection',
          description: 'Curated selection of premium teas from around the world. Includes green, black, herbal, and oolong varieties.',
          price: 1899,
          category: 'Beverages',
          image: '🫖',
          stock: 40,
          rating: 4.7,
          reviews: 94,
          features: ['20 Tea Bags', 'Premium Quality', 'Multiple Varieties', 'Gift Ready'],
          createdAt: new Date(),
        },
      ];

      await db.collection("products").insertMany(defaultProducts);
      products = await db.collection("products").find({}).toArray();
    }

    return NextResponse.json(products.map(p => ({
      id: p._id.toString(),
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      image: p.image,
      stock: p.stock || 0,
      rating: p.rating || 0,
      reviews: p.reviews || 0,
      features: p.features || [],
      inStock: (p.stock || 0) > 0,
    })));
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const product = await req.json();
    const client = await clientPromise;
    const db = client.db("electrospartans");

    const result = await db.collection("products").insertOne({
      ...product,
      createdAt: new Date(),
      stock: product.stock || 0,
      rating: product.rating || 0,
      reviews: product.reviews || 0,
    });

    return NextResponse.json({
      success: true,
      productId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
