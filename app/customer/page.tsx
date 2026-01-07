'use client';

import React, { useState } from 'react';
import { saveOrder } from '@/services/metricsService';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  stock: number; // Add stock quantity
  rating: number;
  reviews: number;
  features: string[];
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function CustomerPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [products, setProducts] = useState<Product[]>([

    {
      id: '1',
      name: 'Premium Coffee Blend',
      description: 'Artisan roasted coffee beans sourced from premium farms. Rich, smooth flavor with notes of chocolate and caramel.',
      price: 2074, // ₹ (24.99 USD * 83)
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
      price: 291, // ₹ (3.50 USD * 83)
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
      price: 7467, // ₹ (89.99 USD * 83)
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
      price: 4149, // ₹ (49.99 USD * 83)
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
      price: 580, // ₹ (6.99 USD * 83)
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
      price: 1576, // ₹ (18.99 USD * 83)
      category: 'Beverages',
      image: '🫖',
      inStock: true,
      stock: 40,
      rating: 4.7,
      reviews: 94,
      features: ['20 Tea Bags', 'Premium Quality', 'Multiple Varieties', 'Gift Ready'],
    },
  ]);

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];
  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  // Add to cart function - reduces stock
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0 || !product.inStock) {
      alert('Product is out of stock!');
      return;
    }

    // Update stock
    setProducts(products.map(p => 
      p.id === product.id 
        ? { ...p, stock: p.stock - 1, inStock: p.stock - 1 > 0 }
        : p
    ));

    // Add to cart or increase quantity
    const existingCartItem = cart.find(item => item.product.id === product.id);
    if (existingCartItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }

    alert(`${product.name} added to cart! Stock remaining: ${product.stock - 1}`);
  };

  // Remove from cart function - restores stock
  const handleRemoveFromCart = (productId: string) => {
    const cartItem = cart.find(item => item.product.id === productId);
    if (cartItem) {
      // Restore stock
      setProducts(products.map(p => 
        p.id === productId 
          ? { ...p, stock: p.stock + cartItem.quantity, inStock: true }
          : p
      ));

      // Remove from cart
      setCart(cart.filter(item => item.product.id !== productId));
    }
  };

  // Calculate total
  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Handle checkout - save orders to metrics
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    cart.forEach((item) => {
      // Generate unique customer ID (in production, this would come from auth)
      const customerId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Save order for each item
      for (let i = 0; i < item.quantity; i++) {
        saveOrder({
          id: `order_${Date.now()}_${i}`,
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: 1,
          date: new Date(),
          customerId,
          customerName: `Customer ${customerId.slice(-6)}`,
          reviewSubmitted: false,
        });
      }
    });

    alert(`Order placed successfully! Total: ₹${cartTotal.toLocaleString('en-IN')}`);
    setCart([]);
    
    // Show review form for first item
    if (cart.length > 0) {
      setReviewProduct(cart[0].product);
      setShowReviewForm(true);
    }
  };

  // Handle review submission
  const handleSubmitReview = () => {
    if (!reviewProduct) return;

    const customerId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    saveReview({
      id: `review_${Date.now()}`,
      orderId: `order_${Date.now()}`,
      customerId,
      customerName: `Customer ${customerId.slice(-6)}`,
      rating: reviewRating,
      comment: reviewComment,
      date: new Date(),
    });

    // Update product review count
    setProducts(products.map(p => 
      p.id === reviewProduct.id 
        ? { ...p, reviews: p.reviews + 1, rating: (p.rating * p.reviews + reviewRating) / (p.reviews + 1) }
        : p
    ));

    alert('Thank you for your review!');
    setShowReviewForm(false);
    setReviewProduct(null);
    setReviewComment('');
    setReviewRating(5);
  };

  const handleAIQuery = () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      let response = '';

      if (lowerQuery.includes('price') || lowerQuery.includes('cost') || lowerQuery.includes('expensive')) {
        const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;
        response = `Pricing Information:\n\n`;
        response += `• Average Product Price: ₹${avgPrice.toFixed(2)}\n`;
        response += `• Price Range: ₹${Math.min(...products.map((p) => p.price)).toFixed(2)} - ₹${Math.max(...products.map((p) => p.price)).toFixed(2)}\n\n`;
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
        response += `• Highest Rated: ${topRated.name} (${topRated.rating}⭐, ₹${topRated.price})\n`;
        response += `• Most Popular: ${mostReviewed.name} (${mostReviewed.reviews} reviews, ₹${mostReviewed.price})\n\n`;
        response += `Based on customer feedback, ${topRated.name} is our top-rated product, while ${mostReviewed.name} is our most popular choice.`;
      } else if (lowerQuery.includes('delivery') || lowerQuery.includes('shipping') || lowerQuery.includes('time')) {
        response = `Delivery Information:\n\n`;
        response += `• Standard Delivery: 3-5 business days\n`;
        response += `• Express Delivery: 1-2 business days (available)\n`;
        response += `• Same-Day Service: Available for local orders\n`;
        response += `• Free Shipping: On orders over ₹4150\n\n`;
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Customer Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse products and get AI-powered assistance
          </p>
        </div>

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
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">⭐</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {product.rating} ({product.reviews})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          product.inStock
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}
                      >
                        {product.inStock ? `In Stock (${product.stock} left)` : 'Out of Stock'}
                      </span>
                    </div>
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
                    disabled={!product.inStock || product.stock <= 0}
                  >
                    {product.inStock && product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cart and AI Assistant Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Shopping Cart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🛒 Shopping Cart
              </h2>
              {cart.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-sm">Your cart is empty</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.product.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          ₹{item.product.price.toLocaleString('en-IN')} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => handleRemoveFromCart(item.product.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-semibold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-gray-300 dark:border-gray-600 pt-3">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">Total:</span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        ₹{cartTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* AI Assistant */}
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

      {/* Review Form Modal */}
      {showReviewForm && reviewProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Review: {reviewProduct.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setReviewRating(rating)}
                      className={`text-2xl ${
                        rating <= reviewRating
                          ? 'text-yellow-500'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comment (Optional)
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Share your experience..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitReview}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Submit Review
                </button>
                <button
                  onClick={() => {
                    setShowReviewForm(false);
                    setReviewProduct(null);
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
