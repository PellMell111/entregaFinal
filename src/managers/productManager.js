const Product = require('../models/productModel.js');

class ProductManager {
    async addProduct(product) {
        const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
        const missingFields = requiredFields.filter(field => !product[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`Faltan campos obligatorios: ${missingFields.join(', ')}`);
        }

        const newProduct = new Product({
            ...product,
            status: product.status !== false,
            thumbnails: product.thumbnails || []
        });

        await newProduct.save();

        return newProduct;
    }

    async getProducts() {
        return await Product.find();
    }

    async getProductById(productId) {
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Producto no encontrado');
        }
        return product;
    }

    async updateProduct(productId, updatedFields) {
        const product = await Product.findByIdAndUpdate(productId, updatedFields, { new: true });
        if (!product) {
            throw new Error('Producto no encontrado');
        }
        return product;
    }

    async deleteProduct(productId) {
        const result = await Product.findByIdAndDelete(productId);
        if (!result) {
            throw new Error('Producto no encontrado');
        }
        return result;
    }
}

module.exports = new ProductManager();
