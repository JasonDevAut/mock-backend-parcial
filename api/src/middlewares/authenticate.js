const { AppError } = require('../lib/http');
const { verificar } = require('../lib/token');
const usuariosQuery = require('../db/SQL/queries/usuarios');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    next(new AppError(401, 'No autenticado'));
    return;
  }

  let sesion;
  try {
    sesion = verificar(token);
  } catch (error) {
    next(new AppError(401, 'No autenticado'));
    return;
  }

  usuariosQuery.obtener(sesion.id).then((row) => {
    if (!row) {
      next(new AppError(401, 'No autenticado'));
      return;
    }
    if (!row.Activo) {
      next(new AppError(403, 'El usuario no está activo'));
      return;
    }
    req.usuario = {
      id: row.UsuarioId,
      email: row.Email,
      perfil: row.Perfil
    };
    next();
  }).catch(next);
}

module.exports = { authenticate };
