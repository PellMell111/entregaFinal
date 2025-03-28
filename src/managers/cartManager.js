const fs = require('fs');
const path = require('path');

class CartManager {
    constructor() {
        this.carts = [];
        this.products = [];
        this.cartsDataFile = path.join(__dirname, '../data/carts.json');
        this.productsDataFile = path.join(__dirname, '../data/products.json');
        this.loadData();
    }

    loadData() {
        try {
            const cartsData = fs.readFileSync(this.cartsDataFile, 'utf8');
            this.carts = JSON.parse(cartsData) || [];
        } catch (error) {
            console.error('Error al cargar carritos:', error);
            this.carts = [];
        }

        try {
            const productsData = fs.readFileSync(this.productsDataFile, 'utf8');
            this.products = JSON.parse(productsData) || [];
        } catch (error) {
            console.error('Error al cargar productos:', error);
            this.products = [];
        }
    }

    saveData() {
        try {
            fs.writeFileSync(this.cartsDataFile, JSON.stringify(this.carts, null, 2), 'utf8');
        } catch (error) {
            console.error('Error al guardar carritos:', error);
            throw error;
        }
    }

    getCartById(id) {
        const cart = this.carts.find(cart => cart.id === id);
        if (!cart) throw new Error(`Carrito con ID ${id} no encontrado`);
        return cart;
    }

    createCart() {
        const newId = this.carts.length > 0 
            ? Math.max(...this.carts.map(c => c.id)) + 1 
            : 1;
        
        const newCart = {
            id: newId,
            products: []
        };
        
        this.carts.push(newCart);
        this.saveData();
        return newCart;
    }

    addProductToCart(cartId, productId, quantity = 1) {
        if (!this.products.some(p => p.id === productId)) {
            throw new Error(`Producto con ID ${productId} no existe`);
        }

        const cart = this.getCartById(cartId);
        const existingProduct = cart.products.find(p => p.id === productId);

        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            cart.products.push({ id: productId, quantity });
        }

        this.saveData();
        return cart;
    }

    removeProductFromCart(cartId, productId) {
        const cart = this.getCartById(cartId);
        const initialLength = cart.products.length;
        
        cart.products = cart.products.filter(p => p.id !== productId);
        
        if (cart.products.length === initialLength) {
            throw new Error(`Producto con ID ${productId} no encontrado en el carrito`);
        }

        this.saveData();
        return cart;
    }
}

module.exports = new CartManager();