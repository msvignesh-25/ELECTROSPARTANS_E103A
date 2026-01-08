"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadOrders, saveOrder } from "@/services/metricsService";

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
  const [showCart, setShowCart] = useState(false);
  
  // Personal Preference Quiz states
  const [quizAnswers, setQuizAnswers] = useState({
    taste: "",
    energy: "",
    occasion: "",
    mood: "",
    preference: "",
  });
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    category: string;
    explanation: string;
  } | null>(null);
  const [personalizedItem, setPersonalizedItem] = useState<{
    name: string;
    attributes: string[];
    reason: string;
  } | null>(null);
  const [aiActionLog, setAiActionLog] = useState<string[]>([]);
  
  // WhatsApp Community states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [communityMembers, setCommunityMembers] = useState<string[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [joinNotification, setJoinNotification] = useState<string | null>(null);

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
      loadCommunityMembers();
      checkIfUserJoined(userData);
    };

    checkUserAndLoad();
  }, [router]);

  // Load community members from localStorage
  const loadCommunityMembers = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('whatsappCommunityMembers');
      if (saved) {
        try {
          setCommunityMembers(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading community members:', error);
        }
      }
      
      // Check if user is admin
      const adminPhone = localStorage.getItem('whatsappCommunityAdmin');
      if (adminPhone) {
        // Admin should not be in members list
        const members = saved ? JSON.parse(saved) : [];
        if (members.includes(adminPhone)) {
          const filtered = members.filter((m: string) => m !== adminPhone);
          setCommunityMembers(filtered);
          localStorage.setItem('whatsappCommunityMembers', JSON.stringify(filtered));
        }
      }
    }
  };

  // Check if current user has already joined
  const checkIfUserJoined = (userData: User) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('whatsappCommunityMembers');
      if (saved) {
        try {
          const members = JSON.parse(saved);
          // Check if user's phone number (if stored) is in the list
          const userPhone = localStorage.getItem('customerPhoneNumber');
          if (userPhone && members.includes(userPhone)) {
            setIsJoined(true);
          }
        } catch (error) {
          // Ignore errors
        }
      }
    }
  };

  // Validate phone number format
  const validatePhoneNumber = (phone: string): boolean => {
    // Remove spaces, dashes, and parentheses
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    // Check if it's a valid format (10-15 digits, optionally starting with +)
    const phoneRegex = /^(\+?\d{10,15})$/;
    return phoneRegex.test(cleaned);
  };

  // Handle customer login/join community
  const handleJoinCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneNumberError("");

    if (!phoneNumber.trim()) {
      setPhoneNumberError("Please enter your phone number");
      return;
    }

    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneNumberError("Please enter a valid phone number (10-15 digits, optionally with country code)");
      return;
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');

    // Check if this is the admin phone number
    const adminPhone = typeof window !== 'undefined' ? localStorage.getItem('whatsappCommunityAdmin') : null;
    if (adminPhone === cleanedPhone) {
      setPhoneNumberError("This phone number is registered as the admin. Please use a different number.");
      return;
    }

    // Check if phone number already exists in members
    if (communityMembers.includes(cleanedPhone)) {
      setPhoneNumberError("This phone number is already in the community");
      
      // Log duplicate attempt
      const logEntry = {
        message: `Attempt to add duplicate number prevented: ${cleanedPhone}`,
        timestamp: new Date().toLocaleString(),
      };
      const savedLog = typeof window !== 'undefined' ? localStorage.getItem('whatsappCommunityActivityLog') : null;
      if (savedLog) {
        try {
          const log = JSON.parse(savedLog);
          log.push(logEntry);
          localStorage.setItem('whatsappCommunityActivityLog', JSON.stringify(log));
        } catch (error) {
          // Ignore errors
        }
      }
      
      return;
    }

    // Add to community members
    const updatedMembers = [...communityMembers, cleanedPhone];
    setCommunityMembers(updatedMembers);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('whatsappCommunityMembers', JSON.stringify(updatedMembers));
      localStorage.setItem('customerPhoneNumber', cleanedPhone);
    }

    // Set joined status
    setIsJoined(true);

    // Show confirmation message
    setJoinNotification(cleanedPhone);

    // Add to AI Action Log
    const logEntry = `New customer added to WhatsApp community: ${cleanedPhone}`;
    setAiActionLog(prev => [...prev, logEntry]);

    // Clear phone number input
    setPhoneNumber("");

    // Clear notification after 5 seconds
    setTimeout(() => {
      setJoinNotification(null);
    }, 5000);
  };

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

  const handleCheckout = async () => {
    if (!user || cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    if (!confirm("Are you sure you want to proceed with checkout?")) {
      return;
    }

    try {
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          cart: cart,
          orderId: orderId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Checkout failed. Please try again.");
        return;
      }

      if (data.success) {
        // Save order to localStorage for AI assistant
        cart.forEach((item) => {
          const orderData = {
            id: `${data.order.orderId}-${item.productId}`,
            orderId: data.order.orderId,
            productId: item.productId,
            productName: item.name,
            price: item.price,
            quantity: item.quantity,
            date: new Date(),
            customerId: user.id,
            customerName: user.name,
            reviewSubmitted: false,
          };
          saveOrder(orderData);
        });

        // Clear cart
        setCart([]);
        await saveCart(user.id, []);
        
        // Reload products to reflect updated stock
        await loadProducts();
        
        // Close cart sidebar
        setShowCart(false);
        
        alert(`Order placed successfully! Order ID: ${data.order.orderId}\n\nA WhatsApp confirmation will be sent to your registered phone number.`);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred during checkout. Please try again.");
    }
  };

  // AI Analysis Logic - Client-side simulation
  const analyzeCustomerPreferences = () => {
    const { taste, energy, occasion, mood, preference } = quizAnswers;
    
    // Scoring system for classification
    let calmScore = 0;
    let energeticScore = 0;
    let balancedScore = 0;
    let adventurousScore = 0;
    
    // Analyze taste preference
    if (taste === "sweet") calmScore += 2;
    else if (taste === "spicy") energeticScore += 2;
    else if (taste === "neutral") balancedScore += 2;
    
    // Analyze energy level
    if (energy === "calm") calmScore += 3;
    else if (energy === "energetic") energeticScore += 3;
    else if (energy === "balanced") balancedScore += 3;
    
    // Analyze occasion
    if (occasion === "comfort") calmScore += 2;
    else if (occasion === "celebration") energeticScore += 2;
    else if (occasion === "casual") balancedScore += 2;
    
    // Analyze mood
    if (mood === "relaxed") calmScore += 2;
    else if (mood === "happy") energeticScore += 2;
    else if (mood === "stressed") calmScore += 1;
    else if (mood === "adventurous") adventurousScore += 3;
    
    // Analyze preference
    if (preference === "classic") {
      calmScore += 2;
      balancedScore += 1;
    } else if (preference === "experimental") {
      adventurousScore += 3;
      energeticScore += 1;
    }
    
    // Determine category based on highest score
    const scores = {
      calm: calmScore,
      energetic: energeticScore,
      balanced: balancedScore,
      adventurous: adventurousScore,
    };
    
    const maxScore = Math.max(...Object.values(scores));
    let category = "";
    let explanation = "";
    
    if (scores.calm === maxScore) {
      category = "Calm & Comfort-Oriented";
      explanation = `Your preferences for ${taste} flavors, ${energy} energy levels, and ${occasion} occasions indicate you value comfort and relaxation. Your ${mood} mood and ${preference} choices suggest you prefer familiar, soothing experiences.`;
    } else if (scores.energetic === maxScore) {
      category = "Energetic & Experimental";
      explanation = `Your choices for ${taste} taste, ${energy} energy, and ${occasion} occasions show you enjoy vibrant, dynamic experiences. Your ${mood} mood and ${preference} preference indicate you're open to bold, exciting options.`;
    } else if (scores.adventurous === maxScore) {
      category = "Adventurous & Curious";
      explanation = `Your ${mood} mood and ${preference} preference, combined with ${taste} taste and ${energy} energy choices, reveal a curious spirit. You enjoy exploring new combinations and unique experiences.`;
    } else {
      category = "Balanced & Practical";
      explanation = `Your well-rounded preferences for ${taste} flavors, ${energy} energy, and ${occasion} occasions show a balanced approach. Your ${mood} mood and ${preference} choices indicate you value both reliability and subtle variety.`;
    }
    
    return { category, explanation };
  };

  // Generate personalized item based on analysis
  const generatePersonalizedItem = (category: string) => {
    const { taste, energy, occasion, mood, preference } = quizAnswers;
    
    let itemName = "";
    let attributes: string[] = [];
    let reason = "";
    
    if (category === "Calm & Comfort-Oriented") {
      itemName = "Serenity Blend";
      attributes = [
        "Gentle, smooth flavor profile",
        "Warm, comforting temperature",
        "Subtle sweetness",
        "Relaxing aroma",
        "Soft presentation"
      ];
      reason = `This item is customized for you based on your preference for ${taste} flavors and ${energy} energy levels. The calming attributes match your ${mood} mood and ${occasion} occasion preference, providing a comforting experience.`;
    } else if (category === "Energetic & Experimental") {
      itemName = "Vitality Fusion";
      attributes = [
        "Bold, vibrant flavors",
        "Energizing ingredients",
        "Dynamic presentation",
        "Spicy or tangy notes",
        "Eye-catching design"
      ];
      reason = `This item is customized for you based on your ${taste} taste preference and ${energy} energy level. The energetic attributes align with your ${mood} mood and ${occasion} occasion, creating an exciting experience.`;
    } else if (category === "Adventurous & Curious") {
      itemName = "Explorer's Choice";
      attributes = [
        "Unique flavor combinations",
        "Unconventional ingredients",
        "Surprising elements",
        "Artistic presentation",
        "Limited edition style"
      ];
      reason = `This item is customized for you based on your ${preference} preference and ${mood} mood. The adventurous attributes match your curiosity for ${taste} flavors and willingness to try new experiences.`;
    } else {
      itemName = "Harmony Classic";
      attributes = [
        "Well-balanced flavors",
        "Reliable quality",
        "Versatile style",
        "Clean presentation",
        "Timeless appeal"
      ];
      reason = `This item is customized for you based on your balanced preferences for ${taste} flavors and ${energy} energy. The practical attributes suit your ${occasion} occasion and ${mood} mood, offering a dependable yet enjoyable experience.`;
    }
    
    return { name: itemName, attributes, reason };
  };

  const handleQuizSubmit = () => {
    // Validate all answers
    if (!quizAnswers.taste || !quizAnswers.energy || !quizAnswers.occasion || 
        !quizAnswers.mood || !quizAnswers.preference) {
      alert("Please answer all questions before submitting.");
      return;
    }
    
    // Perform AI analysis
    const analysis = analyzeCustomerPreferences();
    setAiAnalysis(analysis);
    
    // Generate personalized item
    const item = generatePersonalizedItem(analysis.category);
    setPersonalizedItem(item);
    
    // Mark quiz as completed
    setQuizCompleted(true);
    
    // Add to AI action log
    const logEntry = `AI analyzed customer preferences and generated personalized item: ${item.name}`;
    setAiActionLog(prev => [...prev, logEntry]);
  };

  const handleQuizAnswerChange = (question: string, value: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [question]: value
    }));
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

  // Intent detection based on keywords
  const detectIntent = (question: string): string => {
    const lowerQuery = question.toLowerCase();
    
    if (
      lowerQuery.includes("cheapest") ||
      lowerQuery.includes("lowest price") ||
      lowerQuery.includes("least cost")
    ) {
      return "CHEAPEST_PRODUCT";
    }
    
    if (
      lowerQuery.includes("best sold") ||
      lowerQuery.includes("most sold") ||
      lowerQuery.includes("popular")
    ) {
      return "BEST_SELLING_PRODUCT";
    }
    
    if (
      lowerQuery.includes("price of") ||
      lowerQuery.includes("cost of")
    ) {
      return "PRODUCT_PRICE_QUERY";
    }
    
    return "UNKNOWN";
  };

  // Algorithm: Find cheapest product
  const findCheapestProduct = (): string => {
    if (!products || products.length === 0) {
      return "No product data available to determine the cheapest item.";
    }

    // Find product with minimum price
    let cheapestProduct = products[0];
    for (let i = 1; i < products.length; i++) {
      if (products[i].price < cheapestProduct.price) {
        cheapestProduct = products[i];
      }
    }

    const response = `Cheapest Product:\n\n` +
      `• Product Name: ${cheapestProduct.name}\n` +
      `• Price: ₹${cheapestProduct.price.toLocaleString("en-IN")}\n\n` +
      `This is the cheapest item based on current prices.`;

    return response;
  };

  // Algorithm: Find best-selling product
  const findBestSellingProduct = (): string => {
    // Load orders from localStorage
    const orders = loadOrders();
    
    if (!orders || orders.length === 0) {
      return "Sales data is not available to determine the best-selling item.";
    }

    // Count sales per product (by productId or productName)
    const productSalesCount: { [key: string]: { count: number; name: string } } = {};
    
    orders.forEach((order: any) => {
      // Handle order structure from localStorage (saved by saveOrder)
      const productId = order.productId;
      const productName = order.productName || "";
      const quantity = order.quantity || 1;
      
      if (productId || productName) {
        const key = productId || productName;
        if (!productSalesCount[key]) {
          productSalesCount[key] = { count: 0, name: productName || "" };
        }
        productSalesCount[key].count += quantity;
        
        // Update name if we have a better one
        if (productName && !productSalesCount[key].name) {
          productSalesCount[key].name = productName;
        }
      }
    });

    // Find product with highest sales count
    let bestSellingKey = "";
    let maxSales = 0;
    let bestProductName = "";

    for (const key in productSalesCount) {
      if (productSalesCount[key].count > maxSales) {
        maxSales = productSalesCount[key].count;
        bestSellingKey = key;
        bestProductName = productSalesCount[key].name;
      }
    }

    if (!bestSellingKey || maxSales === 0) {
      return "Sales data is not available to determine the best-selling item.";
    }

    // Try to get product name from products list
    let productName = bestProductName;
    const product = products.find((p) => p.id === bestSellingKey || p.name === bestSellingKey);
    if (product) {
      productName = product.name;
    } else if (!productName) {
      productName = bestSellingKey;
    }

    const response = `Best-Selling Product:\n\n` +
      `• Product Name: ${productName}\n` +
      `• Number of Orders: ${maxSales}\n\n` +
      `This item is the best sold based on order data.`;

    return response;
  };

  // Handle product price query
  const handleProductPriceQuery = (question: string): string => {
    const lowerQuery = question.toLowerCase();
    
    // Try to extract product name from question
    const productNameMatch = lowerQuery.match(/(?:price of|cost of)\s+(.+)/);
    if (productNameMatch) {
      const searchTerm = productNameMatch[1].trim();
      const foundProduct = products.find((p) =>
        p.name.toLowerCase().includes(searchTerm)
      );
      
      if (foundProduct) {
        return `Product Price:\n\n` +
          `• Product Name: ${foundProduct.name}\n` +
          `• Price: ₹${foundProduct.price.toLocaleString("en-IN")}\n`;
      } else {
        return "I don't have enough data to answer this question accurately. Product not found.";
      }
    }
    
    return "I don't have enough data to answer this question accurately. Please specify the product name.";
  };

  const handleAIQuery = () => {
    if (!query.trim()) {
      setAiResponse("Please enter a question.");
      return;
    }

    if (products.length === 0) {
      setAiResponse("No product data available to answer questions.");
      return;
    }

    setIsLoading(true);
    
    // Simulate processing delay
    setTimeout(() => {
      const intent = detectIntent(query);
      let response = "";

      switch (intent) {
        case "CHEAPEST_PRODUCT":
          response = findCheapestProduct();
          break;
        
        case "BEST_SELLING_PRODUCT":
          response = findBestSellingProduct();
          break;
        
        case "PRODUCT_PRICE_QUERY":
          response = handleProductPriceQuery(query);
          break;
        
        default:
          response = "I don't have enough data to answer this question accurately.";
          break;
      }

      // Add transparency note
      response += "\n\n---\nThis answer is generated by analyzing current product and sales data.";

      setAiResponse(response);
      setIsLoading(false);
    }, 500);
  };

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

        {/* Phone Number Input & WhatsApp Community Section */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Join Customer WhatsApp Community
          </h2>
          
          {!isJoined ? (
            <form onSubmit={handleJoinCommunity} className="space-y-4">
              <div>
                <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter Your Phone Number
                </label>
                <div className="flex gap-2">
                  <input
                    id="phone-number"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      setPhoneNumberError("");
                    }}
                    placeholder="+1234567890 or 1234567890"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                  >
                    Join Community
                  </button>
                </div>
                {phoneNumberError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{phoneNumberError}</p>
                )}
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Format: 10-15 digits, optionally with country code (e.g., +1234567890)
                </p>
              </div>
            </form>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <p className="text-green-800 dark:text-green-300 font-medium">
                ✓ You have been added to the WhatsApp customer community (simulated).
              </p>
            </div>
          )}

          {/* Join Notification */}
          {joinNotification && (
            <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 animate-pulse">
              <p className="text-blue-800 dark:text-blue-300 font-medium">
                New customer added to WhatsApp community: {joinNotification}
              </p>
            </div>
          )}

          {/* WhatsApp Community List */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Customer WhatsApp Community (Simulated)
            </h3>
            {(() => {
              const adminPhone = typeof window !== 'undefined' ? localStorage.getItem('whatsappCommunityAdmin') : null;
              const totalMembers = communityMembers.length + (adminPhone ? 1 : 0);
              
              if (totalMembers === 0) {
                return (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No members yet. Be the first to join!
                  </p>
                );
              }
              
              return (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="space-y-3">
                    {/* Admin at top */}
                    {adminPhone && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border-2 border-purple-300 dark:border-purple-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-purple-500 text-xl">👑</span>
                          <div>
                            <p className="font-semibold text-purple-900 dark:text-purple-300">
                              {adminPhone}
                            </p>
                            <p className="text-xs text-purple-700 dark:text-purple-400">Admin</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 text-xs font-semibold rounded-full">
                          ADMIN
                        </span>
                      </div>
                    )}
                    
                    {/* Customers */}
                    {communityMembers.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {communityMembers.map((phone, index) => (
                          <div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600 flex items-center gap-2"
                          >
                            <span className="text-green-500 text-lg">📱</span>
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-white block">
                                {phone}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">Customer</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
                    Total Members: {totalMembers} ({adminPhone ? '1 Admin' : '0 Admin'} + {communityMembers.length} Customers)
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Privacy & Transparency Note */}
          <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-800 dark:text-yellow-300 italic">
              ℹ️ This WhatsApp community is simulated for demonstration purposes. No real messages are sent.
            </p>
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
                    <button 
                      onClick={handleCheckout}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                      Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Personal Preference Quiz Section */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Personal Preference Quiz
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Help us understand your preferences to create a personalized experience for you.
          </p>

          {!quizCompleted ? (
            <div className="space-y-6">
              {/* Question 1: Taste Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  1. Preferred taste/style
                </label>
                <div className="space-y-2">
                  {["sweet", "spicy", "neutral", "bitter"].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name="taste"
                        value={option}
                        checked={quizAnswers.taste === option}
                        onChange={(e) => handleQuizAnswerChange("taste", e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 2: Energy Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  2. Energy level preference
                </label>
                <div className="space-y-2">
                  {["calm", "balanced", "energetic"].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name="energy"
                        value={option}
                        checked={quizAnswers.energy === option}
                        onChange={(e) => handleQuizAnswerChange("energy", e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 3: Occasion */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  3. Occasion
                </label>
                <div className="space-y-2">
                  {["casual", "celebration", "comfort"].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name="occasion"
                        value={option}
                        checked={quizAnswers.occasion === option}
                        onChange={(e) => handleQuizAnswerChange("occasion", e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 4: Mood */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  4. Mood today
                </label>
                <div className="space-y-2">
                  {["relaxed", "happy", "stressed", "adventurous"].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name="mood"
                        value={option}
                        checked={quizAnswers.mood === option}
                        onChange={(e) => handleQuizAnswerChange("mood", e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 5: Personal Choice */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  5. Personal choice
                </label>
                <div className="space-y-2">
                  {["classic", "experimental"].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name="preference"
                        value={option}
                        checked={quizAnswers.preference === option}
                        onChange={(e) => handleQuizAnswerChange("preference", e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleQuizSubmit}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors mt-6"
              >
                Submit & Analyze
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* AI-Predicted Mood & Character */}
              {aiAnalysis && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-3">
                    AI-Predicted Mood & Character
                  </h3>
                  <div className="mb-3">
                    <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                      {aiAnalysis.category}
                    </p>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {aiAnalysis.explanation}
                  </p>
                </div>
              )}

              {/* Personalized Item */}
              {personalizedItem && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                  <h3 className="text-xl font-bold text-green-900 dark:text-green-300 mb-4">
                    Specially Prepared Item
                  </h3>
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                      {personalizedItem.name}
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-green-700 dark:text-green-300 mb-3">
                      {personalizedItem.attributes.map((attr, idx) => (
                        <li key={idx}>{attr}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 italic">
                    {personalizedItem.reason}
                  </p>
                </div>
              )}

              {/* AI Transparency Note */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                  ℹ️ This recommendation is AI-generated based on your responses and can be customized further.
                </p>
              </div>

              <button
                onClick={() => {
                  setQuizCompleted(false);
                  setQuizAnswers({
                    taste: "",
                    energy: "",
                    occasion: "",
                    mood: "",
                    preference: "",
                  });
                  setAiAnalysis(null);
                  setPersonalizedItem(null);
                }}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Retake Quiz
              </button>
            </div>
          )}
        </div>

        {/* AI Action Log */}
        {aiActionLog.length > 0 && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              AI Action Log
            </h2>
            <div className="space-y-2">
              {aiActionLog.map((log, idx) => (
                <div
                  key={idx}
                  className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600"
                >
                  <span className="text-gray-500 dark:text-gray-400">
                    [{new Date().toLocaleTimeString()}]
                  </span>{" "}
                  {log}
                </div>
              ))}
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

        {/* AI Customer Assistant Section */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            AI Customer Assistant
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Ask questions about products, prices, and sales data. The assistant analyzes available product and order data to provide accurate answers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="ai-question-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Question:
              </label>
              <input
                id="ai-question-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., What is the cheapest product? Which product is most sold?"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAIQuery();
                  }
                }}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAIQuery}
                disabled={!query.trim() || isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : "Ask AI"}
              </button>
            </div>
            <div className="md:col-span-1">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Supported Questions:
                </p>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• What is the cheapest product?</li>
                  <li>• Which product is most sold?</li>
                  <li>• What is the price of [product name]?</li>
                </ul>
              </div>
            </div>
          </div>

          {aiResponse && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Response:
              </h3>
              <div className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap font-sans">
                {aiResponse}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
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
      </div>
    </div>
  );
}
