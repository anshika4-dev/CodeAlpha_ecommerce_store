const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static('../'));

// Initialize database
db.init();

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Pink Paradise API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Pink Paradise Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
