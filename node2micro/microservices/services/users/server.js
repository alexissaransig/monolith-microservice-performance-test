const app = require('koa')();
const router = require('koa-router')();

require("./src/mongoApp")(app);

// Log requests
app.use(function *(next){
  const start = new Date;
  yield next;
  const ms = new Date - start;
  console.log('%s %s - Finished in %s (ms)', this.method, this.url, ms);
});

// Generate Users - Mongo
router.get('/api/generate/users', function *(next) {
  yield app.generateUsers;
  this.body = "Users - Ok";
});

// Extra endpoints to retrieve existing data.
router.get('/api/users', function *(next) {
  // this.body = yield app.users.find().limit(100000).toArray();
  this.body = yield app.users.find().toArray();
});

router.get('/api/users/:userId', function *(next) {
  const id = parseInt(this.params.userId);
  this.body = yield app.users.find({_id: id}).toArray();
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
