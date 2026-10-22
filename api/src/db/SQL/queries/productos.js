const { sql, ejecutar } = require('../sql');

async function listar() {
  const result = await ejecutar('dbo.sp_listar_productos', () => {});
  return result.recordset;
}

async function obtener(id) {
  const result = await ejecutar('dbo.sp_obtener_producto', (request) => {
    request.input('ProductoId', sql.Int, id);
  });
  return result.recordset[0] || null;
}

module.exports = { listar, obtener };
