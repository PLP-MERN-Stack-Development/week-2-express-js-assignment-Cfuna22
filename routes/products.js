const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const authenticate = require('../middleware/auth');
const validateProduct = require('../middleware/validateProduct');

let products = [
    { id: '1', name: 'Laptop', description: 'High-performance laptop', price: 1200, category: 'electronics', inStock: true },
    { id: '2', name: 'Smartphone', description: 'Latest model', price: 800, category: 'electronics', inStock: true },
    { id: '3', name: 'Coffee Maker', description: 'With timer', price: 50, category: 'kitchen', inStock: false }
];

router.get('/', (req, res) => {
    let result = [...products];
    const { category, page = 1, limit = 10 } = req.query;

    if (category) result = result.filter(p => p.category === category);

    const start = (page - 1) * limit;
    const end = start + parseInt(limit);
    res.json(result.slice(start, end));
});

router.get('/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
});

router.post('/', authenticate, validateProduct, (req, res) => {
    const newProduct = { id: uuidv4(), ...req.body };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

router.put('/:id', authenticate, validateProduct, (req, res) => {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Product not found' });
    products[index] = { ...products[index], ...req.body };
    res.json(products[index]);
});

router.delete('/:id', authenticate, (req, res) => {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Product not found' });
    const deleted = products.splice(index, 1);
    res.json(deleted[0]);
});

router.get('/search/q', (req, res) => {
    const { q } = req.query;
    const result = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
    res.json(result);
});

router.get('/stats/summary', (req, res) => {
    const stats = {};
    products.forEach(p => {
        stats[p.category] = (stats[p.category] || 0) + 1;
    });
    res.json(stats);
});

module.exports = router;


