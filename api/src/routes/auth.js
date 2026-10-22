const express = require('express');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { validate, loginSchema, usuarioSchema } = require('../middlewares/validate');
const auth = require('../controllers/authController');

const router = express.Router();

router.post('/login', validate(loginSchema()), asyncHandler(auth.login));
router.post('/registro', validate(usuarioSchema()), asyncHandler(auth.registro));

module.exports = router;
