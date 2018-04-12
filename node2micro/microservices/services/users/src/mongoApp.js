const mongo = require('mongodb').MongoClient;
const conn_mongo = "mongodb://mongo/node2micro";
const limit = 100000;
const dd = require('./dumbdata.json');

module.exports = function (app) {
  mongo.connect(conn_mongo, function (err, db) {
    var dbase = db.db("node2micro");
    app.users = dbase.collection("users");
  });

  // Function to generate Users data.
  app.generateUsers = function(callback) {
    mongo.connect(conn_mongo, function(e1, db) {
      if (e1) throw e1;

      var dbase = db.db("node2micro");

      // Drop the existing collection to avoid duplicated ids.
      dbase.collection('users').drop();

      // Generate the collection.
      dbase.createCollection("users", function(e2, coll) {

        var obj_users = [];

        // Generate random values for users data.
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
};
