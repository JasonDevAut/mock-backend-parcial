const { sql, ejecutar } = require('../sql');

async function listar({ productoId, usuarioId }) {
  const result = await ejecutar('dbo.sp_listar_pedidos', (request) => {
    request.input('ProductoId', sql.Int, productoId);
    request.input('UsuarioId', sql.Int, usuarioId);
  });
  return result.recordset;
}

async function obtener(id) {
  const result = await ejecutar('dbo.sp_obtener_pedido', (request) => {
    request.input('PedidoId', sql.Int, id);
  });
  return result.recordset[0] || null;
}

module.exports = { listar, obtener };
