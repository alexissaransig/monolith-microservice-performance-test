const app = require('koa')();
const router = require('koa-router')();
const db = require('./db.json');
const dd = require('./dumbdata.json');
const limit = 200000;

var mongo = require('mongodb').MongoClient;
var mongo_url = "mongodb://localhost:27017/mydb";
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  port     : '3306',
  user     : 'root',
  password : 'root',
  database : 'exp1',
});

// Log requests
app.use(function *(next){
  const start = new Date;
  yield next;
  const ms = new Date - start;
  console.log('%s %s - %s (ms)', this.method, this.url, ms);
});

// Generate Users - Mongo
router.get('/api/generate/users', function *(next) {
  mongo.connect(mongo_url, function(e1, db) {
    if (e1) throw e1;
    console.log("Database created!");
    
    var dbase = db.db("mydb");

    dbase.collection('users').drop();

    // Generate the collection.
    dbase.createCollection("users", function(e2, coll) {
      console.log("Collection created!");

      var obj_users = [];

      for (var i = 0; i < limit; i++) {    
        var a = Math.floor((Math.random() * 9) + 1);
        var b = Math.floor((Math.random() * 9) + 1);
        var uname = dd.names[a];
        var ubio = dd.text[b];
        var obj_user = {
          _id: i, 
          username: 'user-' + uname.toLowerCase() + '-' + i, 
          name: uname + '-' + i, 
          bio: ubio
        }

        obj_users.push(obj_user);
      }

      coll.insertMany(obj_users, function(err, result) {
        console.log("--------------- Users generated");
      });
    });
  });
});

router.get('/api/generate/posts', function *(next) {
  const start = new Date;
  yield next;
  console.log("---------------- A");
  generateData(function() {
    const ms = new Date - start;
    console.log("---------------- C");
    this.body = "Datos generados correctamente en: " + ms + "ms";
  });
});

function generateData(callback) {
  connection.connect();

  // Generate Users
  console.log("------------------------ Generating USERS ---------------------");
  for (var i = 0; i < limit; i++) {
    
    var a = Math.floor((Math.random() * 9) + 1);
    var b = Math.floor((Math.random() * 9) + 1);
    var uname = dd.names[a];
    var ubio = dd.text[b];
    var data = {username: 'user-' + uname.toLowerCase() + '-' + i, name: uname + '-' + i, bio: ubio}

    console.log(data);

    connection.query('INSERT INTO users SET ?', data, function (error, results, fields) {
      if (error) throw error;
      //console.log(results.insertId);
    });
  }

  // Generate Threads
  console.log("------------------------ Generating THREADS ---------------------");
  for (var i = 0; i < limit; i++) {
    var a = Math.floor((Math.random() * 9) + 1);
    var uid = Math.floor((Math.random() * (limit - 1)) + 1);
    var title = dd.names[a];
    var data = {title: title + '-' + i, author: uid}

    console.log(data);

    connection.query('INSERT INTO threads SET ?', data, function (error, results, fields) {
      if (error) throw error;
      //console.log(results.insertId);
    });
  }

  // Generate Posts
  console.log("------------------------ Generating POSTS ---------------------");
  for (var i = 0; i < limit; i++) {
    var a = Math.floor((Math.random() * 9) + 1);
    var uid = Math.floor((Math.random() * (limit - 1)) + 1);
    var tid = Math.floor((Math.random() * (limit - 1)) + 1);
    var text = dd.names[a];
    var data = {thread: tid, text: text, user: uid}

    console.log(data);

    connection.query('INSERT INTO posts SET ?', data, function (error, results, fields) {
      if (error) throw error;
      //console.log(results.insertId);
    });

    if (i + 1 == limit) {
      console.log("---------------- B");
      connection.end();
      callback();
    }
  }
}

router.get('/api/users', function *(next) {
  this.body = db.users;
});

router.get('/api/users/:userId', function *(next) {
  const id = parseInt(this.params.userId);
  this.body = db.users.find((user) => user.id == id);
});

router.get('/api/threads', function *() {
  this.body = db.threads;
});

router.get('/api/threads/:threadId', function *() {
  const id = parseInt(this.params.threadId);
  this.body = db.threads.find((thread) => thread.id == id);
});

router.get('/api/posts/in-thread/:threadId', function *() {
  const id = parseInt(this.params.threadId);
  this.body = db.posts.filter((post) => post.thread == id);
});

router.get('/api/posts/by-user/:userId', function *() {
  const id = parseInt(this.params.userId);
  this.body = db.posts.filter((post) => post.user == id);
});

router.get('/api/', function *() {
  this.body = "API ready to receive requests";
});

router.get('/', function *() {
  this.body = "Ready to receive requests";
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
