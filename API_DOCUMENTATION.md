# Receipt Tracker API Documentation

## 🚀 Overview

The Receipt Tracker API is a comprehensive REST API built with Node.js, Express, and MySQL for managing gold jewelry purchases, suppliers, stores, and payments. The API provides full CRUD operations with advanced filtering, search, and relationship management.

**Base URL:** `http://localhost:3000/api`

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Error Handling](#error-handling)
3. [Data Models](#data-models)
4. [API Endpoints](#api-endpoints)
   - [Stores](#stores)
   - [Suppliers](#suppliers)
   - [Discount Tiers](#discount-tiers)
   - [Purchases](#purchases)
   - [Purchase Suppliers](#purchase-suppliers)
   - [Purchase Receipts](#purchase-receipts)
   - [Payments](#payments)
5. [Common Query Parameters](#common-query-parameters)
6. [Example Usage](#example-usage)
7. [Testing with Dummy Data](#testing-with-dummy-data)

## 🔐 Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## ⚠️ Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

## 📊 Data Models

### Store
```json
{
  "id": "string (50 chars max)",
  "name": "string (255 chars max)",
  "code": "string (10 chars max, unique)",
  "is_active": "boolean",
  "progress_bar_config": {
    "blue": "number",
    "yellow": "number", 
    "orange": "number",
    "red": "number"
  },
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Supplier
```json
{
  "id": "string (50 chars max)",
  "name": "string (255 chars max)",
  "code": "string (10 chars max, unique)",
  "is_active": "boolean",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Discount Tier
```json
{
  "id": "string (50 chars max)",
  "supplier_id": "string (references suppliers.id)",
  "karat_type": "enum: '18' | '21'",
  "name": "string (100 chars max)",
  "threshold": "decimal (10,2)",
  "discount_percentage": "decimal (5,2)",
  "is_protected": "boolean",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Purchase
```json
{
  "id": "string (50 chars max)",
  "store_id": "string (references stores.id)",
  "date": "date (YYYY-MM-DD)",
  "status": "enum: 'Paid' | 'Pending' | 'Partial' | 'Overdue'",
  "total_grams_21k_equivalent": "decimal (10,2)",
  "total_base_fees": "decimal (12,2)",
  "total_discount_amount": "decimal (12,2)",
  "total_net_fees": "decimal (12,2)",
  "due_date": "date (YYYY-MM-DD)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Purchase Supplier
```json
{
  "id": "string (50 chars max)",
  "purchase_id": "string (references purchases.id)",
  "supplier_id": "string (references suppliers.id)",
  "karat_type": "enum: '18' | '21'",
  "grams": "decimal (10,2)",
  "base_fee_per_gram": "decimal (10,2)",
  "discount_percentage": "decimal (5,2)",
  "net_fee_per_gram": "decimal (10,2)",
  "total_base_fee": "decimal (12,2)",
  "total_discount_amount": "decimal (12,2)",
  "total_net_fee": "decimal (12,2)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Purchase Receipt
```json
{
  "id": "string (50 chars max)",
  "purchase_id": "string (references purchases.id)",
  "supplier_id": "string (references suppliers.id)",
  "receipt_number": "string (100 chars max, unique)",
  "receipt_date": "date (YYYY-MM-DD)",
  "karat_type": "enum: '18' | '21'",
  "grams": "decimal (10,2)",
  "base_fee_per_gram": "decimal (10,2)",
  "discount_percentage": "decimal (5,2)",
  "net_fee_per_gram": "decimal (10,2)",
  "total_base_fee": "decimal (12,2)",
  "total_discount_amount": "decimal (12,2)",
  "total_net_fee": "decimal (12,2)",
  "notes": "text (optional)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Payment
```json
{
  "id": "string (50 chars max)",
  "purchase_id": "string (references purchases.id)",
  "amount": "decimal (12,2)",
  "payment_date": "date (YYYY-MM-DD)",
  "payment_method": "enum: 'Cash' | 'Bank Transfer' | 'Check' | 'Credit Card' | 'Other'",
  "reference_number": "string (100 chars max, optional)",
  "notes": "text (optional)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

## 🔗 API Endpoints

### Stores

#### Get All Stores
```http
GET /api/stores
```

**Query Parameters:**
- `search` - Search by name or code
- `is_active` - Filter by active status (true/false)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `sortBy` - Sort field (id, name, code, created_at)
- `sortOrder` - Sort direction (ASC/DESC, default: DESC)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "store-001",
      "name": "Downtown Gold Store",
      "code": "DGS",
      "is_active": 1,
      "progress_bar_config": {"blue": 15, "yellow": 8, "orange": 5, "red": 3},
      "created_at": "2025-01-15T10:00:00.000Z",
      "updated_at": "2025-01-15T10:00:00.000Z"
    }
  ],
  "count": 1,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Get Store by ID
```http
GET /api/stores/:id
```

#### Create Store
```http
POST /api/stores
```

**Request Body:**
```json
{
  "id": "store-001",
  "name": "Downtown Gold Store",
  "code": "DGS",
  "is_active": true,
  "progress_bar_config": {
    "blue": 15,
    "yellow": 8,
    "orange": 5,
    "red": 3
  }
}
```

#### Update Store
```http
PUT /api/stores/:id
```

#### Delete Store
```http
DELETE /api/stores/:id
```

### Suppliers

#### Get All Suppliers
```http
GET /api/suppliers
```

**Query Parameters:** Same as stores

#### Get Supplier by ID
```http
GET /api/suppliers/:id
```

#### Create Supplier
```http
POST /api/suppliers
```

**Request Body:**
```json
{
  "id": "supplier-001",
  "name": "Golden Source Ltd",
  "code": "GSL",
  "is_active": true
}
```

#### Update Supplier
```http
PUT /api/suppliers/:id
```

#### Delete Supplier
```http
DELETE /api/suppliers/:id
```

### Discount Tiers

#### Get All Discount Tiers
```http
GET /api/discount-tiers
```

**Query Parameters:**
- `supplier` - Filter by supplier ID
- `karat_type` - Filter by karat type (18/21)
- `search` - Search by name
- `page`, `limit`, `sortBy`, `sortOrder` - Standard pagination

#### Get Discount Tier by ID
```http
GET /api/discount-tiers/:id
```

#### Create Discount Tier
```http
POST /api/discount-tiers
```

**Request Body:**
```json
{
  "id": "tier-001",
  "supplier_id": "supplier-001",
  "karat_type": "21",
  "name": "Premium 21k",
  "threshold": 500.00,
  "discount_percentage": 15.00,
  "is_protected": false
}
```

#### Update Discount Tier
```http
PUT /api/discount-tiers/:id
```

#### Delete Discount Tier
```http
DELETE /api/discount-tiers/:id
```

### Purchases

#### Get All Purchases
```http
GET /api/purchases
```

**Query Parameters:**
- `store` - Filter by store ID
- `status` - Filter by status (Paid/Pending/Partial/Overdue)
- `search` - Search by store name
- `page`, `limit`, `sortBy`, `sortOrder` - Standard pagination

**Response includes store information:**
```json
{
  "success": true,
  "data": [
    {
      "id": "purchase-001",
      "store_id": "store-001",
      "date": "2025-01-15T06:00:00.000Z",
      "status": "Paid",
      "total_grams_21k_equivalent": "250.50",
      "total_base_fees": "1252.50",
      "total_discount_amount": "125.25",
      "total_net_fees": "1127.25",
      "due_date": "2025-02-15T06:00:00.000Z",
      "store_name": "Downtown Gold Store",
      "store_code": "DGS"
    }
  ]
}
```

#### Get Purchase by ID
```http
GET /api/purchases/:id
```

#### Create Purchase
```http
POST /api/purchases
```

**Request Body:**
```json
{
  "id": "purchase-001",
  "store_id": "store-001",
  "date": "2025-01-15",
  "status": "Pending",
  "total_grams_21k_equivalent": 250.50,
  "total_base_fees": 1252.50,
  "total_discount_amount": 125.25,
  "total_net_fees": 1127.25,
  "due_date": "2025-02-15"
}
```

#### Update Purchase
```http
PUT /api/purchases/:id
```

#### Delete Purchase
```http
DELETE /api/purchases/:id
```

### Purchase Suppliers

#### Get All Purchase Suppliers
```http
GET /api/purchase-suppliers
```

**Query Parameters:**
- `purchase` - Filter by purchase ID
- `supplier` - Filter by supplier ID
- `karat_type` - Filter by karat type (18/21)
- `search` - Search by supplier name
- `page`, `limit`, `sortBy`, `sortOrder` - Standard pagination

**Response includes purchase and supplier information**

#### Get Purchase Supplier by ID
```http
GET /api/purchase-suppliers/:id
```

#### Create Purchase Supplier
```http
POST /api/purchase-suppliers
```

**Request Body:**
```json
{
  "id": "ps-001",
  "purchase_id": "purchase-001",
  "supplier_id": "supplier-001",
  "karat_type": "21",
  "grams": 150.25,
  "base_fee_per_gram": 5.00,
  "discount_percentage": 10.00,
  "net_fee_per_gram": 4.50,
  "total_base_fee": 751.25,
  "total_discount_amount": 75.13,
  "total_net_fee": 676.12
}
```

#### Update Purchase Supplier
```http
PUT /api/purchase-suppliers/:id
```

#### Delete Purchase Supplier
```http
DELETE /api/purchase-suppliers/:id
```

### Purchase Receipts

#### Get All Purchase Receipts
```http
GET /api/purchase-receipts
```

**Query Parameters:**
- `purchase` - Filter by purchase ID
- `supplier` - Filter by supplier ID
- `search` - Search by receipt number, notes, or supplier name
- `page`, `limit`, `sortBy`, `sortOrder` - Standard pagination

**Response includes purchase, supplier, and store information**

#### Get Purchase Receipt by ID
```http
GET /api/purchase-receipts/:id
```

#### Get Purchase Receipt by Receipt Number
```http
GET /api/purchase-receipts/receipt/:receiptNumber
```

#### Get Purchase Receipts by Purchase
```http
GET /api/purchase-receipts/purchase/:purchaseId
```

#### Get Purchase Receipts by Supplier
```http
GET /api/purchase-receipts/supplier/:supplierId
```

#### Create Purchase Receipt
```http
POST /api/purchase-receipts
```

**Request Body:**
```json
{
  "id": "receipt-001",
  "purchase_id": "purchase-001",
  "supplier_id": "supplier-001",
  "receipt_number": "RCP-001-2025",
  "receipt_date": "2025-01-15",
  "karat_type": "21",
  "grams": 150.25,
  "base_fee_per_gram": 5.00,
  "discount_percentage": 10.00,
  "net_fee_per_gram": 4.50,
  "total_base_fee": 751.25,
  "total_discount_amount": 75.13,
  "total_net_fee": 676.12,
  "notes": "High quality 21k gold from Golden Source"
}
```

#### Update Purchase Receipt
```http
PUT /api/purchase-receipts/:id
```

#### Delete Purchase Receipt
```http
DELETE /api/purchase-receipts/:id
```

### Payments

#### Get All Payments
```http
GET /api/payments
```

**Query Parameters:**
- `purchase` - Filter by purchase ID
- `method` - Filter by payment method
- `search` - Search by reference number, notes, or store name
- `page`, `limit`, `sortBy`, `sortOrder` - Standard pagination

**Response includes purchase and store information**

#### Get Payment by ID
```http
GET /api/payments/:id
```

#### Get Payments by Purchase
```http
GET /api/payments/purchase/:purchaseId
```

**Response includes payment summary:**
```json
{
  "success": true,
  "data": [
    {
      "id": "payment-001",
      "purchase_id": "purchase-001",
      "amount": "500.00",
      "payment_date": "2025-01-16T06:00:00.000Z",
      "payment_method": "Cash",
      "reference_number": "CASH-001",
      "notes": "Initial cash payment"
    }
  ],
  "count": 1,
  "purchase_id": "purchase-001",
  "summary": {
    "totalPaid": 1127.25,
    "purchaseTotal": 1127.25,
    "remainingBalance": 0,
    "isFullyPaid": true
  }
}
```

#### Get Payments by Method
```http
GET /api/payments/method/:method
```

**Valid methods:** Cash, Bank Transfer, Check, Credit Card, Other

#### Create Payment
```http
POST /api/payments
```

**Request Body:**
```json
{
  "id": "payment-001",
  "purchase_id": "purchase-001",
  "amount": 500.00,
  "payment_date": "2025-01-16",
  "payment_method": "Cash",
  "reference_number": "CASH-001",
  "notes": "Initial cash payment"
}
```

#### Update Payment
```http
PUT /api/payments/:id
```

#### Delete Payment
```http
DELETE /api/payments/:id
```

## 🔍 Common Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

### Sorting
- `sortBy` - Field to sort by (varies by endpoint)
- `sortOrder` - Sort direction: `ASC` or `DESC` (default: `DESC`)

### Filtering
- `search` - Text search across relevant fields
- Various endpoint-specific filters (store, supplier, status, etc.)

## 💡 Example Usage

### JavaScript/TypeScript Examples

#### Fetch All Stores
```javascript
const response = await fetch('http://localhost:3000/api/stores');
const data = await response.json();
console.log(data.data); // Array of stores
```

#### Create a New Store
```javascript
const newStore = {
  id: 'store-004',
  name: 'New Gold Store',
  code: 'NGS',
  is_active: true,
  progress_bar_config: {
    blue: 10,
    yellow: 5,
    orange: 3,
    red: 2
  }
};

const response = await fetch('http://localhost:3000/api/stores', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(newStore)
});

const result = await response.json();
```

#### Get Payments for a Purchase with Summary
```javascript
const response = await fetch('http://localhost:3000/api/payments/purchase/purchase-001');
const data = await response.json();

console.log('Payments:', data.data);
console.log('Total Paid:', data.summary.totalPaid);
console.log('Remaining:', data.summary.remainingBalance);
console.log('Fully Paid:', data.summary.isFullyPaid);
```

#### Search Purchase Receipts
```javascript
const response = await fetch('http://localhost:3000/api/purchase-receipts?search=gold&page=1&limit=10');
const data = await response.json();
```

#### Filter Purchases by Status
```javascript
const response = await fetch('http://localhost:3000/api/purchases?status=Paid&sortBy=date&sortOrder=DESC');
const data = await response.json();
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

function useStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStores() {
      try {
        const response = await fetch('http://localhost:3000/api/stores');
        const data = await response.json();
        
        if (data.success) {
          setStores(data.data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStores();
  }, []);

  return { stores, loading, error };
}
```

## 🧪 Testing with Dummy Data

The API comes with comprehensive dummy data for testing:

### Available Test Data:
- **3 Stores** with different configurations
- **4 Suppliers** with various discount tiers
- **4 Purchases** with different statuses (Paid, Partial, Pending, Overdue)
- **8 Purchase Receipts** with different karat types and suppliers
- **5 Payments** with different methods and amounts
- **8 Discount Tiers** with different thresholds and percentages

### Test Endpoints:
```bash
# Health check
GET http://localhost:3000/api/health

# Get all stores
GET http://localhost:3000/api/stores

# Get all purchases with store info
GET http://localhost:3000/api/purchases

# Get payments for a specific purchase with summary
GET http://localhost:3000/api/payments/purchase/purchase-001

# Get purchase receipts with search
GET http://localhost:3000/api/purchase-receipts?search=gold

# Get discount tiers for a supplier
GET http://localhost:3000/api/discount-tiers?supplier=supplier-001
```

### Sample Test Data IDs:
- **Stores:** `store-001`, `store-002`, `store-003`
- **Suppliers:** `supplier-001`, `supplier-002`, `supplier-003`, `supplier-004`
- **Purchases:** `purchase-001`, `purchase-002`, `purchase-003`, `purchase-004`
- **Payments:** `payment-001`, `payment-002`, `payment-003`, `payment-004`, `payment-005`

## 🚀 Getting Started

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Insert dummy data:**
   ```bash
   node insert-dummy-data.js
   ```

3. **Test the API:**
   ```bash
   node test-dummy-data.js
   ```

4. **Health check:**
   ```bash
   curl http://localhost:3000/api/health
   ```

## 📝 Notes

- All dates should be in `YYYY-MM-DD` format
- Decimal values should be positive numbers
- Enum values are case-sensitive
- Foreign key relationships are enforced
- Unique constraints are enforced (store codes, supplier codes, receipt numbers)
- The API returns MySQL boolean values as integers (0/1)

## 🔧 Development

- **Server:** Node.js with Express
- **Database:** MySQL with mysql2 driver
- **Port:** 3000 (configurable via PORT environment variable)
- **CORS:** Enabled for all origins
- **Security:** Helmet middleware enabled
- **Logging:** Morgan combined format

For any issues or questions, check the server logs for detailed error messages.


