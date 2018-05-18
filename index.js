var express = require('express');
var bodyParser = require('body-parser');
var db = require('./db');
var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Hello World');
});

app.get('/searchBooks', function(req, res) {
  var query = req.query;
  db.conn(function(err, dbIns) {
    if (err) return res.send({'error': 'Got some error'});
    const bookInfoCol = dbIns.collection('BookInfo');

    bookInfoCol.find(query).toArray(function(err, results) {
      res.send(results);
    });
  });
});

app.listen(3000);
