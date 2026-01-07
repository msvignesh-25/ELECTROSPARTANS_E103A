// Stock Monitoring Service - Tracks stock levels and sends alerts

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  alertType: 'low' | 'critical' | 'exhausted';
  date: Date;
  sent: boolean;
}

const STOCK_THRESHOLD_LOW = 10; // Alert when stock is below this
const STOCK_THRESHOLD_CRITICAL = 5; // Urgent alert when stock is below this

// Check stock levels and generate alerts
export function checkStockLevels(products: Array<{ id: string; name: string; stock: number }>): StockAlert[] {
  const alerts: StockAlert[] = [];
  const savedAlerts = loadStockAlerts();

  products.forEach((product) => {
    if (product.stock === 0) {
      // Stock exhausted
      const existingAlert = savedAlerts.find(a => 
        a.productId === product.id && a.alertType === 'exhausted'
      );
      
      if (!existingAlert || !existingAlert.sent) {
        alerts.push({
          id: `stock_alert_${product.id}_${Date.now()}`,
          productId: product.id,
          productName: product.name,
          currentStock: 0,
          threshold: 0,
          alertType: 'exhausted',
          date: new Date(),
          sent: false,
        });
      }
    } else if (product.stock <= STOCK_THRESHOLD_CRITICAL) {
      // Critical stock level
      const existingAlert = savedAlerts.find(a => 
        a.productId === product.id && 
        a.alertType === 'critical' &&
        a.currentStock === product.stock
      );
      
      if (!existingAlert || !existingAlert.sent) {
        alerts.push({
          id: `stock_alert_${product.id}_${Date.now()}`,
          productId: product.id,
          productName: product.name,
          currentStock: product.stock,
          threshold: STOCK_THRESHOLD_CRITICAL,
          alertType: 'critical',
          date: new Date(),
          sent: false,
        });
      }
    } else if (product.stock <= STOCK_THRESHOLD_LOW) {
      // Low stock level
      const existingAlert = savedAlerts.find(a => 
        a.productId === product.id && 
        a.alertType === 'low' &&
        a.currentStock === product.stock
      );
      
      if (!existingAlert || !existingAlert.sent) {
        alerts.push({
          id: `stock_alert_${product.id}_${Date.now()}`,
          productId: product.id,
          productName: product.name,
          currentStock: product.stock,
          threshold: STOCK_THRESHOLD_LOW,
          alertType: 'low',
          date: new Date(),
          sent: false,
        });
      }
    }
  });

  // Save alerts
  if (alerts.length > 0) {
    saveStockAlerts([...savedAlerts, ...alerts]);
  }

  return alerts;
}

// Store stock alerts
export function saveStockAlerts(alerts: StockAlert[]) {
  localStorage.setItem('stockAlerts', JSON.stringify(alerts));
}

export function loadStockAlerts(): StockAlert[] {
  const saved = localStorage.getItem('stockAlerts');
  return saved ? JSON.parse(saved) : [];
}

// Mark alert as sent
export function markAlertAsSent(alertId: string) {
  const alerts = loadStockAlerts();
  const updated = alerts.map(a => 
    a.id === alertId ? { ...a, sent: true } : a
  );
  saveStockAlerts(updated);
}
