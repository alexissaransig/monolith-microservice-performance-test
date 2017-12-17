var mysql = require('mysql');
const limit = 200000;
const dd = require('./dumbdata.json');

module.exports = function (app) {
  var db = mysql.createPool({ user: 'root', password: 'root', database: 'node2micro', host: '127.0.0.1' });
  app.conn = db;

  app.generatePosts = function(callback) {
    // Clean up the table.
    db.query('DELETE FROM posts where thread != -1');

    // Generate Posts
    for (var i = 0; i < limit; i++) {
      var a = Math.floor((Math.random() * 9) + 1);
      var uid = Math.floor((Math.random() * (limit - 1)) + 1);
      var tid = Math.floor((Math.random() * (limit - 1)) + 1);
      var text = dd.names[a];
      var data = {
        thread: tid,
        text: text,
        user: uid
      };

      // Stores in the MySQL Database
      db.query('INSERT INTO posts SET ?', data);

      // Checks all data is generated before to throw the callback.
      if (i + 1 == limit) {
        console.log(limit + " Posts generated!");
        //db.end();
        callback();
      }
    }
  }

}
