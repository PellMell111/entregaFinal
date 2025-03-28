const productManager = require('../managers/productManager');
const { io } = require('../app');

const getProducts = (req, res) => {
    try {
        const products = productManager.getProducts();
        res.json({ status: 'success', data: products });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const getProductById = (req, res) => {
    try {
        const product = productManager.getProductById(Number(req.params.pid));
        res.json({ status: 'success', data: product });
    } catch (error) {
        res.status(404).json({ status: 'error', message: error.message });
    }
};

const addProduct = (req, res) => {
    try {
        const { title, description, code, price, stock, category, thumbnails } = req.body;
        
        if (!title || !description || !code || !price || !stock || !category) {
            throw new Error('Todos los campos son requeridos');
        }

        const newProduct = {
            title,
            description,
            code,
            price: Number(price),
            stock: Number(stock),
            category,
            thumbnails: thumbnails || []
        };

        const createdProduct = productManager.addProduct(newProduct);
        
        io.emit('productAdded', createdProduct);
        io.emit('updateProducts', productManager.getProducts());
        
        res.status(201).json({ status: 'success', data: createdProduct });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

const updateProduct = (req, res) => {
    try {
        const updatedProduct = productManager.updateProduct(
            Number(req.params.pid),
            req.body
        );
        
        io.emit('productUpdated', updatedProduct);
        io.emit('updateProducts', productManager.getProducts());
        
        res.json({ status: 'success', data: updatedProduct });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

const deleteProduct = (req, res) => {
    try {
        const deletedId = Number(req.params.pid);
        productManager.deleteProduct(deletedId);
        
        io.emit('productDeleted', deletedId);
        io.emit('updateProducts', productManager.getProducts());
        
        res.json({ status: 'success', message: `Producto ${deletedId} eliminado` });
    } catch (error) {
        res.status(404).json({ status: 'error', message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct
};