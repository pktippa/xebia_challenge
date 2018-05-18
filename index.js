var express = require('express');
var bodyParser = require('body-parser');
var db = require('./db');
var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());

app.get('/searchBooks', function(req, res) {
  var query = req.query;
  if (query.author || query.genre || query.book_title){ 
    db.conn(function(err, dbIns) {
      if (err){ console.log('err', err);return res.send([]);}
      const bookInfoCol = dbIns.collection('BookInfo');
  
      bookInfoCol.find(query).toArray(function(err, results) {
        res.send(results);
      });
    });
  } else {
    res.send([]);
  }  
});

app.use(express.static('client'));

app.listen(3000);
if (require.main === module) {
  console.log('Application is listening on 3000 port, access http://localhost:3000/')
}