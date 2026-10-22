const { insertEvento } = require('../db/mongo/mongo');

function ipDe(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || '0.0.0.0';
}

function idUsuarioDe(req) {
  if (req.usuario && req.usuario.id != null) return String(req.usuario.id);
  return 'anonimo';
}

function describirCuerpo(req) {
  const body = req.body && typeof req.body === 'object' ? req.body : null;
  if (!body) return '';
  const partes = [];
  for (const [campo, valor] of Object.entries(body)) {
    if (campo === 'password' || campo === 'passwordHash') continue;
    if (valor === undefined || valor === null || valor === '') continue;
    const texto = typeof valor === 'object' ? JSON.stringify(valor) : String(valor);
    partes.push(`${campo}: ${texto}`);
  }
  return partes.join('; ');
}

function detalleExitoso(req, status) {
  const mensajes = {
    200: 'Operación correcta',
    201: 'Recurso creado'
  };
  const cuerpo = describirCuerpo(req);
  return {
    mensaje: mensajes[status] || 'Operación correcta',
    descripcion: cuerpo || `${req.method} ${req.originalUrl}`
  };
}

function requestLogger(req, res, next) {
  res.on('finish', () => {
    const detalle = res.locals.detalleLog || detalleExitoso(req, res.statusCode);
    const cuerpo = describirCuerpo(req);
    let descripcion = detalle.descripcion || '';
    if (res.statusCode >= 400 && cuerpo && !descripcion.includes(cuerpo)) {
      descripcion = descripcion ? `${descripcion}. ${cuerpo}` : cuerpo;
    }
    insertEvento({
      accion: 'Peticion HTTP',
      statusCode: res.statusCode,
      IP: ipDe(req),
      id_usuario: idUsuarioDe(req),
      metodo: req.method,
      ruta: req.originalUrl,
      fecha_ejecucion: new Date(),
      mensaje: detalle.mensaje,
      descripcion
    });
  });
  next();
}

module.exports = { requestLogger };
