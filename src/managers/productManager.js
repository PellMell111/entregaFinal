const fs = require('fs');
const path = require('path');

class ProductManager {
    constructor() {
        this.products = [];
        this.path = path.join(__dirname, '..', 'data', 'products.json');
        this.loadData();
    }

    loadData() {
        try {
            const data = fs.readFileSync(this.path, 'utf8');
            this.products = JSON.parse(data) || [];
        } catch (error) {
            console.error('Error al cargar productos:', error);
            this.products = [];
        }
    }

    saveData() {
        try {
            fs.writeFileSync(this.path, JSON.stringify(this.products, null, 2), 'utf8');
        } catch (error) {
            console.error('Error al guardar productos:', error);
            throw error;
        }
    }

    getProducts() {
        return [...this.products];
    }

    getProductById(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) throw new Error(`Producto con ID ${id} no encontrado`);
        return product;
    }

    addProduct(product) {
        const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
        const missingFields = requiredFields.filter(field => !product[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`Faltan campos obligatorios: ${missingFields.join(', ')}`);
        }

        const newId = this.products.length > 0 
            ? Math.max(...this.products.map(p => p.id)) + 1 
            : 1;
        
        const newProduct = {
            ...product,
            id: newId,
            status: product.status !== false,
            thumbnails: product.thumbnails || []
        };

        this.products.push(newProduct);
        this.saveData();
        return newProduct;
    }

    updateProduct(id, updatedFields) {
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) throw new Error(`Producto con ID ${id} no encontrado`);

        this.products[index] = {
            ...this.products[index],
            ...updatedFields,
            id
        };

        this.saveData();
        return this.products[index];
    }

    deleteProduct(id) {
        const initialLength = this.products.length;
        this.products = this.products.filter(p => p.id !== id);
        
        if (this.products.length === initialLength) {
            throw new Error(`Producto con ID ${id} no encontrado`);
        }

        this.saveData();
        return true;
    }
}

module.exports = new ProductManager();