const Cart = require('../models/cartModel.js');
const Product = require('../models/productModel.js');

class CartManager {
    async getCartById(id) {
        try {
            const cart = await Cart.findById(id).populate('products.productId');
            if (!cart) throw new Error(`Carrito con ID ${id} no encontrado`);
            return cart;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async createCart() {
        try {
            const newCart = new Cart({
                products: []
            });
            await newCart.save();
            return newCart;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) throw new Error(`Carrito con ID ${cartId} no encontrado`);

            const product = await Product.findById(productId);
            if (!product) throw new Error(`Producto con ID ${productId} no existe`);

            const existingProduct = cart.products.find(p => p.productId.toString() === productId);
            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                cart.products.push({ productId, quantity });
            }

            await cart.save();
            return cart;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) throw new Error(`Carrito con ID ${cartId} no encontrado`);

            const initialLength = cart.products.length;
            cart.products = cart.products.filter(p => p.productId.toString() !== productId);

            if (cart.products.length === initialLength) {
                throw new Error(`Producto con ID ${productId} no encontrado en el carrito`);
            }

            await cart.save();
            return cart;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = new CartManager();
