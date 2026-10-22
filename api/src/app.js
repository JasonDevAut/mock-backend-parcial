const express = require('express');
const { requestLogger } = require('./middlewares/requestLogger');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const { authenticate } = require('./middlewares/authenticate');
const authRouter = require('./routes/auth');
const usuariosRouter = require('./routes/usuarios');
const productosRouter = require('./routes/productos');
const pedidosRouter = require('./routes/pedidos');

function createApp() {
  const app = express();
  app.use(requestLogger);
  app.use(express.json());

  app.get('/', (req, res) => {
    res.status(200).json({ nombre: 'cafeteria-campus' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/usuarios', authenticate, usuariosRouter);
  app.use('/api/productos', authenticate, productosRouter);
  app.use('/api/pedidos', authenticate, pedidosRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
