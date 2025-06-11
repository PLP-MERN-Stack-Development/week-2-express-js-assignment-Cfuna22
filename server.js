const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const productRoutes = require('./routes/products');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: JSON body parsing
app.use(logger);
app.use(bodyParser.json());

// Custom middleware: Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Custom middleware: API key auth
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== 'my-secret-key') {
    return res.status(401).json({ error: 'Unauthorized. Missing or invalid API key.' });
  }
  next();
});

// In-memory database
let products = [
  { id: '1', name: 'Laptop', description: 'High-performance laptop', price: 1200, category: 'electronics', inStock: true },
  { id: '2', name: 'Smartphone', description: 'Latest model', price: 800, category: 'electronics', inStock: true },
  { id: '3', name: 'Coffee Maker', description: 'Programmable with timer', price: 50, category: 'kitchen', inStock: false },
];


// Routes
app.use('/api/products', productRoutes);


// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Go to /api/products to see all products.');
});

// GET all products (with optional category filter & pagination)
app.get('/api/products', (req, res) => {
  let result = [...products];

  if (req.query.category) {
    result = result.filter(p => p.category === req.query.category);
  }

  if (req.query.search) {
    const term = req.query.search.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(term));
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const start = (page - 1) * limit;

  res.json({
    total: result.length,
    page,
    limit,
    products: result.slice(start, start + limit),
  });
});

// GET product by ID
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// POST create new product
app.post('/api/products', (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  if (!name || !description || typeof price !== 'number' || !category || typeof inStock !== 'boolean') {
    return res.status(400).json({ error: 'Invalid product data' });
  }

  const newProduct = { id: uuidv4(), name, description, price, category, inStock };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT update product
app.put('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  const { name, description, price, category, inStock } = req.body;
  if (!name || !description || typeof price !== 'number' || !category || typeof inStock !== 'boolean') {
    return res.status(400).json({ error: 'Invalid product data' });
  }

  products[index] = { ...products[index], name, description, price, category, inStock };
  res.json(products[index]);
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  products.splice(index, 1);
  res.status(204).send();
});

// GET product statistics
app.get('/api/products/stats/category-count', (req, res) => {
  const counts = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});
  res.json(counts);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if(!product) return res.status(401).json({ error: 'Product not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unexpected error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
