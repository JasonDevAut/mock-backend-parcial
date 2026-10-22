const { sql, buildConfig } = require('./DBConexion');

let pool;

async function connectSql() {
  if (pool) return pool;
  pool = await new sql.ConnectionPool(buildConfig()).connect();
  return pool;
}

function getPool() {
  if (!pool) {
    throw new Error('SQL Server no está conectado');
  }
  return pool;
}

async function ejecutar(procedimiento, configurar) {
  const request = (await getPool()).request();
  configurar(request);
  return request.execute(procedimiento);
}

module.exports = { sql, connectSql, getPool, ejecutar };
