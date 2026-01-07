// Metrics Service - Tracks and calculates business metrics

export interface Order {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  date: Date;
  customerId?: string;
  customerName?: string;
  reviewSubmitted: boolean;
}

export interface Review {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: Date;
}

export interface MonthlyMetrics {
  month: string;
  revenue: number;
  ordersCompleted: number;
  repeatedCustomers: number;
  newCustomers: number;
  growthRate: number;
}

export interface MetricsData {
  monthlyRevenue: number;
  ordersCompleted: number;
  repeatedCustomers: number;
  growthTrend: MonthlyMetrics[];
  totalCustomers: number;
  averageOrderValue: number;
  customerRetentionRate: number;
}

// Store orders
export function saveOrder(order: Order) {
  const orders = loadOrders();
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));
}

export function loadOrders(): Order[] {
  const saved = localStorage.getItem('orders');
  return saved ? JSON.parse(saved) : [];
}

// Store reviews
export function saveReview(review: Review) {
  const reviews = loadReviews();
  reviews.push(review);
  localStorage.setItem('reviews', JSON.stringify(reviews));
}

export function loadReviews(): Review[] {
  const saved = localStorage.getItem('reviews');
  return saved ? JSON.parse(saved) : [];
}

// Calculate monthly revenue
export function calculateMonthlyRevenue(month?: number, year?: number): number {
  const orders = loadOrders();
  const now = new Date();
  const targetMonth = month !== undefined ? month : now.getMonth();
  const targetYear = year !== undefined ? year : now.getFullYear();

  return orders
    .filter(order => {
      const orderDate = new Date(order.date);
      return orderDate.getMonth() === targetMonth && orderDate.getFullYear() === targetYear;
    })
    .reduce((sum, order) => sum + (order.price * order.quantity), 0);
}

// Calculate orders completed
export function calculateOrdersCompleted(month?: number, year?: number): number {
  const orders = loadOrders();
  const now = new Date();
  const targetMonth = month !== undefined ? month : now.getMonth();
  const targetYear = year !== undefined ? year : now.getFullYear();

  return orders.filter(order => {
    const orderDate = new Date(order.date);
    return orderDate.getMonth() === targetMonth && orderDate.getFullYear() === targetYear;
  }).length;
}

// Calculate repeated customers (customers who submitted reviews)
export function calculateRepeatedCustomers(month?: number, year?: number): number {
  const reviews = loadReviews();
  const now = new Date();
  const targetMonth = month !== undefined ? month : now.getMonth();
  const targetYear = year !== undefined ? year : now.getFullYear();

  const reviewsThisMonth = reviews.filter(review => {
    const reviewDate = new Date(review.date);
    return reviewDate.getMonth() === targetMonth && reviewDate.getFullYear() === targetYear;
  });

  // Count unique customers who submitted reviews
  const uniqueCustomers = new Set(reviewsThisMonth.map(r => r.customerId));
  return uniqueCustomers.size;
}

// Calculate growth trend (last 6 months)
export function calculateGrowthTrend(): MonthlyMetrics[] {
  const now = new Date();
  const months: MonthlyMetrics[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    const revenue = calculateMonthlyRevenue(date.getMonth(), date.getFullYear());
    const orders = calculateOrdersCompleted(date.getMonth(), date.getFullYear());
    const repeated = calculateRepeatedCustomers(date.getMonth(), date.getFullYear());
    
    // Calculate new customers (orders - repeated customers)
    const allOrders = loadOrders().filter(order => {
      const orderDate = new Date(order.date);
      return orderDate.getMonth() === date.getMonth() && 
             orderDate.getFullYear() === date.getFullYear();
    });
    const uniqueCustomers = new Set(allOrders.map(o => o.customerId).filter(Boolean));
    const newCustomers = uniqueCustomers.size - repeated;

    // Calculate growth rate compared to previous month
    let growthRate = 0;
    if (i < 5) {
      const prevMonth = months[months.length - 1];
      if (prevMonth.revenue > 0) {
        growthRate = ((revenue - prevMonth.revenue) / prevMonth.revenue) * 100;
      }
    }

    months.push({
      month: monthName,
      revenue,
      ordersCompleted: orders,
      repeatedCustomers: repeated,
      newCustomers,
      growthRate,
    });
  }

  return months;
}

// Get complete metrics data
export function getMetricsData(): MetricsData {
  const now = new Date();
  const monthlyRevenue = calculateMonthlyRevenue();
  const ordersCompleted = calculateOrdersCompleted();
  const repeatedCustomers = calculateRepeatedCustomers();
  const growthTrend = calculateGrowthTrend();

  // Calculate total customers
  const allOrders = loadOrders();
  const uniqueCustomers = new Set(allOrders.map(o => o.customerId).filter(Boolean));
  const totalCustomers = uniqueCustomers.size;

  // Calculate average order value
  const totalRevenue = allOrders.reduce((sum, o) => sum + (o.price * o.quantity), 0);
  const averageOrderValue = ordersCompleted > 0 ? totalRevenue / allOrders.length : 0;

  // Calculate customer retention rate (customers who submitted reviews / total customers)
  const customerRetentionRate = totalCustomers > 0 
    ? (repeatedCustomers / totalCustomers) * 100 
    : 0;

  return {
    monthlyRevenue,
    ordersCompleted,
    repeatedCustomers,
    growthTrend,
    totalCustomers,
    averageOrderValue,
    customerRetentionRate,
  };
}

// Get previous month's revenue for comparison
export function getPreviousMonthRevenue(): number {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return calculateMonthlyRevenue(lastMonth.getMonth(), lastMonth.getFullYear());
}
