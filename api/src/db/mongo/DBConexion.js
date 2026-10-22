const { MongoClient } = require('mongodb');

function mongoConfig() {
  return {
    uri: process.env.MONGO_URI,
    dbName: process.env.MONGO_DB
  };
}

module.exports = { MongoClient, mongoConfig };
