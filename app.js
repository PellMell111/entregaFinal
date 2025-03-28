const express = require('express');
const { engine } = require('express-handlebars');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const productManager = require('./src/managers/productManager');
const cartManager = require('./src/managers/cartManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.engine('handlebars', engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'src/views/layouts')
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src/views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('home', { 
        products: productManager.getProducts(),
        title: 'Home'
    });
});

app.get('/realtimeproducts', (req, res) => {
    res.render('realtimeProducts', {
        products: productManager.getProducts(),
        title: 'Productos en Tiempo Real'
    });
});

app.get('/carts/:cid', (req, res) => {
    try {
        const cart = cartManager.getCartById(parseInt(req.params.cid));
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

app.delete('/api/carts/:cid/products/:pid', (req, res) => {
    try {
        const cart = cartManager.removeProductFromCart(
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

    socket.on('addProduct', (product) => {
        try {
            const newProduct = productManager.addProduct(product);
            io.emit('updateProducts', productManager.getProducts());
        } catch (error) {
            socket.emit('error', error.message);
        }
    });

    socket.on('deleteProduct', (id) => {
        try {
            productManager.deleteProduct(id);
            io.emit('updateProducts', productManager.getProducts());
        } catch (error) {
            socket.emit('error', error.message);
        }
    });

    socket.on('addToCart', ({ cartId, productId }) => {
        try {
            const cart = cartManager.addProductToCart(cartId, productId, 1);
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