const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

// Get all products
router.get('/', (req, res) => {
  const db = getDb();
  const sql = 'SELECT * FROM products ORDER BY id DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ products: rows });
  });
});

// Get single product
router.get('/:id', (req, res) => {
  const db = getDb();
  const sql = 'SELECT * FROM products WHERE id = ?';
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({ product: row });
  });
});

// Get products by category
router.get('/category/:category', (req, res) => {
  const db = getDb();
  const sql = 'SELECT * FROM products WHERE category = ?';
  db.all(sql, [req.params.category], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ products: rows });
  });
});

// Add new product (admin)
router.post('/', (req, res) => {
  const { name, description, price, image, category, stock } = req.body;
  const db = getDb();
  const sql = `
    INSERT INTO products (name, description, price, image, category, stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.run(sql, [name, description, price, image, category, stock], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Product created',
      productId: this.lastID
    });
  });
});

// Update product
router.put('/:id', (req, res) => {
  const { name, description, price, image, category, stock } = req.body;
  const db = getDb();
  const sql = `
    UPDATE products
    SET name = ?, description = ?, price = ?, image = ?, category = ?, stock = ?
    WHERE id = ?
  `;
  db.run(sql, [name, description, price, image, category, stock, req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Product updated', changes: this.changes });
  });
});

// Delete product
router.delete('/:id', (req, res) => {
  const db = getDb();
  const sql = 'DELETE FROM products WHERE id = ?';
  db.run(sql, [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Product deleted', changes: this.changes });
  });
});

module.exports = router;
