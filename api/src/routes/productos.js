const express = require('express');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { validate, productoSchema } = require('../middlewares/validate');
const { authorize } = require('../middlewares/authorize');
const productos = require('../controllers/productosController');

const router = express.Router();

router.post('/', authorize('Administrador'), validate(productoSchema()), asyncHandler(productos.crear));
router.get('/', asyncHandler(productos.listar));
router.get('/:id', asyncHandler(productos.obtener));
router.put('/:id', authorize('Administrador'), validate(productoSchema()), asyncHandler(productos.actualizar));
router.delete('/:id', authorize('Administrador'), asyncHandler(productos.desactivar));

module.exports = router;
