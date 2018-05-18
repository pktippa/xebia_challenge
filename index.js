var express = require('express');
var bodyParser = require('body-parser');
const crypto = require('crypto');
const secret = 'xebia';
var db = require('./db');
var uuidv4 = require('uuid/v4');
var app = express();
var tokens = [];
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
var fs = require('fs');

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
  const hmac = crypto.createHmac('sha256', secret);
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
      tokens.push({
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

app.post('/signup', function(req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const full_name = req.body.full_name;
  const role = req.body.role;
  const hmac = crypto.createHmac('sha256', secret);
  if (username && password && full_name && role) {
    var obj= {
      username: username,
      password: hmac.update(password).digest('hex'),
      full_name: full_name,
      role: role
    };
    db.conn(function(err, dbIns) {
      if (err) {
        console.log('err', err);
        return res.send({'success': false});
      }
      const UsersCol = dbIns.collection('Users');
      UsersCol.find(obj).toArray(function(err, result) {
        if (err) {
          console.log('err', err);
          return res.send({'success': false});
        }
        if (result.length > 0) {
          return res.send({'success': false, 'user_exists': true});
        } else {
          UsersCol.insertOne(obj, function(err, r) {
            if (err || r.insertedCount !== 1) {
              console.log('err', err);
              return res.send({'success': false});
            }
            return res.send({'success': true});
          });
        }
      });      
    });
  } else {
    res.send({'success': false});
  }
});

function getRandomNum() {
  return Math.floor(Math.random() * (100000 - 10000 + 1)) + 100000;
}
app.post('/addBook', upload.single('cover'), function(req, res) {
  for (name in req.body){
    console.log('name', name, 'val', req.body[name]);
  }
  if(req.headers['token']) {
    const token = req.headers['token'];
    var inToken = tokens.find(function(el) {
      return el.token == token;
    });
    if(inToken && inToken.role == 'Editor') {
      fs.readFile('uploads/' + req.file.filename, function(err, res){
        if(err) {console.log(err); return res.send({'success': false});}
        const fileName = getRandomNum() + req.body.cover;
        fs.writeFile('client/img/' + fileName, function(err, reslt) {
          if (err) {console.log('err file write', err); return res.send({'success': false})}
          var obj = req.body;
          obj.cover = fileName;
          db.conn(function(err, dbIns) {
            if (err) {
              console.log('err', err);
              return res.send({'success': false});
            }
            const BookInfoCol = dbIns.collection('BookInfo');
            BookInfoCol.insertOne(obj, function(err, r) {
              if (err || r.insertedCount !== 1) {
                console.log('err', err);
                return res.send({'success': false});
              }
              return res.send({'success': true});
            })
          });
        });
      });
    } else {
      res.send({'unauthorized': true});
    }
  } else {
    res.send({'unauthorized': true});
  }
});

app.use(express.static('client'));

app.listen(3000);
if (require.main === module) {
  console.log('Application is listening on 3000 port, access http://localhost:3000/')
}