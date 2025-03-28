const cartManager = require('../managers/cartManager');

const createCart = (req, res) => {
    const newCart = cartManager.addCart();
    res.status(201).json({ status: 'success', message: 'Carrito creado con éxito.', cart: newCart });
};

const getCartById = (req, res) => {
    const { cid } = req.params;
    const cart = cartManager.getCartById(Number(cid));
    if (!cart) {
        return res.status(404).json({ status: 'error', message: 'Carrito no encontrado.' });
    }
    res.json(cart.products);
};

const addProductToCart = (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ status: 'error', message: 'La propiedad "quantity" es requerida y debe ser un número positivo.' });
    }

    const cart = cartManager.addProductToCart(Number(cid), Number(pid), quantity);
    if (!cart) {
        return res.status(404).json({ status: 'error', message: 'Carrito o producto no encontrado.' });
    }

    res.status(201).json({ status: 'success', message: 'Producto agregado al carrito con éxito.' });
};

module.exports = {
    createCart,
    getCartById,
    addProductToCart
};