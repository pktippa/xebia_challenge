var db = require('./db');
var seed_data = require('./seed-data.json');
var app = require('./index.js');

// Open a new connection
db.conn(function(err, dbIns) {
  //console.log(dbIns);
  // Get the collection 
  const bookInfoCol = dbIns.collection('BookInfo');
  // Insert many records into collection
  bookInfoCol.insertMany(seed_data, function(err, result) {
    if (err) {
      console.error('Got Error while seeding data');
    } else {
      console.log('Uploaded Seed data successfully')
    }
    process.exit();
  });
});