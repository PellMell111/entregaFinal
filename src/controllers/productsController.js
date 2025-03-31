const productManager = require('../managers/productManager.js');
const { io } = require('../../app');

const getProducts = async (req, res) => {
    try {
        console.log("Fetching products from DB...");
        const products = await productManager.getProducts();
        
        console.log("Products retrieved:", products);
        
        const processedProducts = products.map(p => ({
            ...p._doc,
            id: p._id.toString()
        }));
        
        console.log("Processed products:", processedProducts);
        
        res.render('home', { 
            products: processedProducts,
            title: 'Home'
        });
    } catch (error) {
        console.error("Error in getProducts:", error);
        res.status(500).render('error', { message: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await productManager.getProductById(req.params.pid);
        res.render('productDetail', {
            product: {
                ...product._doc,
                id: product._id.toString()
            },
            title: product.title
        });
    } catch (error) {
        res.status(404).render('error', { message: error.message });
    }
};

const addProduct = async (req, res) => {
    try {
        const { title, description, code, price, stock, category, thumbnails } = req.body;

        if (!title || !description || !code || !price || !stock || !category) {
            throw new Error('Todos los campos son requeridos');
        }

        const newProduct = await productManager.addProduct({
            title,
            description,
            code,
            price: Number(price),
            stock: Number(stock),
            category,
            thumbnails: thumbnails?.split(',') || []
        });

        io.emit('updateProducts', await productManager.getProducts());
        res.redirect('/realtimeproducts');

    } catch (error) {
        res.status(400).render('error', { message: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const updatedProduct = await productManager.updateProduct(
            req.params.pid,
            req.body
        );

        io.emit('updateProducts', await productManager.getProducts());
        res.redirect('/realtimeproducts');
    } catch (error) {
        res.status(400).render('error', { message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        await productManager.deleteProduct(req.params.pid);
        io.emit('updateProducts', await productManager.getProducts());
        res.redirect('/realtimeproducts');
    } catch (error) {
        res.status(404).render('error', { message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct
};