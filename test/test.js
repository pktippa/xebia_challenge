let app = require('../index');
let chai = require('chai');
let chaiHttp = require('chai-http');
let assert = require('assert');
let should = chai.should();

chai.use(chaiHttp);

describe('Testing Books Info', function(){
  var token, readerToken;
  before('Application started', function(done){
    done();
  });

  it('SignUp Editor', function(done) {
    let user = {
      full_name: 'Pradeep',
      username: 'pradeep',
      password: 'pradeep@123',
      role: 'Editor'
    }
    chai.request(app)
      .post('/signup')
      .send(user)
      .end(function(err, res) {
        res.should.have.status(200);
        done();
      });
  });

  it('Login Editor', function(done) {
    let user = {
      username: 'pradeep',
      'password': 'pradeep@123'
    };

    chai.request(app)
      .post('/login')
      .send(user)
      .end(function(err, res) {
        res.body.should.have.property('authorized');
        res.body.should.have.property('authorized').eql(true);
        res.body.should.have.property('token');
        res.body.should.have.property('role');
        res.body.should.have.property('role').eql('Editor');
        token = res.body.token;
        done();
      })
  })

  it('Invalid Login credentials', function(done) {
    let user = {
      username: 'pradeep',
      'password': 'pradeeep'
    };

    chai.request(app)
      .post('/login')
      .send(user)
      .end(function(err, res) {
        res.body.should.have.property('authorized');
        res.body.should.have.property('authorized').eql(false);
        done();
      })
  })

  it('New Book Editor', function(done) {
    let book = {
      author: 'Rowling',
      genre: 'thriller',
      book_title: 'Harry Porter',
      isCoverAvailable: false
    }

    chai.request(app)
      .post('/addBook')
      .set('token', token)
      .send(book)
      .end(function(err, res) {
        res.body.should.have.property('success');
        res.body.should.have.property('success').eql(true);
        done();
      })
  })

  it('Search Book', function(done) {
    let queryUrl = '/searchBooks?author=Rowling';

    chai.request(app)
      .get(queryUrl)
      .set('token', token)
      .end(function(err, res) {
        res.body.should.be.a('array');
        assert.equal('Rowling', res.body[0].author);
        assert.equal('Harry Porter', res.body[0].book_title);
        assert.equal(false, res.body[0].isCoverAvailable);
        done();
      })
  })

  it('Search Book Invalid', function(done) {
    let queryUrl = '/searchBooks?author=JKK';

    chai.request(app)
      .get(queryUrl)
      .set('token', token)
      .end(function(err, res) {
        res.body.should.be.a('array');
        res.body.length.should.be.eql(0);
        done();
      })
  })

  xit('SignUp Reader', function(done) {
    let user = {
      full_name: 'Kumar',
      username: 'kumar',
      password: 'kumar@123',
      role: 'Reader'
    }
    chai.request(app)
      .post('/signup')
      .send(user)
      .end(function(err, res) {
        res.should.have.status(200);
        res.body.should.have.property('success');
        res.body.should.have.property('success').eql(true);
        done();
      });
  });

  it('SignUp Same User', function(done) {
    let user = {
      full_name: 'Kumar',
      username: 'kumar',
      password: 'kumar@123',
      role: 'Reader'
    }
    chai.request(app)
      .post('/signup')
      .send(user)
      .end(function(err, res) {
        res.body.should.have.property('success');
        res.body.should.have.property('success').eql(false);
        res.body.should.have.property('user_exists');
        res.body.should.have.property('user_exists').eql(true);
        done();
      });
  });

  it('Login Reader', function(done) {
    let user = {
      username: 'kumar',
      'password': 'kumar@123'
    };

    chai.request(app)
      .post('/login')
      .send(user)
      .end(function(err, res) {
        res.body.should.have.property('token');
        res.body.should.have.property('role');
        res.body.should.have.property('role').eql('Reader');
        readerToken = res.body.token;
        done();
      })
  })

  it('New Book Reader', function(done) {
    let book = {
      author: 'Rowling',
      genre: 'thriller',
      book_title: 'Harry Porter',
      isCoverAvailable: false
    }

    chai.request(app)
      .post('/addBook')
      .set('token', readerToken)
      .send(book)
      .end(function(err, res) {
        res.body.should.have.property('unauthorized');
        res.body.should.have.property('unauthorized').eql(true);
        done();
      })
  })

});