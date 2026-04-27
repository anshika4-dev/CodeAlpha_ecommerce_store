const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getDb } = require('../database');

const JWT_SECRET = 'pink_paradise_secret_key_2024';

// Middleware to verify token
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    req.userId = decoded.userId;
    next();
  });
}

// Get user's orders
router.get('/', verifyToken, (req, res) => {
  const db = getDb();
  const sql = `
    SELECT orders.*, 
           GROUP_CONCAT(
             json_object('productId', order_items.product_id, 'quantity', order_items.quantity, 'price', order_items.price)
           ) as items
    FROM orders
    LEFT JOIN order_items ON orders.id = order_items.order_id
    WHERE orders.user_id = ?
    GROUP BY orders.id
    ORDER BY orders.created_at DESC
  `;
  db.all(sql, [req.userId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const orders = rows.map(row => ({
      ...row,
      items: row.items ? JSON.parse(`[${row.items}]`) : []
    }));
    res.json({ orders });
  });
});

// Create new order from cart
router.post('/', verifyToken, (req, res) => {
  const db = getDb();

  // Get cart items
  const cartSql = `
    SELECT cart.*, products.price
    FROM cart
    JOIN products ON cart.product_id = products.id
    WHERE cart.user_id = ?
  `;

  db.all(cartSql, [req.userId], (err, cartItems) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (cartItems.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order
    db.run(
      'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)',
      [req.userId, total, 'pending'],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        const orderId = this.lastID;

        // Add order items
        const itemStmt = db.prepare(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
        );

        cartItems.forEach(item => {
          itemStmt.run(orderId, item.product_id, item.quantity, item.price);
        });

        itemStmt.finalize((err) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }

          // Clear cart
          db.run('DELETE FROM cart WHERE user_id = ?', [req.userId], (err) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }

            res.json({
              message: 'Order created successfully',
              orderId,
              total
            });
          });
        });
      }
    );
  });
});

// Get single order details
router.get('/:id', verifyToken, (req, res) => {
  const db = getDb();
  const sql = `
    SELECT orders.*, order_items.*, products.name, products.image
    FROM orders
    JOIN order_items ON orders.id = order_items.order_id
    JOIN products ON order_items.product_id = products.id
    WHERE orders.id = ? AND orders.user_id = ?
  `;
  db.all(sql, [req.params.id, req.userId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (rows.length === 0) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const order = {
      id: rows[0].id,
      user_id: rows[0].user_id,
      total: rows[0].total,
      status: rows[0].status,
      created_at: rows[0].created_at,
      items: rows.map(row => ({
        product_id: row.product_id,
        name: row.name,
        image: row.image,
        quantity: row.quantity,
        price: row.price
      }))
    };

    res.json({ order });
  });
});

// Update order status (admin)
router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  const db = getDb();
  const sql = 'UPDATE orders SET status = ? WHERE id = ?';
  db.run(sql, [status, req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Order status updated', changes: this.changes });
  });
});

module.exports = router;
