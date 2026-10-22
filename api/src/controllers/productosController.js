const productosQuery = require('../db/SQL/queries/productos');
const productosCommand = require('../db/SQL/commands/productos');
const { AppError, parseId } = require('../lib/http');

function dinero(value) {
  return Number(value);
}

function mapProducto(row) {
  return {
    id: row.ProductoId,
    nombre: row.Nombre,
    precio: dinero(row.Precio),
    stock: row.Stock,
    descripcion: row.Descripcion,
    activo: Boolean(row.Activo),
    fechaActualizacion: row.FechaActualizacion ? new Date(row.FechaActualizacion).toISOString() : null
  };
}

function descripcionOrNull(value) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  return String(value).trim();
}

async function crear(req, res) {
  const row = await productosCommand.insertar({
    nombre: req.body.nombre.trim(),
    precio: req.body.precio,
    stock: req.body.stock,
    descripcion: descripcionOrNull(req.body.descripcion)
  });
  res.status(201).json(mapProducto(row));
}

async function listar(req, res) {
  const rows = await productosQuery.listar();
  res.status(200).json(rows.map(mapProducto));
}

async function obtener(req, res) {
  const id = parseId(req.params.id);
  if (!id) throw new AppError(404, 'Producto no encontrado');

  const row = await productosQuery.obtener(id);
  if (!row) throw new AppError(404, 'Producto no encontrado');
  res.status(200).json(mapProducto(row));
}

async function actualizar(req, res) {
  const id = parseId(req.params.id);
  if (!id) throw new AppError(404, 'Producto no encontrado');

  const row = await productosCommand.actualizar({
    id,
    nombre: req.body.nombre.trim(),
    precio: req.body.precio,
    stock: req.body.stock,
    descripcion: descripcionOrNull(req.body.descripcion)
  });
  if (!row) throw new AppError(404, 'Producto no encontrado');
  res.status(200).json(mapProducto(row));
}

async function desactivar(req, res) {
  const id = parseId(req.params.id);
  if (!id) throw new AppError(404, 'Producto no encontrado');

  const row = await productosCommand.desactivar(id);
  if (!row) throw new AppError(404, 'Producto no encontrado');
  res.status(200).json(mapProducto(row));
}

module.exports = { crear, listar, obtener, actualizar, desactivar, mapProducto };
