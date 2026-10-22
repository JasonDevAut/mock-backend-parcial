const bcrypt = require('bcryptjs');
const usuariosQuery = require('../db/SQL/queries/usuarios');
const usuariosCommand = require('../db/SQL/commands/usuarios');
const { mapUsuario, telefonoOrNull } = require('./authController');
const { AppError, parseId, isDuplicateKey } = require('../lib/http');

async function assertEmailDisponible(email, usuarioId) {
  const existente = await usuariosQuery.buscarPorEmail(email, usuarioId);
  if (existente) {
    throw new AppError(409, 'El correo ya está registrado', [
      { campo: 'email', mensaje: 'Ya existe un usuario con ese correo' }
    ]);
  }
}

async function hashOrNull(password) {
  if (password === undefined || password === null || String(password) === '') return null;
  return bcrypt.hash(password, 10);
}

async function crear(req, res) {
  const email = req.body.email.trim();
  await assertEmailDisponible(email, null);
  try {
    const row = await usuariosCommand.insertar({
      nombre: req.body.nombre.trim(),
      apellido: req.body.apellido.trim(),
      email,
      telefono: telefonoOrNull(req.body.telefono),
      passwordHash: await bcrypt.hash(req.body.password, 10),
      perfil: req.body.perfil || 'Cliente'
    });
    res.status(201).json(mapUsuario(row));
  } catch (error) {
    if (isDuplicateKey(error)) {
      throw new AppError(409, 'El correo ya está registrado', [
        { campo: 'email', mensaje: 'Ya existe un usuario con ese correo' }
      ]);
    }
    throw error;
  }
}

async function listar(req, res) {
  const rows = await usuariosQuery.listar();
  res.status(200).json(rows.map(mapUsuario));
}

async function obtener(req, res) {
  const id = parseId(req.params.id);
  if (!id) throw new AppError(404, 'Usuario no encontrado');

  const row = await usuariosQuery.obtener(id);
  if (!row) throw new AppError(404, 'Usuario no encontrado');
  res.status(200).json(mapUsuario(row));
}

async function actualizar(req, res) {
  const id = parseId(req.params.id);
  if (!id) throw new AppError(404, 'Usuario no encontrado');

  const email = req.body.email.trim();
  await assertEmailDisponible(email, id);
  try {
    const row = await usuariosCommand.actualizar({
      id,
      nombre: req.body.nombre.trim(),
      apellido: req.body.apellido.trim(),
      email,
      telefono: telefonoOrNull(req.body.telefono),
      passwordHash: await hashOrNull(req.body.password),
      perfil: req.usuario.perfil === 'Administrador' ? req.body.perfil || null : null
    });
    if (!row) throw new AppError(404, 'Usuario no encontrado');
    res.status(200).json(mapUsuario(row));
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (isDuplicateKey(error)) {
      throw new AppError(409, 'El correo ya está registrado', [
        { campo: 'email', mensaje: 'El correo pertenece a otro usuario' }
      ]);
    }
    throw error;
  }
}

async function desactivar(req, res) {
  const id = parseId(req.params.id);
  if (!id) throw new AppError(404, 'Usuario no encontrado');
  if (id === req.usuario.id) throw new AppError(403, 'No autorizado');

  const row = await usuariosCommand.desactivar(id);
  if (!row) throw new AppError(404, 'Usuario no encontrado');
  res.status(200).json(mapUsuario(row));
}

module.exports = { crear, listar, obtener, actualizar, desactivar };
