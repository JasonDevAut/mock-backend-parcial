const { AppError } = require('../lib/http');

function describirDetalles(detalles) {
  if (!Array.isArray(detalles) || detalles.length === 0) return '';
  return detalles.map((detalle) => `${detalle.campo}: ${detalle.mensaje}`).join('; ');
}

function notFoundHandler(req, res) {
  const mensaje = 'Ruta no encontrada';
  res.locals.detalleLog = {
    mensaje,
    descripcion: `${req.method} ${req.originalUrl}`
  };
  res.status(404).json({
    error: {
      mensaje,
      detalles: []
    }
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError) {
    const detalles = err.detalles || [];
    res.locals.detalleLog = {
      mensaje: err.mensaje,
      descripcion: describirDetalles(detalles) || err.mensaje
    };
    res.status(err.status).json({
      error: {
        mensaje: err.mensaje,
        detalles
      }
    });
    return;
  }

  const mensaje = err && err.message ? err.message : 'Error no identificado';
  const descripcion = err && err.stack ? err.stack : mensaje;
  console.error(mensaje);
  console.error(descripcion);
  res.locals.detalleLog = { mensaje, descripcion };

  res.status(500).json({
    error: {
      mensaje: 'Error interno del servidor',
      detalles: []
    }
  });
}

module.exports = { notFoundHandler, errorHandler };
