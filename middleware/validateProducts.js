module.exports = (req, res, next) => {
    const { name, price, description, category, inStock } = req.body;
    if (!name || typeof price !== 'number' || !description || !category || typeof inStock !== 'boolean') {
        return res.status(400).json({ error: 'Invalid product data' });
    }
    next();
};  