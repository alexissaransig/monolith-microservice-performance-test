// Load required libraries.
const app = require('koa')();
const router = require('koa-router')();
var mysql2 = require('koa-mysql');

require("./src/mongoApp")(app);
require("./src/mysqlApp")(app);

var conn_mysql = mysql2.createPool({ user: 'root', password: 'root', database: 'node2micro', host: '127.0.0.1' });

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
  yield app.generateUsers;
  this.body = "Users - Ok";
});

// Generate Threads - Mongo
router.get('/api/generate/threads', function *(next) {
  yield app.generateThreads;
  this.body = "Threads - Ok";
});

// Generate Posts - MySQL
router.get('/api/generate/posts', function *(next) {
  yield app.generatePosts;
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
  var rows = yield conn_mysql.query('SELECT * FROM posts WHERE thread=' + id);
  this.body = rows;
});

router.get('/api/posts/by-user/:userId', function *() {
  const id = parseInt(this.params.userId);
  var rows = yield conn_mysql.query('SELECT * FROM posts WHERE user=' + id);
  this.body = rows;
});

router.get('/api/', function *() {
  this.body = "API ready to receive requests";
});

router.get('/', function *() {
  this.body = "Ready to receive requests";
});

// ----------------------- ROUTER settings and Listener port ---------
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
