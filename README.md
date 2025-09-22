# Receipt Tracker API

A Node.js Express API for managing purchases, suppliers, and payments in a receipt tracking system.

## Features

- **Stores Management**: Manage different store locations
- **MySQL Database**: Robust database with proper indexing and relationships
- **RESTful API**: Clean and consistent API endpoints
- **Error Handling**: Comprehensive error handling and validation
- **Security**: Helmet for security headers, CORS enabled

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd receipt-tracker-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=receipt_tracker
   PORT=3000
   NODE_ENV=development
   ```

4. **Set up MySQL database**
   - Create a MySQL database named `receipt_tracker`
   - Make sure your MySQL user has the necessary permissions

5. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Health Check
- `GET /api/health` - Check if the API is running

### Stores
- `GET /api/stores` - Get all stores
- `GET /api/stores/:id` - Get store by ID
- `POST /api/stores` - Create new store
- `PUT /api/stores/:id` - Update store
- `DELETE /api/stores/:id` - Delete store

## Example Usage

### Create a Store
```bash
curl -X POST http://localhost:3000/api/stores \
  -H "Content-Type: application/json" \
  -d '{
    "id": "1",
    "name": "Main Store - Downtown",
    "code": "MSD",
    "is_active": true,
    "progress_bar_config": {
      "blue": 15,
      "yellow": 5,
      "orange": 5,
      "red": 5
    }
  }'
```

### Get All Stores
```bash
curl http://localhost:3000/api/stores
```

## Database Schema

### Stores Table
```sql
CREATE TABLE stores (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    progress_bar_config JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Project Structure

```
receipt-tracker-api/
├── config/
│   └── database.js          # Database configuration and connection
├── controllers/
│   └── storesController.js  # Store-related business logic
├── routes/
│   └── stores.js           # Store routes
├── server.js               # Main server file
├── package.json            # Dependencies and scripts
├── env.example            # Environment variables template
└── README.md              # This file
```

## Development

The project follows separation of concerns:
- **Routes**: Handle HTTP requests and responses
- **Controllers**: Contain business logic
- **Config**: Database and application configuration
- **Models**: Database models (to be added)

## Next Steps

This is the initial setup with the Stores table. Future implementations will include:
- Suppliers table and API
- Discount tiers table and API
- Purchases table and API
- Receipts table and API
- Payments table and API

## Testing

Test the API using the health check endpoint:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Receipt Tracker API is running",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```


