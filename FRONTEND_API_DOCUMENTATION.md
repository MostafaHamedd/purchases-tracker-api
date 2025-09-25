# Frontend API Documentation - Receipt Tracker API

**Base URL:** `http://10.152.9.172:3000/api` (for Expo Go) or `http://localhost:3000/api` (for local development)

## 📋 Table of Contents

1. [Common Response Format](#common-response-format)
2. [Error Handling](#error-handling)
3. [Suppliers API](#suppliers-api)
4. [Discount Tiers API](#discount-tiers-api)
5. [Purchases API](#purchases-api)
6. [Purchase Suppliers API](#purchase-suppliers-api)
7. [Purchase Receipts API](#purchase-receipts-api)
8. [Payments API](#payments-api)

---

## Common Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

---

## Error Handling

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

---

## Suppliers API

### GET /api/suppliers
**Get all suppliers**

**Query Parameters:**
- `is_active` (optional): `true` or `false` - Filter by active status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "supplier-001",
      "name": "Golden Source Ltd",
      "code": "GSL",
      "is_active": 1,
      "created_at": "2025-09-20T21:06:36.000Z",
      "updated_at": "2025-09-20T21:06:36.000Z"
    }
  ],
  "count": 1
}
```

### GET /api/suppliers/:id
**Get supplier by ID**

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "supplier-001",
    "name": "Golden Source Ltd",
    "code": "GSL",
    "is_active": 1,
    "created_at": "2025-09-20T21:06:36.000Z",
    "updated_at": "2025-09-20T21:06:36.000Z"
  }
}
```

### POST /api/suppliers
**Create new supplier**

**Required Fields:**
- `id` (string, max 50 chars) - Unique supplier ID
- `name` (string, max 255 chars) - Supplier name
- `code` (string, 3-10 chars) - Uppercase letters/numbers only

**Optional Fields:**
- `is_active` (boolean) - Defaults to `true`

**Request Body:**
```json
{
  "id": "supplier-005",
  "name": "New Gold Supplier",
  "code": "NGS",
  "is_active": true
}
```

**Validation Rules:**
- `code` must be 3-10 uppercase letters/numbers only
- `id` and `code` must be unique

### PUT /api/suppliers/:id
**Update supplier**

**Optional Fields:**
- `name` (string, max 255 chars)
- `code` (string, 3-10 chars, uppercase letters/numbers only)
- `is_active` (boolean)

### DELETE /api/suppliers/:id
**Delete supplier**

---

## Discount Tiers API

### GET /api/discount-tiers
**Get all discount tiers**

**Query Parameters:**
- `supplier_id` (optional) - Filter by supplier
- `karat_type` (optional) - `"18"` or `"21"`

### GET /api/discount-tiers/:id
**Get discount tier by ID**

### POST /api/discount-tiers
**Create new discount tier**

**Required Fields:**
- `id` (string, max 50 chars) - Unique tier ID
- `supplier_id` (string) - Must exist in suppliers table
- `karat_type` (string) - `"18"` or `"21"`
- `name` (string, max 100 chars) - Tier name
- `threshold` (number) - Minimum grams for this tier (>= 0)
- `discount_percentage` (number) - Discount percentage (0-100)

**Optional Fields:**
- `is_protected` (boolean) - Defaults to `false`

**Request Body:**
```json
{
  "id": "tier-009",
  "supplier_id": "supplier-001",
  "karat_type": "21",
  "name": "Premium 21k",
  "threshold": 200.0,
  "discount_percentage": 8.5,
  "is_protected": false
}
```

**Validation Rules:**
- `threshold` must be >= 0
- `discount_percentage` must be between 0 and 100
- `karat_type` must be either "18" or "21"
- `supplier_id` must exist

### PUT /api/discount-tiers/:id
**Update discount tier**

### DELETE /api/discount-tiers/:id
**Delete discount tier**

---

## Purchases API

### GET /api/purchases
**Get all purchases**

**Query Parameters:**
- `store` (optional) - Filter by store ID
- `status` (optional) - Filter by status
- `search` (optional) - Search query
- `page` (optional) - Page number
- `limit` (optional) - Items per page

### GET /api/purchases/:id
**Get purchase by ID**

### POST /api/purchases
**Create new purchase**

**Required Fields:**
- `id` (string, max 50 chars) - Unique purchase ID
- `store_id` (string) - Must exist in stores table
- `supplier_id` (string) - Must exist in suppliers table
- `date` (string) - Date in YYYY-MM-DD format

**Optional Fields:**
- `status` (string) - `"Paid"`, `"Pending"`, `"Partial"`, or `"Overdue"` (defaults to "Pending")
- `total_grams_21k_equivalent` (number) - Defaults to 0
- `total_base_fees` (number) - Defaults to 0
- `total_discount_amount` (number) - Defaults to 0
- `total_net_fees` (number) - Defaults to 0
- `due_date` (string) - Date in YYYY-MM-DD format

**Request Body:**
```json
{
  "id": "purchase-003",
  "store_id": "1",
  "supplier_id": "1",
  "date": "2025-09-22",
  "status": "Pending",
  "total_grams_21k_equivalent": 100.50,
  "total_base_fees": 5000.00,
  "total_discount_amount": 250.00,
  "total_net_fees": 4750.00,
  "due_date": "2025-10-22"
}
```

**Success Response (HTTP 201 Created):**
```json
{
  "success": true,
  "message": "Purchase, purchase supplier, and purchase receipt created successfully",
  "data": {
    "id": "purchase-003",
    "store_id": "1",
    "supplier_id": "1",
    "date": "2025-09-22",
    "status": "Pending",
    "total_grams_21k_equivalent": 100.50,
    "total_base_fees": 5000.00,
    "total_discount_amount": 250.00,
    "total_net_fees": 4750.00,
    "due_date": "2025-10-22",
    "store_name": "Downtown Gold Store",
    "supplier_name": "Eg21",
    "purchase_supplier_id": "ps-purchase-003-1",
    "purchase_receipt_id": "pr-purchase-003-1-1"
  }
}
```

**Note:** This endpoint automatically creates corresponding records in:
- `purchase_suppliers` table
- `purchase_receipts` table (receipt #1)

**Validation Rules:**
- `date` and `due_date` must be in YYYY-MM-DD format
- `total_grams_21k_equivalent` cannot be negative (fees can be negative)
- `store_id` must exist in stores table
- `supplier_id` must exist in suppliers table

**Available Store IDs:**
- `1` (Downtown Gold Store)
- `2` (Mall Jewelry Shop)
- `3` (Plaza Gold Center)
- `1758406458499` (Osama)

**Available Supplier IDs:**
- `1` (Gold Supplier A)
- `2` (Gold Supplier B)
- `3` (Gold Supplier C)
- `4` (Gold Supplier D)

### PUT /api/purchases/:id
**Update purchase**

### DELETE /api/purchases/:id
**Delete purchase**

---

## Purchase Suppliers API

### GET /api/purchase-suppliers
**Get all purchase suppliers**

**Query Parameters:**
- `purchase_id` (optional) - Filter by purchase
- `supplier_id` (optional) - Filter by supplier

### GET /api/purchase-suppliers/:id
**Get purchase supplier by ID**

### POST /api/purchase-suppliers
**Create new purchase supplier**

**Required Fields:**
- `id` (string, max 50 chars) - Unique ID
- `purchase_id` (string) - Must exist in purchases table
- `supplier_id` (string) - Must exist in suppliers table
- `karat_type` (string) - `"18"` or `"21"`
- `grams` (number) - Must be > 0
- `base_fee_per_gram` (number) - Must be >= 0
- `net_fee_per_gram` (number) - Must be >= 0
- `total_base_fee` (number) - Must be >= 0
- `total_net_fee` (number) - Must be >= 0

**Optional Fields:**
- `discount_percentage` (number) - Defaults to 0 (0-100)
- `total_discount_amount` (number) - Defaults to 0 (>= 0)

**Request Body:**
```json
{
  "id": "ps-001",
  "purchase_id": "purchase-001",
  "supplier_id": "supplier-001",
  "karat_type": "21",
  "grams": 50.0,
  "base_fee_per_gram": 100.0,
  "net_fee_per_gram": 95.0,
  "total_base_fee": 5000.0,
  "total_net_fee": 4750.0,
  "discount_percentage": 5.0,
  "total_discount_amount": 250.0
}
```

**Validation Rules:**
- `grams` must be > 0
- All fee fields must be >= 0
- `discount_percentage` must be 0-100
- `karat_type` must be "18" or "21"
- `purchase_id` and `supplier_id` must exist

### PUT /api/purchase-suppliers/:id
**Update purchase supplier**

### DELETE /api/purchase-suppliers/:id
**Delete purchase supplier**

---

## Purchase Receipts API

### GET /api/purchase-receipts
**Get all purchase receipts**

**Query Parameters:**
- `purchase_id` (optional) - Filter by purchase
- `supplier_id` (optional) - Filter by supplier
- `receipt_number` (optional) - Search by receipt number

### GET /api/purchase-receipts/:id
**Get purchase receipt by ID**

### POST /api/purchase-receipts
**Create new purchase receipt**

**Required Fields:**
- `id` (string, max 50 chars) - Unique ID
- `purchase_id` (string) - Must exist in purchases table
- `supplier_id` (string) - Must exist in suppliers table
- `receipt_number` (string) - Receipt number
- `receipt_date` (string) - Date in YYYY-MM-DD format
- `karat_type` (string) - `"18"` or `"21"`
- `grams` (number) - Must be > 0
- `base_fee_per_gram` (number) - Must be >= 0
- `net_fee_per_gram` (number) - Must be >= 0
- `total_base_fee` (number) - Must be >= 0
- `total_net_fee` (number) - Must be >= 0

**Optional Fields:**
- `discount_percentage` (number) - Defaults to 0 (0-100)
- `total_discount_amount` (number) - Defaults to 0 (>= 0)
- `notes` (string) - Additional notes

**Request Body:**
```json
{
  "id": "receipt-001",
  "purchase_id": "purchase-001",
  "supplier_id": "supplier-001",
  "receipt_number": "RCP-2025-001",
  "receipt_date": "2025-09-22",
  "karat_type": "21",
  "grams": 25.5,
  "base_fee_per_gram": 100.0,
  "net_fee_per_gram": 95.0,
  "total_base_fee": 2550.0,
  "total_net_fee": 2422.5,
  "discount_percentage": 5.0,
  "total_discount_amount": 127.5,
  "notes": "High quality gold"
}
```

**Validation Rules:**
- `receipt_date` must be in YYYY-MM-DD format
- `grams` must be > 0
- All fee fields must be >= 0
- `discount_percentage` must be 0-100
- `karat_type` must be "18" or "21"
- `purchase_id` and `supplier_id` must exist

### PUT /api/purchase-receipts/:id
**Update purchase receipt**

### DELETE /api/purchase-receipts/:id
**Delete purchase receipt**

---

## Payments API

### GET /api/payments
**Get all payments**

**Query Parameters:**
- `purchase_id` (optional) - Filter by purchase
- `karat_type` (optional) - `"18"` or `"21"`

### GET /api/payments/:id
**Get payment by ID**

### GET /api/payments/purchase/:purchase_id
**Get all payments for a specific purchase**

### POST /api/payments
**Create new payment**

**Required Fields:**
- `id` (string, max 50 chars) - Unique payment ID
- `purchase_id` (string) - Must exist in purchases table
- `date` (string) - Date in YYYY-MM-DD format
- `grams_paid` (number) - Must be > 0
- `fees_paid` (number) - Must be > 0
- `karat_type` (string) - `"18"` or `"21"`

**Optional Fields:**
- `note` (string) - Payment notes

**Request Body:**
```json
{
  "id": "payment-001",
  "purchase_id": "purchase-001",
  "date": "2025-09-22",
  "grams_paid": 25.0,
  "fees_paid": 2375.0,
  "karat_type": "21",
  "note": "Partial payment"
}
```

**Validation Rules:**
- `date` must be in YYYY-MM-DD format
- `grams_paid` and `fees_paid` must be > 0
- `karat_type` must be "18" or "21"
- `purchase_id` must exist

### PUT /api/payments/:id
**Update payment**

### DELETE /api/payments/:id
**Delete payment**

---

## Example Usage in React Native/Expo

```javascript
// Example: Create a purchase
const createPurchase = async () => {
  try {
    const response = await fetch('http://10.152.9.172:3000/api/purchases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: 'purchase-' + Date.now(),
        store_id: 'store-001',
        date: '2025-09-22'
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Purchase created:', result.data);
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Example: Get all suppliers
const getSuppliers = async () => {
  try {
    const response = await fetch('http://10.152.9.172:3000/api/suppliers?is_active=true');
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
  } catch (error) {
    console.error('Error fetching suppliers:', error);
  }
};
```

---

## Important Notes

1. **Date Format**: All dates must be in `YYYY-MM-DD` format
2. **Unique IDs**: All `id` fields must be unique across their respective tables
3. **Foreign Keys**: When referencing other entities (store_id, supplier_id, purchase_id), the referenced record must exist
4. **Numeric Validation**: 
   - Grams must be > 0
   - Fees must be >= 0
   - Discount percentages must be 0-100
5. **Karat Types**: Only "18" and "21" are allowed
6. **Status Values**: Purchase status must be one of: "Paid", "Pending", "Partial", "Overdue"
7. **Code Format**: Supplier and store codes must be 3-10 uppercase letters/numbers only

---

## Available Reference Data

**Stores:**
- `1758406458499` (Osama)
- `store-001` (Downtown Gold Store)
- `store-002` (Mall Jewelry Shop)
- `store-003` (Plaza Gold Center)

**Suppliers:**
- `1` (Eg21)
- `2` (Premium Gold Co)
- `3` (Elite Jewelry Supply)
- `4` (Royal Gold Traders)
- `1758406738830` (Osl)
