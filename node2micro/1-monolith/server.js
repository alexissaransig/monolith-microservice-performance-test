// Load required libraries.
const app = require('koa')();
const router = require('koa-router')();
var mysql = require('mysql');

require("./mongoApp")(app);

// Set connection string/info.
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
  yield app.MgenerateUsers;
  this.body = "Users - Ok";
});

// Generate Threads - Mongo
router.get('/api/generate/threads', function *(next) {
  yield app.generateThreads;
  this.body = "Threads - Ok";
});

// Generate Posts - MySQL
router.get('/api/generate/posts', function *(next) {
  yield generatePosts;
  this.body = "Posts - Ok";
});

// Extra endpoints to retrieve existing data.
router.get('/api/users', function *(next) {
  this.body = yield app.users.find().limit(100).toArray();
});

router.get('/api/users/:userId', function *(next) {
  const id = parseInt(this.params.userId);
  this.body = yield app.users.find({_id: id}).toArray();
});

router.get('/api/threads', function *() {
  this.body = yield app.threads.find().limit(100).toArray();
});

router.get('/api/threads/:threadId', function *() {
  const id = parseInt(this.params.threadId);
  this.body = yield app.threads.find({_id: id}).toArray();
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
