const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'pinkparadise.db');
let db;

function init() {
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to SQLite database');
      createTables();
    }
  });
}

function createTables() {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT,
      category TEXT,
      stock INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Cart table
  db.run(`
    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      product_id INTEGER,
      quantity INTEGER DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Order items table
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      product_id INTEGER,
      quantity INTEGER,
      price REAL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Insert sample products
  insertSampleProducts();
}

function insertSampleProducts() {
  const products = [
    { name: 'Elegant Pink Dress', description: 'Beautiful pink dress for special occasions', price: 89.99, image: 'assets/img/new1.png', category: 'Dresses', stock: 50 },
    { name: 'Rose Gold Watch', description: 'Elegant rose gold watch with pink strap', price: 129.99, image: 'assets/img/new2.png', category: 'Accessories', stock: 30 },
    { name: 'Floral Handbag', description: 'Stylish floral print handbag', price: 59.99, image: 'assets/img/new3.png', category: 'Accessories', stock: 40 },
    { name: 'Pearl Necklace', description: 'Elegant pearl necklace set', price: 79.99, image: 'assets/img/new4.png', category: 'Jewelry', stock: 25 },
    { name: 'Pink Blouse', description: 'Comfortable pink blouse', price: 49.99, image: 'assets/img/new5.png', category: 'Tops', stock: 60 },
    { name: 'Rose Earrings', description: 'Beautiful rose gold earrings', price: 69.99, image: 'assets/img/new6.png', category: 'Jewelry', stock: 35 },
    { name: 'Summer Dress Collection', description: 'Light and breezy summer dresses', price: 29.99, image: 'assets/img/feature1.png', category: 'Dresses', stock: 100 },
    { name: 'Pink Accessories Set', description: 'Complete accessories set', price: 9.99, image: 'assets/img/feature2.png', category: 'Accessories', stock: 80 },
    { name: 'Beauty Kit', description: 'Complete beauty essentials', price: 14.99, image: 'assets/img/feature3.png', category: 'Beauty', stock: 70 },
    { name: 'Comfortable Pink Shoes', description: 'Stylish and comfortable shoes', price: 39.99, image: 'assets/img/feature4.png', category: 'Shoes', stock: 45 }
  ];

  const checkProducts = `SELECT COUNT(*) as count FROM products`;
  db.get(checkProducts, (err, row) => {
    if (err) {
      console.error('Error checking products:', err.message);
      return;
    }
    if (row.count === 0) {
      const stmt = db.prepare(`
        INSERT INTO products (name, description, price, image, category, stock)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      products.forEach(product => {
        stmt.run(product.name, product.description, product.price, product.image, product.category, product.stock);
      });
      stmt.finalize();
      console.log('Sample products inserted');
    }
  });
}

function getDb() {
  return db;
}

module.exports = { init, getDb };
