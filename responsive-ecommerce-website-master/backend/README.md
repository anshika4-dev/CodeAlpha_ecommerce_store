# Pink Paradise Backend

Express.js backend for Pink Paradise E-commerce Store with SQLite database.

## Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on http://localhost:3002

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:category` - Get products by category
- `POST /api/products` - Add new product (admin)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (requires token)

### Cart
- `GET /api/cart` - Get user's cart (requires token)
- `POST /api/cart` - Add item to cart (requires token)
- `PUT /api/cart/:id` - Update cart item (requires token)
- `DELETE /api/cart/:id` - Remove item from cart (requires token)
- `DELETE /api/cart` - Clear cart (requires token)

### Orders
- `GET /api/orders` - Get user's orders (requires token)
- `POST /api/orders` - Create new order from cart (requires token)
- `GET /api/orders/:id` - Get single order details (requires token)
- `PUT /api/orders/:id/status` - Update order status (admin)

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## Database

The SQLite database (`pinkparadise.db`) is automatically created with sample products on first run.
