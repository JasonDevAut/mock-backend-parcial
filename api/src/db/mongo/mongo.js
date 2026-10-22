const { Int32 } = require('mongodb');
const { MongoClient, mongoConfig } = require('./DBConexion');

let client;
let database;

async function connectMongo() {
  if (database) return database;
  const { uri, dbName } = mongoConfig();
  client = new MongoClient(uri);
  await client.connect();
  database = client.db(dbName);
  return database;
}

function getDb() {
  if (!database) {
    throw new Error('MongoDB no está conectado');
  }
  return database;
}

async function insertEvento(documento) {
  const log = {
    accion: documento.accion,
    statusCode: new Int32(documento.statusCode),
    IP: documento.IP,
    id_usuario: documento.id_usuario ? String(documento.id_usuario) : 'anonimo',
    metodo: documento.metodo,
    ruta: documento.ruta,
    fecha_ejecucion: documento.fecha_ejecucion
  };

  if (documento.pedidoId != null) log.pedidoId = new Int32(documento.pedidoId);
  if (documento.comentarioId) log.comentarioId = String(documento.comentarioId);
  if (documento.texto) log.texto = documento.texto;
  if (documento.mensaje) log.mensaje = documento.mensaje;
  if (documento.descripcion) log.descripcion = documento.descripcion;

  try {
    await getDb().collection('logs').insertOne(log);
  } catch (error) {
    console.error('No se pudo guardar el evento de actividad:', error.message);
  }
}

module.exports = { connectMongo, getDb, insertEvento };
