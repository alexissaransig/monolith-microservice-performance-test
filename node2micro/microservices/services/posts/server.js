const app = require('koa')();
const router = require('koa-router')();
var mysql2 = require('koa-mysql');

require("./src/mysqlApp")(app);

var conn_mysql = mysql2.createPool({ user: 'root', password: 'root', database: 'node2micro', host: 'mysql' });

// Log requests
app.use(function *(next){
  const start = new Date;
  yield next;
  const ms = new Date - start;
  console.log('%s %s - %s', this.method, this.url, ms);
});

// Generate Posts - MySQL
router.post('/api/generate/posts', function *(next) {
  yield app.generatePosts;
  this.body = "Posts - Ok";
});

router.get('/api/posts', function *() {
  var rows = yield conn_mysql.query('SELECT * FROM posts');
  this.body = rows;
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

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);

console.log('Worker started');
