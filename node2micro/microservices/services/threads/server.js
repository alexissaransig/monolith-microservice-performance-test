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

// Generate Threads - Mongo
router.get('/api/generate/threads', function *(next) {
  yield app.generateThreads;
  this.body = "Threads - Ok";
});

router.get('/api/threads', function *() {
  // this.body = yield app.threads.find().limit(100000).toArray();
  this.body = yield app.threads.find().toArray();
});

router.get('/api/threads/:threadId', function *() {
  const id = parseInt(this.params.threadId);
  this.body = yield app.threads.find({_id: id}).toArray();
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
