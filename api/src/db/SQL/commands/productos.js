const { sql, ejecutar } = require('../sql');

async function insertar({ nombre, precio, stock, descripcion }) {
  const result = await ejecutar('dbo.sp_insertar_producto', (request) => {
    request.input('Nombre', sql.NVarChar(120), nombre);
    request.input('Precio', sql.Decimal(10, 2), precio);
    request.input('Stock', sql.Int, stock);
    request.input('Descripcion', sql.NVarChar(500), descripcion);
  });
  return result.recordset[0];
}

async function actualizar({ id, nombre, precio, stock, descripcion }) {
  const result = await ejecutar('dbo.sp_actualizar_producto', (request) => {
    request.input('ProductoId', sql.Int, id);
    request.input('Nombre', sql.NVarChar(120), nombre);
    request.input('Precio', sql.Decimal(10, 2), precio);
    request.input('Stock', sql.Int, stock);
    request.input('Descripcion', sql.NVarChar(500), descripcion);
  });
  return (result.recordset && result.recordset[0]) || null;
}

async function desactivar(id) {
  const result = await ejecutar('dbo.sp_desactivar_producto', (request) => {
    request.input('ProductoId', sql.Int, id);
  });
  return (result.recordset && result.recordset[0]) || null;
}

module.exports = { insertar, actualizar, desactivar };
