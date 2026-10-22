const express = require('express');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { validate, usuarioSchema } = require('../middlewares/validate');
const { authorize, selfOrAdmin } = require('../middlewares/authorize');
const usuarios = require('../controllers/usuariosController');

const router = express.Router();

router.post('/', authorize('Administrador'), validate(usuarioSchema()), asyncHandler(usuarios.crear));
router.get('/', authorize('Administrador'), asyncHandler(usuarios.listar));
router.get('/:id', selfOrAdmin, asyncHandler(usuarios.obtener));
router.put('/:id', selfOrAdmin, validate(usuarioSchema({ password: 'optional' })), asyncHandler(usuarios.actualizar));
router.delete('/:id', authorize('Administrador'), asyncHandler(usuarios.desactivar));

module.exports = router;
