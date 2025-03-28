const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');

router.get('/', productsController.getProducts);

router.get('/:pid', 
  (req, res, next) => {
    if (isNaN(req.params.pid)) {
      return res.status(400).json({ status: 'error', message: 'ID debe ser numérico' });
    }
    next();
  }, 
  productsController.getProductById
);

router.post('/',
  express.json(),
  productsController.addProduct
);

router.put('/:pid',
  express.json(),
  (req, res, next) => {
    if (isNaN(req.params.pid)) {
      return res.status(400).json({ status: 'error', message: 'ID debe ser numérico' });
    }
    next();
  },
  productsController.updateProduct
);

router.delete('/:pid',
  (req, res, next) => {
    if (isNaN(req.params.pid)) {
      return res.status(400).json({ status: 'error', message: 'ID debe ser numérico' });
    }
    next();
  },
  productsController.deleteProduct
);

module.exports = router;