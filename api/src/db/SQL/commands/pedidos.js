const { sql, ejecutar } = require('../sql');

async function registrar({ usuarioId, productoId, cantidad }) {
  const result = await ejecutar('dbo.sp_registrar_pedido', (request) => {
    request.input('UsuarioId', sql.Int, usuarioId);
    request.input('ProductoId', sql.Int, productoId);
    request.input('Cantidad', sql.Int, cantidad);
    request.output('PedidoId', sql.Int);
    request.output('Codigo', sql.Int);
  });

  return {
    codigo: result.output.Codigo,
    pedidoId: result.output.PedidoId
  };
}

async function cancelar(id) {
  const result = await ejecutar('dbo.sp_cancelar_pedido', (request) => {
    request.input('PedidoId', sql.Int, id);
    request.output('Codigo', sql.Int);
  });

  return {
    codigo: result.output.Codigo,
    pedido: (result.recordset && result.recordset[0]) || null
  };
}

module.exports = { registrar, cancelar };
