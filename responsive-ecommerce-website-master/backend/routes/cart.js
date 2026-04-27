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

// Get user's cart
router.get('/', verifyToken, (req, res) => {
  const db = getDb();
  const sql = `
    SELECT cart.*, products.name, products.price, products.image
    FROM cart
    JOIN products ON cart.product_id = products.id
    WHERE cart.user_id = ?
  `;
  db.all(sql, [req.userId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ cart: rows });
  });
});

// Add item to cart
router.post('/', verifyToken, (req, res) => {
  const { product_id, quantity } = req.body;
  const db = getDb();

  // Check if item already in cart
  db.get(
    'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
    [req.userId, product_id],
    (err, item) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (item) {
        // Update quantity
        const sql = 'UPDATE cart SET quantity = quantity + ? WHERE id = ?';
        db.run(sql, [quantity, item.id], function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({ message: 'Cart updated' });
        });
      } else {
        // Add new item
        const sql = 'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)';
        db.run(sql, [req.userId, product_id, quantity], function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({ message: 'Item added to cart', cartId: this.lastID });
        });
      }
    }
  );
});

// Update cart item quantity
router.put('/:id', verifyToken, (req, res) => {
  const { quantity } = req.body;
  const db = getDb();
  const sql = 'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?';
  db.run(sql, [quantity, req.params.id, req.userId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Cart item updated', changes: this.changes });
  });
});

// Remove item from cart
router.delete('/:id', verifyToken, (req, res) => {
  const db = getDb();
  const sql = 'DELETE FROM cart WHERE id = ? AND user_id = ?';
  db.run(sql, [req.params.id, req.userId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Item removed from cart', changes: this.changes });
  });
});

// Clear cart
router.delete('/', verifyToken, (req, res) => {
  const db = getDb();
  const sql = 'DELETE FROM cart WHERE user_id = ?';
  db.run(sql, [req.userId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Cart cleared', changes: this.changes });
  });
});

module.exports = router;
