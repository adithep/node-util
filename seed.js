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

  var db_obj = {
    marathon: "marathon-str-json",
    alpha_sys: "alphas-str-json"
  };



  function Seed() {}

  Seed.prototype.seed_all = function (database) {
    if (db_obj[database]) {
      this.database = database;
      var server = new Server('127.0.0.1:27017');
      this.col = server.db(database).getCollection("data");
      var s_json = EJSON.parse(fs.readFileSync('../json/_s.json', 'utf-8'));
      var keys_json = EJSON.parse(fs.readFileSync('../json/keys.json', 'utf-8'));
      var to_load = EJSON.parse(fs.readFileSync('../json/'+db_obj[database]+'/_s_to_load.json', 'utf-8'));
      if (s_json && keys_json && to_load) {
        var n_s_json = [];
        this.col.remove({});
        var key_s_obj = this.seed_schema(s_json, to_load);
        var keys_obj = this.seed_keys(keys_json, key_s_obj, to_load);
        this.col.insert(keys_obj);
        //this.write_file(keys_obj, 'temp/keys.json');

        this.check_all();

      }

      server.close();
    }


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

  Seed.prototype.check_keys = function (s_key, schema, log) {
    var keys = {};
    for(var i = 0; i < s_key.length; i++) {
      var kar = this.col.findOne({_s_n: "keys", key_n: s_key[i]});
      if (kar) {
        keys[kar.key_n] = kar;
      } else {
        var log_obj = {
          key_n: s_key[i],
          schema: schema,
          log_ty: "Key not exist"
        };
        log.push(log_obj);
      }
    }
    return keys;
  };

  Seed.prototype.value_check = function (key, value, schema, log) {
    var log_obj, i, obj;
    if (key, value, schema) {
      switch(key.key_ty) {
        case "_st":
          if (key.key_arr) {
            if(Array.isArray(value)) {
              for(i = 0; i < value.length; i++) {
                if ((typeof value === "string") && (String(value) !== "")) {
                  if (key.key_r) {
                    if (key.key_s && key.key_key) {
                      obj = {};
                      obj._s_n = key.key_s;
                      obj[key.key_key] = value;
                      if (this.col.find(obj).count()===0) {
                        log_obj = {
                          schema: schema,
                          key: key.key_n,
                          log_ty: "cannot find r_value"
                        };
                        log.push(log_obj);
                      }
                    } else {
                      log_obj = {
                        schema: schema,
                        key: key.key_n,
                        log_ty: "no key_s or key_key"
                      };
                      log.push(log_obj);
                    }

                  }
                } else {
                  log_obj = {
                    schema: schema,
                    key: key.key_n,
                    log_ty: "key_ty mismatched"
                  };
                  log.push(log_obj);
                }
              }
            } else {
              log_obj = {
                schema: schema,
                key: key.key_n,
                log_ty: "Value is not Array"
              };
              log.push(log_obj);
            }
          }
          break;
        case "_num":
          if (key.key_arr) {
            if(Array.isArray(value)) {
              for(i = 0; i < value.length; i++) {
                if ((typeof value === "number") && (isNaN(value) === false)) {
                  if (key.key_r) {
                    if (key.key_s && key.key_key) {
                      obj = {};
                      obj._s_n = key.key_s;
                      obj[key.key_key] = value;
                      if (this.col.find(obj).count()===0) {
                        log_obj = {
                          schema: schema,
                          key: key.key_n,
                          log_ty: "cannot find r_value"
                        };
                        log.push(log_obj);
                      }
                    } else {
                      log_obj = {
                        schema: schema,
                        key: key.key_n,
                        log_ty: "no key_s or key_key"
                      };
                      log.push(log_obj);
                    }

                  }
                } else {
                  log_obj = {
                    schema: schema,
                    key: key.key_n,
                    log_ty: "key_ty mismatched"
                  };
                  log.push(log_obj);
                }
              }
            } else {
              log_obj = {
                schema: schema,
                key: key.key_n,
                log_ty: "Value is not Array"
              };
              log.push(log_obj);
            }
          }
          break;
        case "_bl":
          if (key.key_arr) {
            if(Array.isArray(value)) {
              for(i = 0; i < value.length; i++) {
                if ((typeof value === "boolean")) {
                  if (key.key_r) {
                    if (key.key_s && key.key_key) {
                      obj = {};
                      obj._s_n = key.key_s;
                      obj[key.key_key] = value;
                      if (this.col.find(obj).count()===0) {
                        log_obj = {
                          schema: schema,
                          key: key.key_n,
                          log_ty: "cannot find r_value"
                        };
                        log.push(log_obj);
                      }
                    } else {
                      log_obj = {
                        schema: schema,
                        key: key.key_n,
                        log_ty: "no key_s or key_key"
                      };
                      log.push(log_obj);
                    }

                  }
                } else {
                  log_obj = {
                    schema: schema,
                    key: key.key_n,
                    log_ty: "key_ty mismatched"
                  };
                  log.push(log_obj);
                }
              }
            } else {
              log_obj = {
                schema: schema,
                key: key.key_n,
                log_ty: "Value is not Array"
              };
              log.push(log_obj);
            }
          }
          break;
        case "currency":
          if (key.key_arr) {
            if(Array.isArray(value)) {
              for(i = 0; i < value.length; i++) {
                if ((typeof value === "number") && (isNaN(value) === false)) {
                  if (key.key_r) {
                    if (key.key_s && key.key_key) {
                      obj = {};
                      obj._s_n = key.key_s;
                      obj[key.key_key] = value;
                      if (this.col.find(obj).count()===0) {
                        log_obj = {
                          schema: schema,
                          key: key.key_n,
                          log_ty: "cannot find r_value"
                        };
                        log.push(log_obj);
                      }
                    } else {
                      log_obj = {
                        schema: schema,
                        key: key.key_n,
                        log_ty: "no key_s or key_key"
                      };
                      log.push(log_obj);
                    }

                  }
                } else {
                  log_obj = {
                    schema: schema,
                    key: key.key_n,
                    log_ty: "key_ty mismatched"
                  };
                  log.push(log_obj);
                }
              }
            } else {
              log_obj = {
                schema: schema,
                key: key.key_n,
                log_ty: "Value is not Array"
              };
              log.push(log_obj);
            }
          }
          break;
        default:
      }
    }

  };

  Seed.prototype.check_all = function () {
    var self = this;
    var log = [];
    self.col.find({_s_n: "_s", _s_n_for: {$nin: ["_s", "keys"]}}).forEach(function (s_n) {
      var keys = self.check_keys(s_n._s_keys, s_n._s_n_for, log);
      self.col.find({_s_n: s_n._s_n_for}).forEach(function (doc) {
        for(var doc_k in doc) {
          if ((s_n._s_keys.indexOf(doc_k) !== -1)) {
            var key_obj = keys[doc_k];
            //self.value_check(keys[doc_k], doc[doc_k], s_n._s_n_for, log);
          } else {
            var log_obj = {
              key: doc_k,
              value: doc[doc_k],
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
    } else {
      self.write_file(["empty"], 'temp/log.json');
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
    var tri_defaults = EJSON.parse(fs.readFileSync('../json/'+db_obj[this.database]+'/_tri_defaults.json', 'utf-8'));
    for(var i = 0; i < arr.length; i++) {
      if (filter.indexOf(arr[i]._n) === -1) {
        arr.splice(i, 1);
      } else {
        var json_path = '../json/'+db_obj[this.database]+'/' + arr[i].path;
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

  Seed.prototype.seed_s_json = function (arr, filter, s_n, opt) {
    var json_path;
    for(var i = 0; i < arr.length; i++) {
      if (filter.indexOf(arr[i]._n) === -1) {
        arr.splice(i, 1);
      } else {
        if (opt) {
          json_path = '../json/'+db_obj[this.database]+'/' + arr[i].path;
        } else {
          json_path = '../json/' + arr[i].path;
        }

        var json = EJSON.parse(fs.readFileSync(json_path, 'utf-8'));
        for(var m = 0; m < json.length; m++) {
          this.create_obj(json[m], s_n);
        }
        this.col.insert(json);
      }
    }

  };
  Seed.prototype.seed_schema = function (s_json, to_load) {
    var key_s_obj = [];
    var n_s_json = [];
    for(var i = 0; i < s_json.length; i++) {
      if (to_load[s_json[i]._s_n_for]) {
        if (s_json[i]._s_n_for === "_tri") {
          this.seed_s_json_tri(s_json[i].json, to_load[s_json[i]._s_n_for], s_json[i]._s_n_for);
        } else if (s_json[i].web_spec) {
          this.seed_s_json(s_json[i].json, to_load[s_json[i]._s_n_for], s_json[i]._s_n_for, true);
        } else {
          this.seed_s_json(s_json[i].json, to_load[s_json[i]._s_n_for], s_json[i]._s_n_for);
        }
        this.create_obj(s_json[i]);
        key_s_obj = _.union(key_s_obj, s_json[i]._s_keys);
        n_s_json.push(s_json[i]);
      } else if ((s_json[i]._s_n_for === "_s") || (s_json[i]._s_n_for === "keys")) {
        this.create_obj(s_json[i]);
        key_s_obj = _.union(key_s_obj, s_json[i]._s_keys);
        n_s_json.push(s_json[i]);
      }


    }

    this.col.insert(n_s_json);
    return key_s_obj;
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

  Seed.prototype.seed_keys = function (keys_json, key_s_obj, to_load) {
    if (keys_json && Array.isArray(keys_json)) {
      var arr = [];
      for(var i = 0; i < keys_json.length; i++) {

          keys_json[i]._s_n = "keys";
          keys_json[i]._usr = "root";

          if (keys_json[i].key_r === true) {
            if (!to_load[keys_json[i].key_s]) {
              delete keys_json[i].key_r;
              delete keys_json[i].key_s;
              delete keys_json[i].key_key;
            }
          }
          if (keys_json[i].key_arr === true) {
            var obj = this.create_key_arr(keys_json[i]);
            if (key_s_obj.indexOf(obj.key_n) !== -1 ) {
              arr.push(obj);
            }
            delete keys_json[i].key_arr;
          }
          keys_json[i]._dt = new Date();
          if (!keys_json[i]._id) {
            keys_json[i]._id = random.id();
          }
          if (key_s_obj.indexOf(keys_json[i].key_n) !== -1 ) {
            arr.push(keys_json[i]);
          }


      }
      return arr;
    }

  };

  exports.seed = function () {
    return new Seed();
  };

}());
