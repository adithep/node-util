(function () {

  "use strict";

  var fs = require('fs'),
    path = require('path'),
    _ = require('lodash');
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
  var Server = require("mongo-sync").Server,
    DB = require("mongo-sync").DB;



  function CS() {}

  CS.prototype.build = function () {
    this.database = database;
    var server = new Server('127.0.0.1:27017');
    this.col = server.db("alphaDB").getCollection("data");

    server.close();
  };



  exports.c_sort = function () {
    return new CS();
  };

}());
