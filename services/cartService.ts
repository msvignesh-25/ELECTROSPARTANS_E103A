// Cart Service - Manages shopping cart and stock updates

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
}

// Store cart in localStorage
export function addToCart(product: Product, quantity: number = 1): { success: boolean; message: string } {
  if (typeof window === 'undefined') {
    return { success: false, message: 'Cart not available' };
  }

  try {
    // Get current cart
    const cartJson = localStorage.getItem('cart');
    const cart: CartItem[] = cartJson ? JSON.parse(cartJson) : [];

    // Get current stock
    const stockJson = localStorage.getItem('products_stock');
    const products: Product[] = stockJson ? JSON.parse(stockJson) : [];

    // Find product in stock
    const productInStock = products.find(p => p.id === product.id);
    if (!productInStock) {
      return { success: false, message: 'Product not found in inventory' };
    }

    // Check if enough stock available
    const existingCartItem = cart.find(item => item.productId === product.id);
    const currentCartQuantity = existingCartItem ? existingCartItem.quantity : 0;
    const totalNeeded = currentCartQuantity + quantity;

    if (productInStock.stock < totalNeeded) {
      return { 
        success: false, 
        message: `Only ${productInStock.stock} items available in stock. You already have ${currentCartQuantity} in cart.` 
      };
    }

    // Update or add to cart
    if (existingCartItem) {
      existingCartItem.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.image,
      });
    }

    // Update stock
    productInStock.stock -= quantity;
    const updatedProducts = products.map(p => 
      p.id === product.id ? productInStock : p
    );

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('products_stock', JSON.stringify(updatedProducts));

    return { success: true, message: `${quantity} ${product.name} added to cart` };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return { success: false, message: 'Failed to add to cart' };
  }
}

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const cartJson = localStorage.getItem('cart');
    return cartJson ? JSON.parse(cartJson) : [];
  } catch {
    return [];
  }
}

export function removeFromCart(productId: string, quantity: number = 1): void {
  if (typeof window === 'undefined') return;

  try {
    const cartJson = localStorage.getItem('cart');
    const cart: CartItem[] = cartJson ? JSON.parse(cartJson) : [];
    const stockJson = localStorage.getItem('products_stock');
    const products: Product[] = stockJson ? JSON.parse(stockJson) : [];

    const item = cart.find(i => i.productId === productId);
    if (!item) return;

    // Update stock back
    const product = products.find(p => p.id === productId);
    if (product) {
      product.stock += quantity;
      localStorage.setItem('products_stock', JSON.stringify(products));
    }

    // Update cart
    if (item.quantity <= quantity) {
      const updatedCart = cart.filter(i => i.productId !== productId);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } else {
      item.quantity -= quantity;
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
  }
}

export function clearCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('cart');
}

export function getProductStock(productId: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const stockJson = localStorage.getItem('products_stock');
    const products: Product[] = stockJson ? JSON.parse(stockJson) : [];
    const product = products.find(p => p.id === productId);
    return product ? product.stock : 0;
  } catch {
    return 0;
  }
}

// Initialize stock from products if not exists
export function initializeStock(products: Product[]): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = localStorage.getItem('products_stock');
    if (!existing) {
      // Initialize with default stock values
      const productsWithStock = products.map(p => ({
        ...p,
        stock: p.stock || 50, // Default stock if not provided
      }));
      localStorage.setItem('products_stock', JSON.stringify(productsWithStock));
    }
  } catch (error) {
    console.error('Error initializing stock:', error);
  }
}
