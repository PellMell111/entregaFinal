const express = require('express');
const { engine } = require('express-handlebars');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');

const productManager = require('./src/managers/productManager');
const cartManager = require('./src/managers/cartManager');
const productRoutes = require('./src/routes/products');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const MONGO_URI = "mongodb://127.0.0.1:27017/semillero-gorrion";

mongoose.connect(MONGO_URI)
  .then(() => console.log("🟢 Conectado a MongoDB"))
  .catch(err => console.error("🔴 Error al conectar con MongoDB:", err));

app.engine('handlebars', engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'src/views/layouts')
}));

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src/views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/products', productRoutes);

// Ruta para mostrar la lista de productos
app.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts(); // Esperamos a que se resuelvan los productos
        res.render('home', { 
            products: products,
            title: 'Home'
        });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});

// Ruta para mostrar los productos en tiempo real
app.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getProducts(); // Esperamos a que se resuelvan los productos
        res.render('realtimeProducts', {
            products: products,
            title: 'Productos en Tiempo Real'
        });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});

// Ruta para ver un carrito
app.get('/carts/:cid', async (req, res) => {
    try {
        const cart = await cartManager.getCartById(parseInt(req.params.cid));
        res.render('cart', { 
            cart,
            title: `Carrito ${req.params.cid}`
        });
    } catch (error) {
        res.status(404).render('error', { 
            message: error.message 
        });
    }
});

// Ruta para eliminar productos del carrito
app.delete('/api/carts/:cid/products/:pid', async (req, res) => {
    try {
        const cart = await cartManager.removeProductFromCart(
            parseInt(req.params.cid),
            parseInt(req.params.pid)
        );
        res.json({ success: true });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

io.on('connection', (socket) => {
    console.log('Cliente conectado');

    // Agregar un producto
    socket.on('addProduct', async (product) => {
        try {
            await productManager.addProduct(product);
            io.emit('updateProducts', await productManager.getProducts());
        } catch (error) {
            socket.emit('error', error.message);
        }
    });

    // Eliminar un producto
    socket.on('deleteProduct', async (id) => {
        try {
            await productManager.deleteProduct(id);
            io.emit('updateProducts', await productManager.getProducts());
        } catch (error) {
            socket.emit('error', error.message);
        }
    });

    // Agregar producto al carrito
    socket.on('addToCart', async ({ cartId, productId }) => {
        try {
            const cart = await cartManager.addProductToCart(cartId, productId, 1);
            io.emit('cartUpdated', cart);
            socket.emit('success', 'Producto agregado al carrito');
        } catch (error) {
            socket.emit('error', error.message);
        }
    });
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

module.exports = { app, server, io };
