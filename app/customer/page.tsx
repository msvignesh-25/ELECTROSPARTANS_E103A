'use client';

import React, { useState, useEffect } from 'react';
import { addToCart, getCart, getProductStock, initializeStock, type CartItem } from '@/services/cartService';

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

export default function CustomerPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productStocks, setProductStocks] = useState<Record<string, number>>({});
  const [showCart, setShowCart] = useState(false);

  // Sample product data with stock
  const products: Product[] = [
    {
      id: '1',
      name: 'Premium Coffee Blend',
      description: 'Artisan roasted coffee beans sourced from premium farms. Rich, smooth flavor with notes of chocolate and caramel.',
      price: 2499, // Price in rupees (₹2499)
      category: 'Beverages',
      image: '☕',
      inStock: true,
      stock: 50,
      rating: 4.8,
      reviews: 156,
      features: ['100% Arabica', 'Fair Trade', 'Fresh Roasted', '1lb Bag'],
    },
    {
      id: '2',
      name: 'Fresh Baked Croissants',
      description: 'Buttery, flaky croissants baked fresh daily. Available in plain, chocolate, and almond varieties.',
      price: 350, // ₹350
      category: 'Bakery',
      image: '🥐',
      inStock: true,
      stock: 30,
      rating: 4.9,
      reviews: 203,
      features: ['Fresh Daily', 'Butter Rich', 'Multiple Varieties', 'Vegan Option'],
    },
    {
      id: '3',
      name: 'Phone Screen Repair',
      description: 'Professional screen replacement service for all major smartphone brands. Same-day service available.',
      price: 8999, // ₹8999
      category: 'Services',
      image: '📱',
      inStock: true,
      stock: 10,
      rating: 4.7,
      reviews: 342,
      features: ['Same-Day Service', 'Warranty Included', 'All Brands', 'Professional Grade'],
    },
    {
      id: '4',
      name: 'Laptop Diagnostic Service',
      description: 'Comprehensive laptop diagnostic and repair service. We identify and fix hardware and software issues.',
      price: 4999, // ₹4999
      category: 'Services',
      image: '💻',
      inStock: true,
      stock: 15,
      rating: 4.6,
      reviews: 128,
      features: ['Full Diagnostic', 'Hardware Repair', 'Software Fix', 'Data Recovery'],
    },
    {
      id: '5',
      name: 'Artisan Sourdough Bread',
      description: 'Traditional sourdough bread made with natural fermentation. Crusty exterior, soft interior.',
      price: 699, // ₹699
      category: 'Bakery',
      image: '🍞',
      inStock: true,
      stock: 25,
      rating: 4.9,
      reviews: 187,
      features: ['Natural Fermentation', 'No Preservatives', 'Large Loaf', 'Freezes Well'],
    },
    {
      id: '6',
      name: 'Specialty Tea Collection',
      description: 'Curated selection of premium teas from around the world. Includes green, black, herbal, and oolong varieties.',
      price: 1899, // ₹1899
      category: 'Beverages',
      image: '🫖',
      inStock: true,
      stock: 40,
      rating: 4.7,
      reviews: 94,
      features: ['20 Tea Bags', 'Premium Quality', 'Multiple Varieties', 'Gift Ready'],
    },
  ];

  // Initialize stock and load cart
  useEffect(() => {
    initializeStock(products.map(p => ({ id: p.id, name: p.name, price: p.price, stock: p.stock || 50, image: p.image })));
    setCart(getCart());
    // Load current stock for each product
    const stocks: Record<string, number> = {};
    products.forEach(p => {
      stocks[p.id] = getProductStock(p.id) || p.stock || 50;
    });
    setProductStocks(stocks);
  }, []);

  const handleAddToCart = (product: Product) => {
    const result = addToCart(
      { id: product.id, name: product.name, price: product.price, stock: productStocks[product.id] || product.stock || 0, image: product.image },
      1
    );
    
    if (result.success) {
      setCart(getCart());
      // Update stock display
      const newStock = (productStocks[product.id] || product.stock || 0) - 1;
      setProductStocks({ ...productStocks, [product.id]: newStock });
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];
  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const handleAIQuery = () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      let response = '';

      if (lowerQuery.includes('price') || lowerQuery.includes('cost') || lowerQuery.includes('expensive')) {
        const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;
        response = `Pricing Information:\n\n`;
        response += `• Average Product Price: ₹${avgPrice.toLocaleString('en-IN')}\n`;
        response += `• Price Range: ₹${Math.min(...products.map((p) => p.price)).toLocaleString('en-IN')} - ₹${Math.max(...products.map((p) => p.price)).toLocaleString('en-IN')}\n\n`;
        response += `Our products are competitively priced with excellent value. All prices include quality assurance and customer support.`;
      } else if (lowerQuery.includes('quality') || lowerQuery.includes('good') || lowerQuery.includes('best')) {
        const avgRating = products.reduce((sum, p) => sum + p.rating, 0) / products.length;
        response = `Quality Information:\n\n`;
        response += `• Average Rating: ${avgRating.toFixed(1)}/5.0 ⭐\n`;
        response += `• Total Reviews: ${products.reduce((sum, p) => sum + p.reviews, 0)} customer reviews\n`;
        response += `• All products are quality-tested and customer-approved\n\n`;
        response += `We maintain high quality standards with an average ${avgRating.toFixed(1)}-star rating from ${products.reduce((sum, p) => sum + p.reviews, 0)} satisfied customers.`;
      } else if (lowerQuery.includes('available') || lowerQuery.includes('stock') || lowerQuery.includes('in stock')) {
        const inStockCount = products.filter((p) => p.inStock).length;
        response = `Availability:\n\n`;
        response += `• ${inStockCount} out of ${products.length} products currently in stock\n`;
        response += `• All listed products are available for purchase\n`;
        response += `• Fast shipping and delivery options available\n\n`;
        response += `Most products are in stock and ready for immediate purchase. Check individual product pages for specific availability.`;
      } else if (lowerQuery.includes('recommend') || lowerQuery.includes('suggest') || lowerQuery.includes('popular')) {
        const topRated = [...products].sort((a, b) => b.rating - a.rating)[0];
        const mostReviewed = [...products].sort((a, b) => b.reviews - a.reviews)[0];
        response = `Recommendations:\n\n`;
        response += `• Highest Rated: ${topRated.name} (${topRated.rating}⭐, ₹${topRated.price.toLocaleString('en-IN')})\n`;
        response += `• Most Popular: ${mostReviewed.name} (${mostReviewed.reviews} reviews, ₹${mostReviewed.price.toLocaleString('en-IN')})\n\n`;
        response += `Based on customer feedback, ${topRated.name} is our top-rated product, while ${mostReviewed.name} is our most popular choice.`;
      } else if (lowerQuery.includes('delivery') || lowerQuery.includes('shipping') || lowerQuery.includes('time')) {
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
        response += `• Stock availability\n`;
        response += `• Product recommendations\n`;
        response += `• Delivery and shipping options\n\n`;
        response += `Please ask a specific question about our products or services!`;
      }

      setAiResponse(response);
      setIsLoading(false);
    }, 1000);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Customer Portal
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Browse products and get AI-powered assistance
            </p>
          </div>
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

        {/* Cart Sidebar */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md h-full overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shopping Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              {cart.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-4">
                    {cart.map((item) => (
                      <div key={item.productId} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">Total:</span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatPrice(cartTotal)}</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Category Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
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
                        (productStocks[product.id] || product.stock || 0) > 0
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}
                    >
                      {(productStocks[product.id] || product.stock || 0) > 0 
                        ? `In Stock (${productStocks[product.id] || product.stock || 0} available)` 
                        : 'Out of Stock'}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Features:</p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      {product.features.map((feature, idx) => (
                        <li key={idx}>✓ {feature}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={(productStocks[product.id] || product.stock || 0) <= 0}
                  >
                    {(productStocks[product.id] || product.stock || 0) > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* AI Assistant Sidebar */}
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
                  placeholder="e.g., What are the prices? Which product is best? Is it in stock?"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-sm"
                  rows={4}
                />

                <button
                  onClick={handleAIQuery}
                  disabled={!query.trim() || isLoading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isLoading ? 'Searching...' : 'Ask AI'}
                </button>

                {aiResponse && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 text-sm">AI Response:</h3>
                    <pre className="text-xs text-blue-800 dark:text-blue-200 whitespace-pre-wrap font-sans">
                      {aiResponse}
                    </pre>
                  </div>
                )}

                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Example Questions:</p>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• What are the prices?</li>
                    <li>• Which product is best?</li>
                    <li>• Is it in stock?</li>
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
