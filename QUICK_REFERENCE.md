# Receipt Tracker API - Quick Reference

## 🚀 Base URL
```
http://localhost:3000/api
```

## 📋 Essential Endpoints

### Health Check
```http
GET /health
```

### Stores
```http
GET    /stores                    # Get all stores
GET    /stores/:id               # Get store by ID
POST   /stores                   # Create store
PUT    /stores/:id               # Update store
DELETE /stores/:id               # Delete store
```

### Suppliers
```http
GET    /suppliers                # Get all suppliers
GET    /suppliers/:id            # Get supplier by ID
POST   /suppliers                # Create supplier
PUT    /suppliers/:id            # Update supplier
DELETE /suppliers/:id            # Delete supplier
```

### Purchases
```http
GET    /purchases                # Get all purchases (with store info)
GET    /purchases/:id            # Get purchase by ID
POST   /purchases                # Create purchase
PUT    /purchases/:id            # Update purchase
DELETE /purchases/:id            # Delete purchase
```

### Purchase Receipts
```http
GET    /purchase-receipts                    # Get all receipts
GET    /purchase-receipts/:id               # Get receipt by ID
GET    /purchase-receipts/receipt/:number   # Get by receipt number
GET    /purchase-receipts/purchase/:id      # Get by purchase ID
GET    /purchase-receipts/supplier/:id      # Get by supplier ID
POST   /purchase-receipts                   # Create receipt
PUT    /purchase-receipts/:id               # Update receipt
DELETE /purchase-receipts/:id               # Delete receipt
```

### Payments
```http
GET    /payments                           # Get all payments
GET    /payments/:id                       # Get payment by ID
GET    /payments/purchase/:id              # Get by purchase (with summary)
GET    /payments/method/:method            # Get by payment method
POST   /payments                           # Create payment
PUT    /payments/:id                       # Update payment
DELETE /payments/:id                       # Delete payment
```

### Discount Tiers
```http
GET    /discount-tiers                     # Get all tiers
GET    /discount-tiers/:id                 # Get tier by ID
POST   /discount-tiers                     # Create tier
PUT    /discount-tiers/:id                 # Update tier
DELETE /discount-tiers/:id                 # Delete tier
```

## 🔍 Common Query Parameters

### Pagination
```
?page=1&limit=20
```

### Search
```
?search=gold
```

### Filtering
```
?store=store-001
?supplier=supplier-001
?status=Paid
?method=Cash
?karat_type=21
```

### Sorting
```
?sortBy=date&sortOrder=DESC
```

## 📊 Sample Data IDs (for testing)

### Stores
- `store-001` - Downtown Gold Store
- `store-002` - Mall Jewelry Shop  
- `store-003` - Plaza Gold Center

### Suppliers
- `supplier-001` - Golden Source Ltd
- `supplier-002` - Premium Gold Co
- `supplier-003` - Elite Jewelry Supply
- `supplier-004` - Royal Gold Traders

### Purchases
- `purchase-001` - Paid ($1,127.25)
- `purchase-002` - Partial ($813.37)
- `purchase-003` - Pending ($1,441.12)
- `purchase-004` - Overdue ($2,025.00)

## 💡 Quick Examples

### Get all stores
```javascript
fetch('http://localhost:3000/api/stores')
  .then(res => res.json())
  .then(data => console.log(data.data));
```

### Get payments for a purchase with summary
```javascript
fetch('http://localhost:3000/api/payments/purchase/purchase-001')
  .then(res => res.json())
  .then(data => {
    console.log('Payments:', data.data);
    console.log('Summary:', data.summary);
  });
```

### Search purchase receipts
```javascript
fetch('http://localhost:3000/api/purchase-receipts?search=gold')
  .then(res => res.json())
  .then(data => console.log(data.data));
```

### Create a new store
```javascript
fetch('http://localhost:3000/api/stores', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'store-004',
    name: 'New Store',
    code: 'NS',
    is_active: true,
    progress_bar_config: { blue: 10, yellow: 5, orange: 3, red: 2 }
  })
});
```

## 📝 Data Formats

### Dates
```
YYYY-MM-DD (e.g., "2025-01-15")
```

### Enums
```
Status: "Paid" | "Pending" | "Partial" | "Overdue"
Karat: "18" | "21"
Payment Method: "Cash" | "Bank Transfer" | "Check" | "Credit Card" | "Other"
```

### Booleans
```
MySQL returns: 0 (false) | 1 (true)
```

## ⚠️ Important Notes

- All IDs are strings (max 50 characters)
- Decimal values must be positive
- Foreign key relationships are enforced
- Unique constraints: store codes, supplier codes, receipt numbers
- Search works across multiple fields
- All endpoints return consistent JSON structure

## 🧪 Test the API

1. Start server: `npm start`
2. Insert dummy data: `node insert-dummy-data.js`
3. Test endpoints: `node test-dummy-data.js`
4. Health check: `curl http://localhost:3000/api/health`


