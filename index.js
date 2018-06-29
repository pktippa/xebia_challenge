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

// For Searching the Books
app.get('/searchBooks', function(req, res) {
  // Building query
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

// Signup API
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
  // Generating random number used to store with image name
  return Math.floor(Math.random() * (100000 - 10000 + 1)) + 100000;
}

// For adding a new book
app.post('/addBook', upload.single('cover'), function(req, res) {
  if(req.headers['token']) {
    const token = req.headers['token'];
    // Verifying token
    var inToken = tokens.find(function(el) {
      return el.token == token;
    });
    // Validating token and Editor role
    if(inToken && inToken.role == 'Editor') {
      var obj = req.body;
      var doDBTransaction = function (obj, res) {
        db.conn(function(err, dbIns) {
          if (err) {
            console.log('err', err);
            return res.send({'success': false});
          }
          const BookInfoCol = dbIns.collection('BookInfo');
          // Adding new Book to Database
          BookInfoCol.insertOne(obj, function(err, r) {
            if (err || r.insertedCount !== 1) {
              console.log('err', err);
              return res.send({'success': false});
            }
            return res.send({'success': true});
          })
        });
      };
      
      if(req.file && req.file.filename) {
        // Handling the image file uploaded
        var src_path = 'uploads/' + req.file.filename;
        const fileName = getRandomNum() + req.body.cover;
        var des_path = 'client/img/' + fileName;

        // Creating Source to destination pipe
        var src = fs.createReadStream(src_path);
        var dest = fs.createWriteStream(des_path);
        src.pipe(dest);
        // Listening on events
        src.on('end', function() {
          obj.cover = fileName;
          doDBTransaction(obj, res);          
        });
        // On Error event
        src.on('error', function(err) {
          console.log('err file write', err);
          return res.send({'success': false})
        });
        // Other way of reading whole and writing it
        /*
        fs.readFile('uploads/' + req.file.filename, function(err, data){
          if(err) {console.log(err); return res.send({'success': false});}
          const fileName = getRandomNum() + req.body.cover;
          // Wirting the uploaded image to client images folder
          fs.writeFile('client/img/' + fileName, data, function(err, reslt) {
            if (err) {console.log('err file write', err); return res.send({'success': false})}
            obj.cover = fileName;
            doDBTransaction(obj, res)
          });
        });*/
      } else {
        doDBTransaction(obj, res)
      }      
    } else {
      res.send({'unauthorized': true});
    }
  } else {
    res.send({'unauthorized': true});
  }
});

// For serving images, html, javascript files
app.use(express.static('client'));

// Listening on Port
app.listen(3000);

// For logging application runnint from > node .
if (require.main === module) {
  console.log('Application is listening on 3000 port, access http://localhost:3000/')
}

// For test
module.exports = app;