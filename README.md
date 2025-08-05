# Ensabun Inventory Backend API

A Node.js Express backend specifically designed for the Ensabun soap inventory management system with MySQL database integration.

## Database Schema

The system uses the `ensabunn_inventory` database with the following tables:

### ProductType Table
- `productTypeID` (INT, PRIMARY KEY) - Unique identifier for product type
- `productType` (VARCHAR(45)) - Name of the product type (e.g., "Sabun")

### Product Table
- `productID` (INT, AUTO_INCREMENT, PRIMARY KEY) - Unique product identifier
- `productName` (VARCHAR(45)) - Name of the soap product
- `totalCost` (DOUBLE) - Total cost of the product
- `salePrice` (DOUBLE) - Selling price of the product
- `stockAmount` (INT) - Current stock quantity
- `productTypeID` (INT, FOREIGN KEY) - Reference to productType table

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
1. Import the provided schema:
```bash
mysql -u root -p < ensbn.sql
```

### 3. Environment Configuration
Update the `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=ensabunn_inventory
DB_PORT=3306
PORT=3000
```

### 4. Run the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## API Endpoints

### General Endpoints
- `GET /` - Server status
- `GET /health` - Database connection status

### Product Type Endpoints
- `GET /api/product-types` - Get all product types
- `GET /api/product-types/:id` - Get specific product type
- `POST /api/product-types` - Create new product type
- `PUT /api/product-types/:id` - Update product type
- `DELETE /api/product-types/:id` - Delete product type (only if no products use it)

### Product Endpoints
- `GET /api/products` - Get all products with product type info
- `GET /api/products/:id` - Get specific product with type info
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/search/:name` - Search products by name
- `GET /api/products/by-type/:typeId` - Get products by product type
- `GET /api/products/low-stock/:threshold?` - Get low stock products (default threshold: 10)

### Generic Endpoints (for flexibility)
- `GET /api/generic/:table` - Get all records from any table
- `GET /api/generic/:table/:id` - Get specific record from any table
- `GET /api/generic/:table/search/:field/:value` - Search any table

## API Usage Examples

### Get All Products
```bash
GET http://localhost:3000/api/products
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "productID": 1,
      "productName": "Biberiye Çayağacı Zeytinyağlı Sabun",
      "totalCost": 151,
      "salePrice": 173,
      "stockAmount": 32,
      "productTypeID": 1,
      "productType": "Sabun"
    }
  ],
  "count": 1
}
```

### Create New Product
```bash
POST http://localhost:3000/api/products
Content-Type: application/json

{
  "productName": "Lavanta Sabunu",
  "totalCost": 120,
  "salePrice": 150,
  "stockAmount": 50,
  "productTypeID": 1
}
```

### Update Product
```bash
PUT http://localhost:3000/api/products/1
Content-Type: application/json

{
  "stockAmount": 25,
  "salePrice": 180
}
```

### Search Products
```bash
GET http://localhost:3000/api/products/search/Biberiye
```

### Get Low Stock Products
```bash
GET http://localhost:3000/api/products/low-stock/20
```

### Create Product Type
```bash
POST http://localhost:3000/api/product-types
Content-Type: application/json

{
  "productTypeID": 2,
  "productType": "Şampuan"
}
```

## Features

✅ **Ensabun-specific endpoints** for products and product types  
✅ **Automatic foreign key validation** when creating/updating products  
✅ **JOIN queries** to include product type information with products  
✅ **Search functionality** by product name  
✅ **Low stock monitoring** with customizable thresholds  
✅ **Products by type filtering**  
✅ **Safe deletion** (prevents deleting product types that are in use)  
✅ **Comprehensive error handling**  
✅ **CORS support** for frontend integration  
✅ **Connection pooling** for better performance  

## Data Validation

- **Product creation**: Requires `productName` and valid `productTypeID`
- **Product type creation**: Requires `productTypeID` and `productType`
- **Foreign key validation**: Automatically checks if `productTypeID` exists
- **Safe deletion**: Prevents deletion of product types that have associated products

## Error Handling

All endpoints return standardized JSON responses:

**Success Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Current Sample Data

The database comes with sample data:
- Product Type: "Sabun" (ID: 1)
- Products:
  - "Biberiye Çayağacı Zeytinyağlı Sabun" (Cost: 151, Price: 173, Stock: 32)
  - "Altınotlu Sabun" (Cost: 124, Price: 145, Stock: 23)

## Development Notes

- The server uses nodemon for development auto-restart
- CORS is configured for common frontend development ports
- All database operations use prepared statements for security
- Connection pooling is implemented for better performance
- Turkish character support is enabled in the database schema
