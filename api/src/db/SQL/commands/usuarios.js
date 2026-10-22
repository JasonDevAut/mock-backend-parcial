const { sql, ejecutar } = require('../sql');

async function insertar({ nombre, apellido, email, telefono, passwordHash, perfil }) {
  const result = await ejecutar('dbo.sp_insertar_usuario', (request) => {
    request.input('Nombre', sql.NVarChar(100), nombre);
    request.input('Apellido', sql.NVarChar(100), apellido);
    request.input('Email', sql.NVarChar(255), email);
    request.input('Telefono', sql.NVarChar(30), telefono);
    request.input('PasswordHash', sql.NVarChar(255), passwordHash);
    request.input('Perfil', sql.NVarChar(50), perfil);
  });
  return result.recordset[0];
}

async function actualizar({ id, nombre, apellido, email, telefono, passwordHash, perfil }) {
  const result = await ejecutar('dbo.sp_actualizar_usuario', (request) => {
    request.input('UsuarioId', sql.Int, id);
    request.input('Nombre', sql.NVarChar(100), nombre);
    request.input('Apellido', sql.NVarChar(100), apellido);
    request.input('Email', sql.NVarChar(255), email);
    request.input('Telefono', sql.NVarChar(30), telefono);
    request.input('PasswordHash', sql.NVarChar(255), passwordHash);
    request.input('Perfil', sql.NVarChar(50), perfil);
  });
  return (result.recordset && result.recordset[0]) || null;
}

async function desactivar(id) {
  const result = await ejecutar('dbo.sp_desactivar_usuario', (request) => {
    request.input('UsuarioId', sql.Int, id);
  });
  return (result.recordset && result.recordset[0]) || null;
}

module.exports = { insertar, actualizar, desactivar };
