var express = require('express');
var bodyParser = require('body-parser');
const crypto = require('crypto');
const secret = 'xebia';
const hmac = crypto.createHmac('sha256', secret)
var db = require('./db');
var uuidv4 = require('uuid/v4');
var app = express();
var tokens = [];

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

// Login API POST method
app.post('/login', function(req, res) {
  const username = req.body.username;
  const password = req.body.password;
  var query = {
    username: username,
    password: hmac.update(password).digest('hex')
  };
  db.conn(function(err, dbIns) {
    if (err) {console.log('err', err);return res.send([]);}
    const UsersCol = dbIns.collection('Users');
    UsersCol.find(query).limit(1).next(function(err, doc){
      if(err || !doc) {
        console.log('err',err);
        return res.send({'authorized': false});
      }
      var token = uuidv4();
      
      // Caching the tokens
      // Not implemented any expiry or anything
      tokens.append({
        username: doc.username,
        token: token,
        role: doc.role
      });
      return res.send({
        'authorized': true,
        'token': token,
        role: doc.role 
      })
    });
  })
});

app.use(express.static('client'));

app.listen(3000);
if (require.main === module) {
  console.log('Application is listening on 3000 port, access http://localhost:3000/')
}