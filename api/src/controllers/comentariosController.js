const { Int32 } = require('mongodb');
const pedidosQuery = require('../db/SQL/queries/pedidos');
const { getDb, insertEvento } = require('../db/mongo/mongo');
const { exigirDueno } = require('../middlewares/authorize');
const { AppError, parseId } = require('../lib/http');

function mapComentario(documento) {
  const pedidoId = documento.pedidoId && documento.pedidoId.valueOf
    ? documento.pedidoId.valueOf()
    : documento.pedidoId;
  return {
    id: documento._id.toString(),
    pedidoId,
    texto: documento.texto,
    fecha: new Date(documento.fecha).toISOString()
  };
}

async function pedidoDelUsuario(req, id) {
  const pedidoId = parseId(id);
  if (!pedidoId) throw new AppError(404, 'Pedido no encontrado');
  const pedido = await pedidosQuery.obtener(pedidoId);
  if (!pedido) throw new AppError(404, 'Pedido no encontrado');
  exigirDueno(req, pedido.UsuarioId);
  return pedidoId;
}

async function crear(req, res) {
  const pedidoId = await pedidoDelUsuario(req, req.params.id);

  const fecha = new Date();
  const documento = {
    pedidoId: new Int32(pedidoId),
    texto: req.body.texto.trim(),
    fecha
  };

  const resultado = await getDb().collection('comentarios').insertOne(documento);
  const comentarioId = resultado.insertedId.toString();

  await insertEvento({
    accion: 'Registro Comentario',
    statusCode: 201,
    IP: req.ip || req.socket?.remoteAddress || '0.0.0.0',
    id_usuario: String(req.usuario.id),
    metodo: req.method,
    ruta: req.originalUrl,
    fecha_ejecucion: new Date(),
    pedidoId,
    comentarioId,
    texto: documento.texto
  });

  res.status(201).json({
    id: comentarioId,
    pedidoId,
    texto: documento.texto,
    fecha: fecha.toISOString()
  });
}

async function listar(req, res) {
  const pedidoId = await pedidoDelUsuario(req, req.params.id);

  const documentos = await getDb()
    .collection('comentarios')
    .find({ pedidoId: new Int32(pedidoId) })
    .sort({ fecha: 1 })
    .toArray();

  res.status(200).json(documentos.map(mapComentario));
}

module.exports = { crear, listar };
