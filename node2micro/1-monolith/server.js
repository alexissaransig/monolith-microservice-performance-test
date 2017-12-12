// Load required libraries.
const app = require('koa')();
const router = require('koa-router')();
var mongo = require('mongodb').MongoClient;
var mysql = require('mysql');

// Load a file with Sample texts.
const dd = require('./dumbdata.json');
// Set the limit of data to be generated.
const limit = 200000;

// Set connection string/info.
var conn_mongo = "mongodb://localhost:27017/node2micro";
var conn_mysql = mysql.createConnection({
  host     : '127.0.0.1',
  port     : '3306',
  user     : 'root',
  password : 'root',
  database : 'node2micro',
});

// Log requests.
app.use(function *(next){
  const start = new Date;
  yield next;
  const ms = new Date - start;
  console.log('%s %s - Finished in %s (ms)', this.method, this.url, ms);
});


// ------------------- ENDPOINTS -----------------------

// Generate Users - Mongo
router.get('/api/generate/users', function *(next) {
  yield generateUsers;
  this.body = "Users - Ok";
});

// Generate Threads - Mongo
router.get('/api/generate/threads', function *(next) {
  yield generateThreads;
  this.body = "Threads - Ok";
});

// Generate Posts - MySQL
router.get('/api/generate/posts', function *(next) {
  yield generatePosts;
  this.body = "Posts - Ok";
});

// Extra endpoints to retrieve existing data.
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


// ------------------- HELPER FUNCTIONS --------------------

// Function to generate Users data.
function generateUsers(callback) {
  mongo.connect(conn_mongo, function(e1, db) {
    if (e1) throw e1;
    
    var dbase = db.db("mydb");

    // Drop the existing collection to avoid duplicated ids.
    dbase.collection('users').drop();

    // Generate the collection.
    dbase.createCollection("users", function(e2, coll) {

      var obj_users = [];

      // Generate ramdon values for users data.
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

      // Insert in the collection the values.
      coll.insertMany(obj_users, function(err, result) {
        console.log(limit + " Users generated!");
        db.close();
        callback();
      });
    });
  });
}

// Function to generate Users data.
function generateThreads(callback) {
  mongo.connect(conn_mongo, function(e1, db) {
    if (e1) throw e1;
    
    var dbase = db.db("mydb");

    // Drop the existing collection to avoid duplicated ids.
    dbase.collection('threads').drop();

    // Generate the collection.
    dbase.createCollection("threads", function(e2, coll) {

      var obj_threads = [];

      for (var i = 0; i < limit; i++) {
        var a = Math.floor((Math.random() * 9) + 1);
        var uid = Math.floor((Math.random() * (limit - 1)) + 1);
        var title = dd.titles[a];
        var obj_thread = {
          _id: i,
          title: title + '-' + i, 
          author: uid
        };

        obj_threads.push(obj_thread);
      }

      // Insert in the collection the values.
      coll.insertMany(obj_threads, function(err, result) {
        console.log(limit + " Threads generated!");
        db.close();
        callback();
      });
    });
  });
}

// Function to generate Posts data.
function generatePosts(callback) {
  conn_mysql.connect();

  // Clean up the table.
  conn_mysql.query('DELETE FROM posts', {}, function (error, results, fields) {
    if (error) throw error;
  });

  // Generate Posts
  for (var i = 0; i < limit; i++) {
    var a = Math.floor((Math.random() * 9) + 1);
    var uid = Math.floor((Math.random() * (limit - 1)) + 1);
    var tid = Math.floor((Math.random() * (limit - 1)) + 1);
    var text = dd.names[a];
    var data = {
      thread: tid,
      text: text, user:
      uid
    };

    // Stores in the MySQL Database
    conn_mysql.query('INSERT INTO posts SET ?', data, function (error, results, fields) {
      if (error) throw error;
    });

    // Checks all data is generated before to throw the callback.
    if (i + 1 == limit) {
      console.log(limit + " Posts generated!");
      conn_mysql.end();
      callback();
    }
  }
}

// ----------------------- ROUTER settings and Listener port ---------
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
