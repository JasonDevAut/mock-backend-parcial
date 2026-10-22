const { sql, ejecutar } = require('../sql');

async function buscarPorEmail(email, usuarioId) {
  const result = await ejecutar('dbo.sp_buscar_usuario_por_email', (request) => {
    request.input('Email', sql.NVarChar(255), email);
    request.input('UsuarioId', sql.Int, usuarioId);
  });
  return result.recordset[0] || null;
}

async function listar() {
  const result = await ejecutar('dbo.sp_listar_usuarios', () => {});
  return result.recordset;
}

async function buscarParaLogin(email) {
  const result = await ejecutar('dbo.sp_obtener_usuario_por_email', (request) => {
    request.input('Email', sql.NVarChar(255), email);
  });
  return result.recordset[0] || null;
}

async function obtener(id) {
  const result = await ejecutar('dbo.sp_obtener_usuario', (request) => {
    request.input('UsuarioId', sql.Int, id);
  });
  return result.recordset[0] || null;
}

module.exports = { buscarPorEmail, buscarParaLogin, listar, obtener };
