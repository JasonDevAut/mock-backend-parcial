function loadDriver() {
  if (process.env.SQL_USER) {
    return require('mssql');
  }

  try {
    return require('mssql/msnodesqlv8');
  } catch (error) {
    throw new Error(
      'SQL_USER está vacío. Completa SQL_USER y SQL_PASSWORD para autenticación SQL, o instala msnodesqlv8 para usar autenticación de Windows.'
    );
  }
}

const sql = loadDriver();

function buildConfig() {
  if (!process.env.SQL_USER) {
    const driver = process.env.SQL_ODBC_DRIVER || 'ODBC Driver 17 for SQL Server';
    const database = process.env.SQL_DATABASE;
    const server = process.env.SQL_SERVER;
    return {
      connectionString: `Driver={${driver}};Server=${server};Database=${database};Trusted_Connection=Yes;TrustServerCertificate=Yes;`,
      driver: 'msnodesqlv8'
    };
  }

  const config = {
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    options: {
      encrypt: true,
      trustServerCertificate: true,
      enableArithAbort: true
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  };

  if (process.env.SQL_PORT) {
    config.port = Number(process.env.SQL_PORT);
  }

  return config;
}

module.exports = { sql, buildConfig };
