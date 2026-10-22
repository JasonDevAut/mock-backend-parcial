const bcrypt = require('bcryptjs');
const usuariosQuery = require('../db/SQL/queries/usuarios');
const usuariosCommand = require('../db/SQL/commands/usuarios');
const { AppError, isDuplicateKey } = require('../lib/http');
const { firmar } = require('../lib/token');

function mapUsuario(row) {
  return {
    id: row.UsuarioId,
    nombre: row.Nombre,
    apellido: row.Apellido,
    email: row.Email,
    telefono: row.Telefono,
    perfil: row.Perfil,
    activo: Boolean(row.Activo),
    fechaActualizacion: row.FechaActualizacion ? new Date(row.FechaActualizacion).toISOString() : null
  };
}

function telefonoOrNull(value) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  return String(value).trim();
}

async function login(req, res) {
  const email = req.body.email.trim();
  const row = await usuariosQuery.buscarParaLogin(email);
  const coincide = row ? await bcrypt.compare(req.body.password, row.PasswordHash) : false;
  if (!row || !coincide) {
    throw new AppError(401, 'Credenciales inválidas');
  }
  if (!row.Activo) {
    throw new AppError(403, 'El usuario no está activo');
  }

  const usuario = mapUsuario(row);
  req.usuario = usuario;
  res.status(200).json({
    token: firmar(usuario),
    usuario
  });
}

async function registro(req, res) {
  const email = req.body.email.trim();
  const existente = await usuariosQuery.buscarPorEmail(email, null);
  if (existente) {
    throw new AppError(409, 'El correo ya está registrado', [
      { campo: 'email', mensaje: 'Ya existe un usuario con ese correo' }
    ]);
  }

  try {
    const row = await usuariosCommand.insertar({
      nombre: req.body.nombre.trim(),
      apellido: req.body.apellido.trim(),
      email,
      telefono: telefonoOrNull(req.body.telefono),
      passwordHash: await bcrypt.hash(req.body.password, 10),
      perfil: 'Cliente'
    });
    req.usuario = { id: row.UsuarioId };
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

module.exports = { login, registro, mapUsuario, telefonoOrNull };
