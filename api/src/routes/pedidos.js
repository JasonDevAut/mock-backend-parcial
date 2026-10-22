const express = require('express');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { validate, pedidoSchema, comentarioSchema } = require('../middlewares/validate');
const pedidos = require('../controllers/pedidosController');
const comentarios = require('../controllers/comentariosController');

const router = express.Router();

router.post('/', validate(pedidoSchema()), asyncHandler(pedidos.registrar));
router.get('/', asyncHandler(pedidos.listar));
router.get('/:id', asyncHandler(pedidos.obtener));
router.delete('/:id', asyncHandler(pedidos.cancelar));
router.post('/:id/comentarios', validate(comentarioSchema()), asyncHandler(comentarios.crear));
router.get('/:id/comentarios', asyncHandler(comentarios.listar));

module.exports = router;
