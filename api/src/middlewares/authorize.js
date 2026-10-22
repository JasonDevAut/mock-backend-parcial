const { AppError, parseId } = require('../lib/http');

function authorize(...perfiles) {
  return function authorizationMiddleware(req, res, next) {
    if (!req.usuario || !perfiles.includes(req.usuario.perfil)) {
      next(new AppError(403, 'No autorizado'));
      return;
    }
    next();
  };
}

function selfOrAdmin(req, res, next) {
  if (req.usuario && req.usuario.perfil === 'Administrador') {
    next();
    return;
  }
  const id = parseId(req.params.id);
  if (req.usuario && id === req.usuario.id) {
    next();
    return;
  }
  next(new AppError(403, 'No autorizado'));
}

function exigirDueno(req, usuarioId) {
  if (!req.usuario) throw new AppError(401, 'No autenticado');
  if (req.usuario.perfil === 'Administrador') return;
  if (Number(usuarioId) !== req.usuario.id) throw new AppError(403, 'No autorizado');
}

module.exports = { authorize, selfOrAdmin, exigirDueno };
