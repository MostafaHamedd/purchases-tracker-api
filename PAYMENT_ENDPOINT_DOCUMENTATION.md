# Payment Endpoint Documentation

## POST /api/payments - Create Payment

### Request Body (JSON)

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | string | ✅ Yes | Unique payment ID (max 50 chars) | Must be unique |
| `purchase_id` | string | ✅ Yes | ID of the purchase being paid for | Must exist in purchases table |
| `date` | string | ✅ Yes | Payment date | Format: YYYY-MM-DD |
| `grams_paid` | number | ✅ Yes | Amount of grams paid | Must be >= 0, at least one of grams_paid or fees_paid must be > 0 |
| `fees_paid` | number | ✅ Yes | Amount of fees paid | Must be >= 0, at least one of grams_paid or fees_paid must be > 0 |
| `karat_type` | string | ✅ Yes | Type of gold karat | Must be "18" or "21" |
| `note` | string | ❌ Optional | Additional payment notes | Can be null/empty |

### Example Request Bodies

#### Payment with both grams and fees
```json
{
  "id": "payment-001",
  "purchase_id": "1758583352736",
  "date": "2025-09-22",
  "grams_paid": 25.5,
  "fees_paid": 2375.0,
  "karat_type": "21",
  "note": "Full payment for gold purchase"
}
```

#### Payment for fees only (grams = 0)
```json
{
  "id": "payment-002",
  "purchase_id": "1758583352736",
  "date": "2025-09-22",
  "grams_paid": 0,
  "fees_paid": 1500.0,
  "karat_type": "21",
  "note": "Fees payment only"
}
```

#### Payment for grams only (fees = 0)
```json
{
  "id": "payment-003",
  "purchase_id": "1758583352736",
  "date": "2025-09-22",
  "grams_paid": 15.0,
  "fees_paid": 0,
  "karat_type": "18",
  "note": "Grams payment only"
}
```

### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "id": "payment-001",
    "purchase_id": "1758583352736",
    "date": "2025-09-22",
    "grams_paid": 25.5,
    "fees_paid": 2375.0,
    "karat_type": "21",
    "note": "Partial payment for gold purchase"
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Required Fields

```json
{
  "success": false,
  "error": "Missing required fields",
  "missingFields": ["id", "purchase_id", "date", "grams_paid", "fees_paid", "karat_type"],
  "receivedData": {
    "id": "payment-001",
    "purchase_id": "1758583352736"
  },
  "required": ["id", "purchase_id", "date", "grams_paid", "fees_paid", "karat_type"]
}
```

#### 400 Bad Request - Negative Amounts

```json
{
  "success": false,
  "error": "Invalid amounts",
  "message": "Grams paid and fees paid cannot be negative.",
  "receivedData": {
    "grams_paid": -10,
    "fees_paid": 100
  }
}
```

#### 400 Bad Request - Both Amounts Zero

```json
{
  "success": false,
  "error": "Invalid amounts",
  "message": "At least one of grams_paid or fees_paid must be greater than 0.",
  "receivedData": {
    "grams_paid": 0,
    "fees_paid": 0
  }
}
```

#### 400 Bad Request - Invalid Date Format

```json
{
  "success": false,
  "error": "Invalid date format",
  "message": "Date must be in YYYY-MM-DD format.",
  "receivedData": {
    "date": "22-09-2025"
  }
}
```

#### 400 Bad Request - Invalid Karat Type

```json
{
  "success": false,
  "error": "Invalid karat type",
  "message": "Karat type must be one of: 18, 21.",
  "receivedData": {
    "karat_type": "24"
  }
}
```

#### 400 Bad Request - Purchase Not Found

```json
{
  "success": false,
  "error": "Purchase not found",
  "message": "Purchase with ID 'invalid-purchase-id' does not exist.",
  "receivedData": {
    "purchase_id": "invalid-purchase-id"
  }
}
```

#### 409 Conflict - Duplicate Payment ID

```json
{
  "success": false,
  "error": "Payment with this ID already exists"
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to create payment",
  "message": "Database error details"
}
```

## GET /api/payments - Get All Payments

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `purchase_id` | string | ❌ Optional | Filter payments by purchase ID |
| `karat_type` | string | ❌ Optional | Filter by karat type ("18" or "21") |

### Example Requests

```
GET /api/payments
GET /api/payments?purchase_id=1758583352736
GET /api/payments?karat_type=21
GET /api/payments?purchase_id=1758583352736&karat_type=21
```

### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "payment-001",
      "purchase_id": "1758583352736",
      "date": "2025-09-22",
      "grams_paid": 25.5,
      "fees_paid": 2375.0,
      "karat_type": "21",
      "note": "Partial payment for gold purchase",
      "created_at": "2025-09-22T23:30:00.000Z",
      "updated_at": "2025-09-22T23:30:00.000Z"
    }
  ],
  "count": 1
}
```

## GET /api/payments/:id - Get Payment by ID

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "payment-001",
    "purchase_id": "1758583352736",
    "date": "2025-09-22",
    "grams_paid": 25.5,
    "fees_paid": 2375.0,
    "karat_type": "21",
    "note": "Partial payment for gold purchase",
    "created_at": "2025-09-22T23:30:00.000Z",
    "updated_at": "2025-09-22T23:30:00.000Z"
  }
}
```

### Error Response (404 Not Found)

```json
{
  "success": false,
  "error": "Payment not found"
}
```

## GET /api/payments/purchase/:purchase_id - Get Payments for Purchase

### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "payment-001",
      "purchase_id": "1758583352736",
      "date": "2025-09-22",
      "grams_paid": 25.5,
      "fees_paid": 2375.0,
      "karat_type": "21",
      "note": "Partial payment",
      "created_at": "2025-09-22T23:30:00.000Z",
      "updated_at": "2025-09-22T23:30:00.000Z"
    },
    {
      "id": "payment-002",
      "purchase_id": "1758583352736",
      "date": "2025-09-23",
      "grams_paid": 15.0,
      "fees_paid": 1425.0,
      "karat_type": "21",
      "note": "Final payment",
      "created_at": "2025-09-23T10:15:00.000Z",
      "updated_at": "2025-09-23T10:15:00.000Z"
    }
  ],
  "count": 2
}
```

## PUT /api/payments/:id - Update Payment

### Request Body (JSON) - All fields optional

```json
{
  "purchase_id": "1758583352736",
  "date": "2025-09-22",
  "grams_paid": 30.0,
  "fees_paid": 2850.0,
  "karat_type": "21",
  "note": "Updated payment amount"
}
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Payment updated successfully",
  "affectedRows": 1
}
```

## DELETE /api/payments/:id - Delete Payment

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Payment deleted successfully",
  "affectedRows": 1
}
```

## Frontend Implementation Example

### React Native/Expo Example

```javascript
// Create Payment
const createPayment = async (paymentData) => {
  try {
    const response = await fetch('http://10.152.9.172:3000/api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: `payment-${Date.now()}`,
        purchase_id: paymentData.purchaseId,
        date: paymentData.date, // YYYY-MM-DD format
        grams_paid: paymentData.gramsPaid,
        fees_paid: paymentData.feesPaid,
        karat_type: paymentData.karatType, // "18" or "21"
        note: paymentData.note || null
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Payment created:', result.data);
      return result.data;
    } else {
      console.error('Payment creation failed:', result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
};

// Get Payments for Purchase
const getPaymentsForPurchase = async (purchaseId) => {
  try {
    const response = await fetch(`http://10.152.9.172:3000/api/payments/purchase/${purchaseId}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};
```

## Important Notes

1. **Date Format**: All dates must be in `YYYY-MM-DD` format
2. **Amounts**: 
   - `grams_paid` and `fees_paid` must be >= 0 (cannot be negative)
   - At least one of `grams_paid` or `fees_paid` must be > 0
   - You can pay for fees only (grams_paid = 0) or grams only (fees_paid = 0)
3. **Karat Types**: Only "18" and "21" are allowed
4. **Purchase ID**: Must reference an existing purchase
5. **Unique IDs**: Payment IDs must be unique across all payments
6. **Base URL**: Use `http://10.152.9.172:3000/api` for Expo Go app
