(function () {

  "use strict";

  var fs = require('fs'),
    path = require('path'),
    EJSON = require('meteor-ejson'),
    random = require('./random').random();
  var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Grid = require('mongodb').Grid,
    Code = require('mongodb').Code,
    BSON = require('mongodb').pure().BSON,
    assert = require('assert');
  var Server = require("mongo-sync").Server;
  var s_json = EJSON.parse(fs.readFileSync('../packages/seed-json/essential-list-json/_s.json'));
  var to_load = EJSON.parse(fs.readFileSync('../packages/seed-json/web-str-json/_s_to_load.json'));
  var n_s_json = [];

  var server = new Server('127.0.0.1');
  var col = server.db("website").getCollection("data");
  col.remove({});
  for(var i = 0; i < s_json.length; i++) {
    if (to_load[s_json[i]._s_n_for] && (s_json[i]._s_n_for !== "_s")) {
      var load_obj = to_load[s_json[i]._s_n_for];

      for(var k = 0; k < s_json[i].json.length; k++) {
        if (load_obj.indexOf(s_json[i].json[k]._n) === -1) {
          s_json[i].json.splice(k, 1);
        } else {
          var json = EJSON.parse(fs.readFileSync('../packages/seed-json/' + s_json[i].json[k].path));
          for(var m = 0; m < json.length; m++) {
            json[m]._usr = "root";
            json[m]._dt = new Date();
            json[m]._id = random.id();
            json[m]._s_n = s_json[i]._s_n_for;
          }
          col.insert(json);
        }
      }
      s_json[i]._usr = "root";
      s_json[i]._dt = new Date();
      s_json[i]._id = random.id();
      n_s_json.push(s_json[i]);
    }

  }
  col.insert(n_s_json);
  var result = col.find({_s_n: "_s"}).forEach(function (doc, index){
    console.log(doc);
  });
  server.close();







}());
