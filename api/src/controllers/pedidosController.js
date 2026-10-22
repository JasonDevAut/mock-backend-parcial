const pedidosQuery = require('../db/SQL/queries/pedidos');
const pedidosCommand = require('../db/SQL/commands/pedidos');
const { insertEvento } = require('../db/mongo/mongo');
const { exigirDueno } = require('../middlewares/authorize');
const { AppError, parseId } = require('../lib/http');

function mapPedido(row) {
  return {
    id: row.PedidoId,
    usuarioId: row.UsuarioId,
    productoId: row.ProductoId,
    cantidad: row.Cantidad,
    precioUnitario: Number(row.PrecioUnitario),
    estado: row.Estado,
    fechaActualizacion: row.FechaActualizacion ? new Date(row.FechaActualizacion).toISOString() : null
  };
}

const MENSAJES = {
  1: 'El usuario o el producto no existe',
  2: 'El usuario o el producto no está activo',
  3: 'No hay stock suficiente',
  4: 'La cantidad del pedido no es válida'
};

const ESTADOS = {
  1: 404,
  2: 409,
  3: 409,
  4: 400
};

function ipDe(req) {
  return req.ip || req.socket?.remoteAddress || '0.0.0.0';
}

async function registrar(req, res) {
  exigirDueno(req, req.body.usuarioId);
  const { codigo, pedidoId } = await pedidosCommand.registrar({
    usuarioId: req.body.usuarioId,
    productoId: req.body.productoId,
    cantidad: req.body.cantidad
  });

  if (codigo !== 0) {
    throw new AppError(ESTADOS[codigo] || 500, MENSAJES[codigo] || 'No se pudo registrar el pedido');
  }

  const creado = await pedidosQuery.obtener(pedidoId);

  await insertEvento({
    accion: 'Registro Pedido',
    statusCode: 201,
    IP: ipDe(req),
    id_usuario: String(req.usuario.id),
    metodo: req.method,
    ruta: req.originalUrl,
    fecha_ejecucion: new Date(),
    pedidoId
  });

  res.status(201).json(mapPedido(creado));
}

async function listar(req, res) {
  const productoId = req.query.productoId === undefined ? null : parseId(req.query.productoId);
  let usuarioId = req.query.usuarioId === undefined ? null : parseId(req.query.usuarioId);

  if (req.query.productoId !== undefined && !productoId) {
    throw new AppError(400, 'Datos inválidos', [
      { campo: 'productoId', mensaje: 'productoId debe ser un entero mayor que cero' }
    ]);
  }
  if (req.query.usuarioId !== undefined && !usuarioId) {
    throw new AppError(400, 'Datos inválidos', [
      { campo: 'usuarioId', mensaje: 'usuarioId debe ser un entero mayor que cero' }
    ]);
  }

  if (req.usuario.perfil !== 'Administrador') {
    if (usuarioId && usuarioId !== req.usuario.id) throw new AppError(403, 'No autorizado');
    usuarioId = req.usuario.id;
  }

  const rows = await pedidosQuery.listar({ productoId, usuarioId });
  res.status(200).json(rows.map(mapPedido));
}

async function obtener(req, res) {
  const id = parseId(req.params.id);
  if (!id) throw new AppError(404, 'Pedido no encontrado');

  const row = await pedidosQuery.obtener(id);
  if (!row) throw new AppError(404, 'Pedido no encontrado');
  exigirDueno(req, row.UsuarioId);
  res.status(200).json(mapPedido(row));
}

async function cancelar(req, res) {
  const id = parseId(req.params.id);
  if (!id) throw new AppError(404, 'Pedido no encontrado');

  const actual = await pedidosQuery.obtener(id);
  if (!actual) throw new AppError(404, 'Pedido no encontrado');
  exigirDueno(req, actual.UsuarioId);

  const { codigo, pedido } = await pedidosCommand.cancelar(id);
  if (codigo === 2) throw new AppError(409, 'El pedido ya está cancelado');
  if (codigo === 1 || !pedido) throw new AppError(404, 'Pedido no encontrado');
  res.status(200).json(mapPedido(pedido));
}

module.exports = { registrar, listar, obtener, cancelar };
