"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MonthlyRevenueGraph from "@/components/MonthlyRevenueGraph";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  stock?: number;
  rating: number;
  reviews: number;
  features: string[];
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

interface Shop {
  id: string;
  name: string;
  businessType: string;
  address?: string;
  phone?: string;
  vendorId: string;
  vendorName: string;
}

export default function CustomerPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [query, setQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const checkUserAndLoad = async () => {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        router.push("/login?role=customer");
        return;
      }

      const userData = JSON.parse(userStr);
      if (userData.role !== "customer") {
        router.push("/login?role=customer");
        return;
      }

      setUser(userData);
      await loadShops();
      await loadProducts();
      if (userData.id) {
        await loadCart(userData.id);
      }
    };

    checkUserAndLoad();
  }, [router]);

  useEffect(() => {
    if (user?.id) {
      loadCart(user.id);
    } else {
      setCart([]);
    }
  }, [user?.id]);

  const loadShops = async () => {
    try {
      const res = await fetch("/api/vendor/shops");
      const data = await res.json();
      console.log("Shops API response:", data);
      
      if (data.shops && Array.isArray(data.shops)) {
        // Ensure all shops have required fields - less strict validation
        const validShops = data.shops
          .filter((shop: any) => shop && (shop.name || shop.businessType))
          .map((shop: any, index: number) => {
            // Generate ID if missing - use a unique identifier
            const shopId = shop.id || shop._id?.toString() || `shop-${shop.vendorId || 'unknown'}-${index}-${Date.now()}`;
            return {
              id: shopId,
              name: shop.name || `Shop ${index + 1}`,
              businessType: shop.businessType || "other",
              address: shop.address || "",
              phone: shop.phone || "",
              vendorId: shop.vendorId || "",
              vendorName: shop.vendorName || "Unknown Vendor",
            };
          })
          .filter((shop: Shop) => shop.id && shop.id !== ""); // Final filter to ensure ID exists
        
        console.log("Valid shops loaded:", validShops);
        setShops(validShops);
      } else {
        console.warn("No shops found or invalid response:", data);
        setShops([]);
      }
    } catch (error) {
      console.error("Error loading shops:", error);
      setShops([]);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setAllProducts(data);
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const filterProductsByShop = (shop: Shop | null) => {
    if (!shop) {
      setProducts(allProducts);
      return;
    }

    const shopType = shop.businessType.toLowerCase();
    let filtered: Product[] = [];

    // Tech-related product identifiers to exclude for non-electrical shops
    const techKeywords = ["repair", "phone", "mobile", "laptop", "screen", "diagnostic", "tech", "electronic"];

    if (shopType.includes("coffee") || shopType.includes("bakery") || shopType.includes("cafe")) {
      filtered = allProducts.filter((p) => {
        const productName = p.name.toLowerCase();
        const isTechService = techKeywords.some(keyword => productName.includes(keyword)) || 
                              (p.category === "Services" && techKeywords.some(keyword => productName.includes(keyword)));
        
        // Only include non-tech products
        if (isTechService) return false;
        
        return (
          p.category === "Beverages" ||
          p.category === "Bakery" ||
          productName.includes("coffee") ||
          productName.includes("bakery") ||
          productName.includes("croissant") ||
          productName.includes("bread") ||
          productName.includes("tea") ||
          productName.includes("pastry") ||
          productName.includes("cake") ||
          productName.includes("cookie")
        );
      });
    } else if (shopType.includes("repair") || shopType.includes("mobile") || shopType.includes("laptop") || shopType.includes("tech") || shopType.includes("electronic")) {
      filtered = allProducts.filter((p) => {
        const productName = p.name.toLowerCase();
        return (
          (p.category === "Services" && techKeywords.some(keyword => productName.includes(keyword))) ||
          productName.includes("repair") ||
          productName.includes("phone") ||
          productName.includes("mobile") ||
          productName.includes("laptop") ||
          productName.includes("screen") ||
          productName.includes("diagnostic")
        );
      });
    } else if (shopType.includes("cool") || shopType.includes("drink") || shopType.includes("beverage")) {
      filtered = allProducts.filter((p) => {
        const productName = p.name.toLowerCase();
        const isTechService = techKeywords.some(keyword => productName.includes(keyword)) || 
                              (p.category === "Services" && techKeywords.some(keyword => productName.includes(keyword)));
        
        // Only include non-tech products
        if (isTechService) return false;
        
        return (
          p.category === "Beverages" ||
          productName.includes("drink") ||
          productName.includes("cool") ||
          productName.includes("juice") ||
          productName.includes("soda")
        );
      });
    } else {
      filtered = allProducts;
    }

    setProducts(filtered);
  };

  useEffect(() => {
    filterProductsByShop(selectedShop);
  }, [selectedShop, allProducts]);

  const loadCart = async (userId: string) => {
    try {
      const res = await fetch(`/api/cart?userId=${userId}`);
      const data = await res.json();
      setCart(data.cart || []);
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  };

  const saveCart = async (userId: string, cartData: CartItem[]) => {
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, cart: cartData }),
      });
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!user) return;

    const currentStock = product.stock || 0;
    if (currentStock <= 0) {
      alert("Product is out of stock");
      return;
    }

    const existingItem = cart.find((item) => item.productId === product.id);
    const currentCartQuantity = existingItem ? existingItem.quantity : 0;

    if (currentCartQuantity >= currentStock) {
      alert(`Only ${currentStock} items available. You already have ${currentCartQuantity} in cart.`);
      return;
    }

    let updatedCart: CartItem[];
    if (existingItem) {
      updatedCart = cart.map((item) =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
        },
      ];
    }

    try {
      const stockRes = await fetch("/api/products/update-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      
      if (!stockRes.ok) {
        throw new Error("Failed to update stock");
      }

      const updatedProducts = products.map((p) =>
        p.id === product.id ? { ...p, stock: (p.stock || 0) - 1 } : p
      );
      setProducts(updatedProducts);

      setCart(updatedCart);
      await saveCart(user.id, updatedCart);
      alert(`${product.name} added to cart`);
    } catch (error) {
      console.error("Error updating stock:", error);
      alert("Failed to add to cart. Please try again.");
    }
  };

  const handleRemoveFromCart = async (productId: string, quantity: number) => {
    if (!user) return;

    const updatedCart = cart.filter((item) => item.productId !== productId);
    
    try {
      const stockRes = await fetch("/api/products/update-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: -quantity }),
      });

      if (!stockRes.ok) {
        throw new Error("Failed to update stock");
      }

      const updatedProducts = products.map((p) =>
        p.id === productId ? { ...p, stock: (p.stock || 0) + quantity } : p
      );
      setProducts(updatedProducts);

      setCart(updatedCart);
      await saveCart(user.id, updatedCart);
    } catch (error) {
      console.error("Error removing from cart:", error);
      alert("Failed to remove from cart. Please try again.");
    }
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];
  
  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const handleAIQuery = () => {
    if (!query.trim() || products.length === 0) return;

    setIsLoading(true);
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      let response = "";

      if (
        lowerQuery.includes("price") ||
        lowerQuery.includes("cost") ||
        lowerQuery.includes("expensive")
      ) {
        const avgPrice =
          products.reduce((sum, p) => sum + p.price, 0) / products.length;
        response = `Pricing Information:\n\n`;
        response += `• Average Product Price: ₹${avgPrice.toLocaleString(
          "en-IN"
        )}\n`;
        response += `• Price Range: ₹${Math.min(
          ...products.map((p) => p.price)
        ).toLocaleString("en-IN")} - ₹${Math.max(
          ...products.map((p) => p.price)
        ).toLocaleString("en-IN")}\n\n`;
        response += `Our products are competitively priced with excellent value. All prices include quality assurance and customer support.`;
      } else if (
        lowerQuery.includes("quality") ||
        lowerQuery.includes("good") ||
        lowerQuery.includes("best")
      ) {
        const sortedByRating = [...products].sort((a, b) => {
          if (b.rating !== a.rating) return b.rating - a.rating;
          return b.reviews - a.reviews;
        });

        const bestProduct = sortedByRating[0];
        const avgRating =
          products.reduce((sum, p) => sum + p.rating, 0) / products.length;
        const totalReviews = products.reduce(
          (sum, p) => sum + p.reviews,
          0
        );

        response = `Best Product Recommendation:\n\n`;
        response += `• Best Rated: ${bestProduct.name}\n`;
        response += `• Rating: ${bestProduct.rating}⭐ (${bestProduct.reviews} reviews)\n`;
        response += `• Price: ₹${bestProduct.price.toLocaleString("en-IN")}\n\n`;
        response += `This product has the highest rating (${bestProduct.rating}⭐) with ${bestProduct.reviews} customer reviews, making it our top recommendation.\n\n`;
        response += `Overall Quality: ${avgRating.toFixed(
          1
        )}/5.0 ⭐ average from ${totalReviews} total customer reviews.`;
      } else if (
        lowerQuery.includes("available") ||
        lowerQuery.includes("stock") ||
        lowerQuery.includes("in stock")
      ) {
        const productName = lowerQuery
          .replace("available", "")
          .replace("stock", "")
          .replace("in stock", "")
          .trim();

        if (productName) {
          const foundProduct = products.find((p) =>
            p.name.toLowerCase().includes(productName)
          );
          if (foundProduct) {
            response = `Stock Information:\n\n`;
            response += `• Product: ${foundProduct.name}\n`;
            response += `• Stock Available: ${foundProduct.stock || 0} units\n`;
            response += `• Status: ${
              (foundProduct.stock || 0) > 0 ? "In Stock" : "Out of Stock"
            }\n`;
            response += `• Price: ₹${foundProduct.price.toLocaleString(
              "en-IN"
            )}\n`;
          } else {
            response = `Product not found. Please check the product name.`;
          }
        } else {
          const inStockCount = products.filter((p) => (p.stock || 0) > 0)
            .length;
          response = `Availability:\n\n`;
          response += `• ${inStockCount} out of ${products.length} products currently in stock\n\n`;
          products.forEach((p) => {
            if ((p.stock || 0) > 0) {
              response += `• ${p.name}: ${p.stock} available\n`;
            }
          });
        }
      } else if (
        lowerQuery.includes("recommend") ||
        lowerQuery.includes("suggest") ||
        lowerQuery.includes("popular")
      ) {
        const sortedByRating = [...products]
          .filter((p) => p.reviews > 0)
          .sort((a, b) => {
            const scoreA = a.rating * Math.log(a.reviews + 1);
            const scoreB = b.rating * Math.log(b.reviews + 1);
            return scoreB - scoreA;
          });

        const topProduct = sortedByRating[0];
        const mostReviewed = [...products].sort(
          (a, b) => b.reviews - a.reviews
        )[0];

        response = `Recommendations:\n\n`;
        response += `• Best Overall: ${topProduct.name}\n`;
        response += `  Rating: ${topProduct.rating}⭐ (${topProduct.reviews} reviews)\n`;
        response += `  Price: ₹${topProduct.price.toLocaleString("en-IN")}\n\n`;
        response += `• Most Popular: ${mostReviewed.name}\n`;
        response += `  ${mostReviewed.reviews} reviews, ₹${mostReviewed.price.toLocaleString(
          "en-IN"
        )}\n\n`;
        response += `Based on ratings and number of reviews, ${topProduct.name} is our top recommendation.`;
      } else if (
        lowerQuery.includes("delivery") ||
        lowerQuery.includes("shipping") ||
        lowerQuery.includes("time")
      ) {
        response = `Delivery Information:\n\n`;
        response += `• Standard Delivery: 3-5 business days\n`;
        response += `• Express Delivery: 1-2 business days (available)\n`;
        response += `• Same-Day Service: Available for local orders\n`;
        response += `• Free Shipping: On orders over ₹5000\n\n`;
        response += `We offer flexible delivery options to meet your needs. Contact us for specific delivery times in your area.`;
      } else {
        response = `I can help you with:\n\n`;
        response += `• Product pricing and costs\n`;
        response += `• Quality and ratings information\n`;
        response += `• Stock availability (e.g., "how many croissants available?")\n`;
        response += `• Product recommendations based on ratings\n`;
        response += `• Delivery and shipping options\n\n`;
        response += `Please ask a specific question about our products or services!`;
      }

      setAiResponse(response);
      setIsLoading(false);
    }, 1000);
  };

  const [showCart, setShowCart] = useState(false);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!user) {
    return null;
  }

  if (loadingProducts) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Customer Portal
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome, {user.name}! Browse products and get AI-powered assistance
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => {
                localStorage.removeItem("user");
                router.push("/login?role=customer");
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Logout
            </button>
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              🛒 Cart
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md h-full overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Shopping Cart
                </h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              {cart.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">
                  Your cart is empty
                </p>
              ) : (
                <>
                  <div className="space-y-4 mb-4">
                    {cart.map((item) => (
                      <div
                        key={item.productId}
                        className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-gray-900 dark:text-white">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <button
                            onClick={() => handleRemoveFromCart(item.productId, item.quantity)}
                            className="text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded"
                            title="Remove from cart"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        Total:
                      </span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>
                    <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                      Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Select Shop
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Choose a shop to browse products specific to that shop's theme
            {shops.length === 0 && (
              <span className="block mt-2 text-orange-600 dark:text-orange-400">
                No shops available. Please ask vendors to register their shops.
              </span>
            )}
          </p>
          <select
            value={selectedShop?.id || ""}
            onChange={(e) => {
              const selectedId = e.target.value;
              if (selectedId === "") {
                setSelectedShop(null);
              } else {
                const shop = shops.find((s) => s.id === selectedId);
                if (shop) {
                  setSelectedShop(shop);
                  setSelectedCategory("all");
                } else {
                  console.error("Shop not found with id:", selectedId);
                }
              }
            }}
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={shops.length === 0}
          >
            <option value="">All Products (No shop selected)</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name} - {shop.businessType} ({shop.vendorName})
              </option>
            ))}
          </select>
          {selectedShop && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                <span className="font-semibold">Selected Shop:</span> {selectedShop.name} 
                <br />
                <span className="text-xs">Type: {selectedShop.businessType}</span>
                {selectedShop.address && (
                  <>
                    <br />
                    <span className="text-xs">📍 {selectedShop.address}</span>
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Monthly Revenue Graph */}
        <div className="mb-6">
          <MonthlyRevenueGraph months={12} minimumThreshold={50000} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Categories
              </h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="text-6xl mb-4 text-center">{product.image}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {product.description}
                  </p>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatPrice(product.price)}
                      </span>
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">⭐</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {product.rating} ({product.reviews})
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        (product.stock || 0) > 0
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {(product.stock || 0) > 0
                        ? `In Stock (${product.stock} available)`
                        : "Out of Stock"}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Features:
                    </p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      {product.features.map((feature, idx) => (
                        <li key={idx}>✓ {feature}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={(product.stock || 0) <= 0}
                  >
                    {(product.stock || 0) > 0 ? "Add to Cart" : "Out of Stock"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🤖 AI Assistant
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Ask questions about products, pricing, quality, or availability.
              </p>

              <div className="space-y-4">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., What are the prices? Which product is best? How many croissants available?"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-sm"
                  rows={4}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) {
                      handleAIQuery();
                    }
                  }}
                />

                <button
                  onClick={handleAIQuery}
                  disabled={!query.trim() || isLoading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isLoading ? "Searching..." : "Ask AI"}
                </button>

                {aiResponse && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 text-sm">
                      AI Response:
                    </h3>
                    <pre className="text-xs text-blue-800 dark:text-blue-200 whitespace-pre-wrap font-sans">
                      {aiResponse}
                    </pre>
                  </div>
                )}

                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Example Questions:
                  </p>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Which product is best?</li>
                    <li>• How many croissants available?</li>
                    <li>• What are the prices?</li>
                    <li>• What about delivery?</li>
                    <li>• Product quality?</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
