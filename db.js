var MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017";
const db_name = 'xebia_books';

var db_V;

// Creating new connection of DB instance
// and caching it same
var conn = function(cb) {
  if (db_V) {
    cb(null, db_V);
  } else {
    MongoClient.connect(url, function(err, client) {
      if (err) {
        console.err(err);
        return cb(err);
      }
      const db = client.db(db_name);
      db_V = db;
      cb(null, db);
    });
  }
};

module.exports = {
  conn : conn
};
