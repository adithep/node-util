(function () {

  "use strict";

  var fs = require('fs'),
    path = require('path'),
    EJSON = require('./ejson'),
    random = require('./random').random(),
    _ = require('lodash'),
    _tra = require('traverse');
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



  function Seed() {}

  Seed.prototype.seed_all = function () {
    var server = new Server('127.0.0.1:27017');
    this.col = server.db("website").getCollection("data");
    var s_json = EJSON.parse(fs.readFileSync('../packages/seed-json/essential-list-json/_s.json', 'utf-8'));
    var keys_json = EJSON.parse(fs.readFileSync('../packages/seed-json/essential-list-json/keys.json', 'utf-8'));
    var to_load = EJSON.parse(fs.readFileSync('../packages/seed-json/web-str-json/_s_to_load.json', 'utf-8'));
    if (s_json && keys_json && to_load) {
      var n_s_json = [];
      this.col.remove({});
      var keys_obj = this.seed_keys(keys_json);
      this.col.insert(keys_obj);
      //this.write_file(keys_obj, 'temp/keys.json');
      this.seed_schema(s_json, to_load);

    }
    this.check_all();
    server.close();

  };

  Seed.prototype.fini = function (doc, arr, pa) {
    var path;
    for (var key in doc) {
      if (pa) {
        path = pa + "." + key;
      } else {
        path = key;
      }
      if (_.isPlainObject(doc[key])) {
        arr = this.fini(doc[key], arr, path);
      } else {
        var jj = {value: doc[key], path: path};
        arr.push(jj);
      }
    }
    return arr;
  };

  Seed.prototype.fin = function (doc, s_n) {
    var obj = {};
    obj.s_n = s_n;
    obj.arr = [];
    obj.arr = this.fini(doc, obj.arr);
    return obj.arr;

  };

  Seed.prototype.check_all = function () {
    var self = this;
    var log = [];
    self.col.find({_s_n: "_s", _s_n_for: {$nin: ["_s", "keys"]}}).forEach(function (s_n) {
      var keys = self.col.find({_s_n: "keys", key_n: {$in: s_n._s_keys}}).toArray();
      self.col.find({_s_n: s_n._s_n_for}).forEach(function (doc) {
        var arr = self.fin(doc, s_n._s_n_for);
        for(var i = 0; i < arr.length; i++) {
          if ((s_n._s_keys.indexOf(arr[i].path) !== -1)) {

          } else {
            var log_obj = {
              path: arr[i].path,
              value: arr[i].value,
              schema: s_n._s_n_for,
              log_ty: "Key not in Schema"
            };
            log.push(log_obj);

          }
        }
      });
    });
    if (log && log.length > 0) {
      self.write_file(log, 'temp/log.json');
    }
  };

  Seed.prototype.create_obj = function (obj, s_n) {
    obj._usr = "root";
    obj._dt = new Date();
    if (!obj._id) {
      obj._id = random.id();
    }
    if (s_n) {
      obj._s_n = s_n;
    }
    return obj;
  };

  Seed.prototype.combine_def = function (defa, obj) {
    var def = EJSON.clone(defa);
    for (var def_key in def) {
      if (obj[def_key]) {
        if (_.isPlainObject(obj[def_key])) {
          this.combine_def(def[def_key], obj[def_key]);
        } else if (_.isArray(obj[def_key])) {
          obj[def_key] = _.union(obj[def_key], def[def_key]);
        } else if (def_key === "class") {
          obj[def_key] = obj[def_key] + " " + def[def_key];
        }

      } else {
        obj[def_key] = def[def_key];
      }

    }
  };

  Seed.prototype.seed_s_json_tri = function (arr, filter, s_n) {
    var tri_defaults = EJSON.parse(fs.readFileSync('../packages/seed-json/web-str-json/_tri_defaults.json', 'utf-8'));
    for(var i = 0; i < arr.length; i++) {
      if (filter.indexOf(arr[i]._n) === -1) {
        arr.splice(i, 1);
      } else {
        var json_path = '../packages/seed-json/' + arr[i].path;
        var json = EJSON.parse(fs.readFileSync(json_path, 'utf-8'));
        for(var m = 0; m < json.length; m++) {
          if (tri_defaults[json[m]._tri_ty]) {
            this.combine_def(tri_defaults[json[m]._tri_ty], json[m]);

          }
          this.create_obj(json[m], s_n);

        }
        this.col.insert(json);
      }
    }

  };

  Seed.prototype.seed_s_json = function (arr, filter, s_n) {
    for(var i = 0; i < arr.length; i++) {
      if (filter.indexOf(arr[i]._n) === -1) {
        arr.splice(i, 1);
      } else {
        var json_path = '../packages/seed-json/' + arr[i].path;
        var json = EJSON.parse(fs.readFileSync(json_path, 'utf-8'));
        for(var m = 0; m < json.length; m++) {
          this.create_obj(json[m], s_n);
        }
        this.col.insert(json);
      }
    }

  };

  Seed.prototype.seed_schema = function (s_json, to_load) {
    var n_s_json = [];
    for(var i = 0; i < s_json.length; i++) {
      if (to_load[s_json[i]._s_n_for]) {
        if (s_json[i]._s_n_for === "_tri") {
          this.seed_s_json_tri(s_json[i].json, to_load[s_json[i]._s_n_for], s_json[i]._s_n_for);
        } else {
          this.seed_s_json(s_json[i].json, to_load[s_json[i]._s_n_for], s_json[i]._s_n_for);
        }
        this.create_obj(s_json[i]);
        n_s_json.push(s_json[i]);
      } else if ((s_json[i]._s_n_for === "_s") || (s_json[i]._s_n_for === "keys")) {
        this.create_obj(s_json[i]);
        n_s_json.push(s_json[i]);
      }

    }
    this.col.insert(n_s_json);
  };

  Seed.prototype.write_file = function (obj, path_to) {
    var ejson = EJSON.stringify(obj, {indent: true});
    var pp = path.resolve(__dirname, path_to);
    fs.writeFileSync(pp, ejson);

  };

  Seed.prototype.create_key_arr = function (key_obj) {
    var obj = EJSON.clone(key_obj);
    obj.key_n = obj.key_n + "_arr";
    obj._dt = new Date();
    if (!obj._id) {
      obj._id = random.id();
    }
    return obj;

  };

  Seed.prototype.seed_keys = function (keys_json) {
    if (keys_json && Array.isArray(keys_json)) {
      var arr = [];
      for(var i = 0; i < keys_json.length; i++) {
        keys_json[i]._s_n = "keys";
        keys_json[i]._usr = "root";
        if (keys_json[i].key_arr === true) {
          var obj = this.create_key_arr(keys_json[i]);
          arr.push(obj);
          delete keys_json[i].key_arr;
        }
        keys_json[i]._dt = new Date();
        if (!keys_json[i]._id) {
          keys_json[i]._id = random.id();
        }

      }
      var json = keys_json.concat(arr);
      return json;
    }

  };

  exports.seed = function () {
    return new Seed();
  };

}());
