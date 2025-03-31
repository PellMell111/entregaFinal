const express = require('express');
const router = express.Router();
const { createCart, getCartById, addProductToCart, removeProductFromCart } = require('../controllers/cartsController');

router.post('/', (req, res) => {
    try {
        createCart(req, res);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.get('/:cid', 
  (req, res, next) => {
    if (isNaN(req.params.cid)) {
      return res.status(400).json({ status: 'error', message: 'ID de carrito debe ser numérico' });
    }
    next();
  },
  (req, res) => {
    try {
        getCartById(req, res);
    } catch (error) {
        res.status(404).json({ status: 'error', message: error.message });
    }
  }
);

router.post('/:cid/products/:pid', 
  (req, res, next) => {
    if (isNaN(req.params.cid) || isNaN(req.params.pid)) {
      return res.status(400).json({ status: 'error', message: 'ID de carrito y producto deben ser numéricos' });
    }
    next();
  },
  (req, res) => {
    try {
        addProductToCart(req, res);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
  }
);

router.delete('/:cid/products/:pid',
  (req, res, next) => {
    if (isNaN(req.params.cid) || isNaN(req.params.pid)) {
      return res.status(400).json({ status: 'error', message: 'ID de carrito y producto deben ser numéricos' });
    }
    next();
  },
  (req, res) => {
    try {
        removeProductFromCart(req, res);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
  }
);

module.exports = router;