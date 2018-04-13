var mysql = require('mysql');
const limit = 100000;
const dd = require('./dumbdata.json');

module.exports = function (app) {
  app.generatePosts = function(callback) {
    // The connection must be created just when the function is called.
    var db = mysql.createConnection({ user: 'root', password: 'root', database: 'node2micro', host: '127.0.0.1' });
    // Creates a clean database.
    db.query('DROP DATABASE IF EXISTS node2micro', function (err, result) {
      if (err) throw err;
      console.log("Database dropped");

      db.query('CREATE DATABASE node2micro', function (err, result) {
        if (err) throw err;
        console.log("Database created");

        db.query('USE node2micro', function (err, result) {
          if (err) throw err;
          console.log("Using node2micro database");

          db.query('DROP TABLE IF EXISTS posts', function (err, result) {
            if (err) throw err;
            console.log("Table dropped");

            db.query('CREATE TABLE posts (\n' +
              '  thread int(11) DEFAULT NULL,\n' +
              '  text varchar(1000) DEFAULT NULL,\n' +
              '  user int(11) DEFAULT NULL\n' +
              ')', function (err, result) {
              if (err) throw err;
              console.log("Table created");

              // Generate Posts
              for (var i = 0; i < limit; i++) {
                var a = Math.floor((Math.random() * 9) + 1);
                var uid = Math.floor((Math.random() * (limit - 1)) + 1);
                var tid = Math.floor((Math.random() * (limit - 1)) + 1);
                var text = dd.text[a];
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
                  db.end();
                  callback();
                }
              }
            });
          });
        });
      });
    });
  }
}
