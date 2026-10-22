require('dotenv').config();
const { createApp } = require('./app');
const { connectSql } = require('./db/SQL/sql');
const { connectMongo } = require('./db/mongo/mongo');

async function main() {
  const port = process.env.PORT;
  if (!port) {
    throw new Error('La variable de entorno PORT es obligatoria');
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('La variable de entorno JWT_SECRET es obligatoria');
  }

  await connectSql();
  await connectMongo();

  const app = createApp();
  app.listen(Number(port), () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
  });
}

main().catch((error) => {
  console.error('No se pudo iniciar el servidor:', error.message);
  process.exit(1);
});
