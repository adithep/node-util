(function () {

  "use strict";

  var fs = require('fs'),
    path = require('path'),
    EJSON = require('./ejson'),
    random = require('./random').random(),
    phone_format = require('./phoneformat'),
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
  var email_format = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;



  function Seed() {}

  Seed.prototype.seed_all = function () {
    var server = new Server('127.0.0.1:27017');
    this.col = server.db("alphaDB").getCollection("data");
    var s_json = EJSON.parse(fs.readFileSync('../json/_s.json', 'utf-8'));
    var keys_json = EJSON.parse(fs.readFileSync('../json/keys.json', 'utf-8'));
    if (s_json && keys_json) {
      var n_s_json = [];
      this.col.remove({});
      this.seed_keys(keys_json);
      this.seed_schema(s_json);
      //this.write_file(keys_obj, 'temp/keys.json');
      this.custom_sort();
      this.check_all();

    }

    server.close();


  };

  Seed.prototype.custom_sort = function () {
    var self = this;
    self.col.find({_s_n: "apps"}).forEach(function(doc){
      self.col.update(
        {_id: doc._id},
        {$addToSet: {app_n_arr: doc.app_n}}
      );
      if (doc.paths) {
        for (var path_key in doc.paths) {
          self.sort_ctl(doc._id, path_key, doc.paths[path_key], doc.app_n);
        }
      }
    });
  };

  Seed.prototype.tag_data = function (id, str, arr, key, app) {
    var self = this;
    var obj = {};
    obj[str] = arr.indexOf(key);
    self.col.update(
      {_id: id},
      {$addToSet: {app_n_arr: app}, $set: obj}
    );
  };

  Seed.prototype._ctl_loop = function (ctl_obj, app) {
    var self = this;
    if (ctl_obj.data) {
      var query = EJSON.parse(ctl_obj.data);
      if (ctl_obj.data_sort_key && ctl_obj.data_sort_arr) {
        var _ctl_str = 'sort.' + ctl_obj._s_n + '.' + ctl_obj._ctl_n;
        self.col.find(query).forEach(function(data_doc){
          if (data_doc[ctl_obj.data_sort_key]) {
            self.tag_data(data_doc._id, _ctl_str, ctl_obj.data_sort_arr, ctl_obj.data_sort_key, app);
          }
          if (data_doc._s_n === "_ctl") {
            self._ctl_loop(data_doc, app);
          }
        });
        var data = [];
        data[0] = {};
        data[0][_ctl_str] = {$exists: true};
        data[1] = {sort: {}};
        data[1].sort[_ctl_str] = 1;
        var ej_data = EJSON.stringify(data[0]);
        var ej_data1 = EJSON.stringify(data[1]);
        var data_str = ctl_obj._s_n + '.' + ctl_obj._ctl_n;
        self.col.update(
          {_id: ctl_obj._id},
          {$set: {data: ej_data, data_opt: ej_data1}, $unset: {data_cort_arr: "", data_sort_key: ""}}
        );
      } else {
        self.col.find(query).forEach(function(data_doc){
          self.col.update(
            {_id: data_doc._id},
            {$addToSet: {app_n_arr: app}}
          );
          if (data_doc._s_n === "_ctl") {
            self._ctl_loop(data_doc, app);
          }
        });
      }


    }
  };

  Seed.prototype.sort_ctl = function (id, key, arr, app) {
    var self = this;
    var str = 'sort.paths.' + key;
    self.col.find({_s_n: "_ctl", _ctl_n: {$in: arr}}).forEach(function(ctl_obj){
      var obj = {};
      obj[str] = arr.indexOf(ctl_obj._ctl_n);
      self.col.update(
        {_id: ctl_obj._id},
        {$addToSet: {app_n_arr: app}, $set: obj}
      );
      self._ctl_loop(ctl_obj, app);
    });
    var data = [];
    data[0] = {};
    data[0]._s_n = "_ctl";
    data[0][str] = {$exists: true};
    if (arr.indexOf("sub_path") === -1) {
      data[0] = {$or: [{_ctl_n: "sub_path"}, data[0]]};
    }
    data[1] = {sort: {}};
    data[1].sort[str] = 1;
    var ej_data = EJSON.stringify(data[0]);
    var ej_data1 = EJSON.stringify(data[1]);
    var data_str = 'paths.' + key;
    var data_obj = {};
    data_obj[data_str] = {};
    data_obj[data_str].data = ej_data;
    data_obj[data_str].data_opt = ej_data1;
    self.col.update(
      {_id: id},
      {$set: data_obj}
    );

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

  Seed.prototype.find_value = function (key, obj, value, schema, id, log, one) {
    if (key && obj && value && schema) {
      var log_obj;
      var count = this.col.find(obj).count();
      if (count<=0) {
        log_obj = {
          schema: schema,
          key: key.key_n,
          value: obj,
          log_ty: "Cannot find related value, or slave mismatched."
        };
        log.push(log_obj);
      } else if ((count > 1) && one) {
        log_obj = {
          schema: schema,
          key: key.key_n,
          value: obj,
          log_ty: "More than one instance of schema value exists."
        };
        log.push(log_obj);
      }
    }
  };

  Seed.prototype.key_r = function (key, value, schema, id, log) {
    if (key && value && schema) {
      var obj, log_obj, master_obj, master_key;
      if (key.key_r) {
        if (key.key_s && key.key_key) {
          if ((key.key_s !== schema) || ((key.key_n !== key.key_key) && (key.key_s === schema))) {
            obj = {};
            obj._s_n = key.key_s;
            obj[key.key_key] = value;
            if (key.key_slave || key.key_slave_in) {
              master_obj = this.col.findOne({_id: id});
              master_key = this.col.findOne({_s_n: "keys", key_n: key.key_slave});
              if (master_key && master_obj) {
                if (master_key.key_r) {
                  if (master_obj[key.key_slave]) {
                    if (Array.isArray(master_obj[key.key_slave])) {
                      obj[master_key.key_key] = {$in: master_obj[key.key_slave]};
                    } else {
                      obj[master_key.key_key] = master_obj[key.key_slave];
                    }
                  }
                }
              } else {
                log_obj = {
                  schema: schema,
                  key: key.key_n,
                  key_slave: key.key_slave,
                  value: value,
                  log_ty: "Master key for Slave doesn't exist."
                };
                log.push(log_obj);
              }
            }
            this.find_value(key, obj, value, schema, id, log, true);
          }

        } else {
          log_obj = {
            schema: schema,
            key: key.key_n,
            value: value,
            log_ty: "Related key with not key_s or key_key."
          };
          log.push(log_obj);
        }
      } else if (key.key_gr) {
        if (key.key_gr_key) {
          master_obj = this.col.findOne({_id: id});
          if (master_obj[key.key_gr_key]) {
            master_key = this.col.findOne({_s_n: "keys", key_n: master_obj[key.key_gr_key]});
            if (master_key) {
              obj = {};
              obj._s_n = master_key.key_s;
              obj[master_key.key_key] = value;
              this.find_value(key, obj, value, schema, id, log, false);
            } else {
              log_obj = {
                schema: schema,
                key: key.key_n,
                value: value,
                log_ty: "Master key of key_gr not found."
              };
              log.push(log_obj);
            }

          }

        } else {
          log_obj = {
            schema: schema,
            key: key.key_n,
            value: value,
            log_ty: "Key seems to be gr, but no gr_key."
          };
          log.push(log_obj);
        }
      }

    }
  };

  Seed.prototype.user = function (key, value, schema, id, log) {
    if (key && value && schema) {
      if ((typeof value === "string") && (String(value) !== "")) {
        //this.key_r(key, value, schema, id, log);
      } else {
        this.log_key_ty_mismatched(key, value, schema, id, log);
      }
    }
  };

  Seed.prototype._st = function (key, value, schema, id, log) {
    if (key && value && schema) {
      if ((typeof value === "string") && (String(value) !== "")) {
        this.key_r(key, value, schema, id, log);
      } else {
        this.log_key_ty_mismatched(key, value, schema, id, log);
      }
    }
  };

  Seed.prototype.obj = function (key, value, schema, id, log) {
    if (key && value && schema) {
      if (_.isPlainObject(value)) {
        this.key_r(key, value, schema, id, log);
      } else {
        this.log_key_ty_mismatched(key, value, schema, id, log);
      }
    }
  };

  Seed.prototype.sort = function (key, value, schema, id, log) {
    if (key && value && schema) {
      if (_.isPlainObject(value)) {
        this.key_r(key, value, schema, id, log);
      } else {
        this.log_key_ty_mismatched(key, value, schema, id, log);
      }
    }
  };

  Seed.prototype.paths = function (key, value, schema, id, log) {
    if (key && value && schema) {
      if (_.isPlainObject(value)) {
        this.key_r(key, value, schema, id, log);
      } else {
        this.log_key_ty_mismatched(key, value, schema, id, log);
      }
    }
  };

  Seed.prototype.ejson = function (key, value, schema, id, log) {
    if (key && value && schema) {
      this.find_value(key, EJSON.parse(value), value, schema, id, log);
    }
  };

  Seed.prototype.geo_json = function (key, value, schema, id, log) {
    if (key && value && schema) {
      if (_.isPlainObject(value)) {
        //this.key_r(key, value, schema, id, log);
      } else {
        this.log_key_ty_mismatched(key, value, schema, id, log);
      }
    }
  };

  Seed.prototype.evts = function (key, value, schema, id, log) {
    if (key && value && schema) {
      if (Array.isArray(value)) {
      } else {
        this.log_key_ty_mismatched(key, value, schema, id, log);
      }
    }
  };

  Seed.prototype.htag = function (key, value, schema, id, log) {
    if (key && value && schema) {
      if (Array.isArray(value)) {
      } else {
        this.log_key_ty_mismatched(key, value, schema, id, log);
      }
    }
  };

  Seed.prototype._num = function (key, value, schema, id, log) {
    if (key && value && schema) {
      if ((typeof value === "number") && (isNaN(value) === false)) {
        this.key_r(key, value, schema, id, log);
      } else {
        this.log_key_ty_mismatched(key, value, schema, id, log);
      }
    }
  };

  Seed.prototype.currency = function (key, value, schema, id, log) {
    if (key && value && schema) {
      if ((typeof value === "number") && (isNaN(value) === false)) {
        this.key_r(key, value, schema, id, log);
      } else {
        this.log_key_ty_mismatched(key, value, schema, id, log);
      }
    }
  };

  Seed.prototype._dt = function (key, value, schema, id, log) {
    if (key && value && schema) {
      if (value instanceof Date) {
        this.key_r(key, value, schema, id, log);
      } else {
        this.log_key_ty_mismatched(key, value, schema, id, log);
      }
    }
  };

  Seed.prototype.now = function (key, value, schema, id, log) {
    if (key && value && schema) {
      if (value instanceof Date) {
        this.key_r(key, value, schema, id, log);
      } else {
        this.log_key_ty_mismatched(key, value, schema, id, log);
      }
    }
  };

  Seed.prototype.email = function (key, value, schema, id, log) {
    if (key && value && schema) {
      if (email_format.test(value)===true) {
        this.key_r(key, value, schema, id, log);
      } else {
        this.log_key_ty_mismatched(key, value, schema, id, log);
      }
    }
  };

  Seed.prototype.phone = function (key, value, schema, id, log) {
    if (key && value && schema) {
      if (phone_format.isValidNumber(value)===true) {
        this.key_r(key, value, schema, id, log);
      } else {
        this.log_key_ty_mismatched(key, value, schema, id, log);
      }
    }
  };

  Seed.prototype._bl = function (key, value, schema, id, log) {
    if (key && value && schema) {
      if ((typeof value === "boolean")) {
        this.key_r(key, value, schema, id, log);
      } else {
        this.log_key_ty_mismatched(key, value, schema, id, log);
      }
    }
  };

  Seed.prototype.log_key_ty_mismatched = function (key, value, schema, id, log) {
    if (key && value && schema) {
      var log_obj;
      log_obj = {
        schema: schema,
        key: key.key_n,
        key_ty: key.key_ty,
        value: value,
        log_ty: "key_ty mismatched"
      };
      log.push(log_obj);
    }
  };

  Seed.prototype.value_check_arr = function (key, value, schema, id, log) {
    if (key && value && schema) {
      var log_obj;
      if (Array.isArray(value)) {
        for(var i = 0; i < value.length; i++) {
          this[key.key_ty](key, value[i], schema, id, log);
        }
      } else {
        log_obj = {
          schema: schema,
          key: key.key_n,
          value: value,
          log_ty: "Key is Arrray but value is not."
        };
        log.push(log_obj);
      }

    }
  };

  Seed.prototype.value_check = function (key, value, schema, id, log) {
    if (key && value && schema) {
      var log_obj;
      if (this[key.key_ty]) {
        if (key.key_arr) {
          this.value_check_arr(key, value, schema, id, log);
        } else {
          this[key.key_ty](key, value, schema, id, log);
        }
      } else {
        log_obj = {
          schema: schema,
          key: key.key_n,
          key_ty: key.key_ty,
          value: value,
          log_ty: "No function for key type."
        };
        log.push(log_obj);
      }

    }
  };

  Seed.prototype.check_all = function () {
    var self = this;
    var log = [];
    self.col.find({_s_n: "_s", _s_n_for: {$nin: ["_s", "keys", "cities", "translations"]}}).forEach(function (s_n) {
      var keys = self.check_keys(s_n._s_keys, s_n._s_n_for, log);
      console.log("checking " + s_n._s_n_for);
      console.time(s_n._s_n_for+" checked in");
      self.col.find({_s_n: s_n._s_n_for}).forEach(function (doc) {
        for(var doc_k in doc) {
          if ((s_n._s_keys.indexOf(doc_k) !== -1)) {
            var key_obj = keys[doc_k];
            self.value_check(keys[doc_k], doc[doc_k], s_n._s_n_for, doc._id, log);
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
      console.timeEnd(s_n._s_n_for+" checked in");
      var log_str = "log/log-"+s_n._s_n_for+".json";
      if (log && log.length > 0) {
        self.write_file(log, log_str);
      } else {
        var pp = path.resolve(__dirname, log_str);
        if (fs.existsSync(pp)) {
          fs.unlinkSync(pp);
        }
      }
      log = [];
    });
  };

  Seed.prototype._ctl_extra = function (obj, s_n) {
    if (obj.data) {
      obj.data = EJSON.stringify(obj.data);
    }
    if (obj.slave_data) {
      obj.slave_data = EJSON.stringify(obj.slave_data);
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

  Seed.prototype.seed_s_json_ctl = function (arr, s_n) {
    for(var i = 0; i < arr.length; i++) {
      var json_path = '../json/' + arr[i].path;
      var json = EJSON.parse(fs.readFileSync(json_path, 'utf-8'));
      for(var m = 0; m < json.length; m++) {
        this.create_obj(json[m], s_n);
        this._ctl_extra(json[m], json[m]);

      }
      this.col.insert(json);
    }

  };

  Seed.prototype.seed_s_json = function (arr, s_n) {
    var json_path;
    for(var i = 0; i < arr.length; i++) {

      if (arr[i].path) {

        json_path = '../json/' + arr[i].path;
        var json = EJSON.parse(fs.readFileSync(json_path, 'utf-8'));
        if (Array.isArray(json) && json.length > 0) {
          for(var m = 0; m < json.length; m++) {
            this.create_obj(json[m], s_n);
          }
          this.col.insert(json);
        }

      }
    }

  };

  Seed.prototype.seed_schema = function (s_json) {
    var n_s_json = [];
    for(var i = 0; i < s_json.length; i++) {

      if ((s_json[i]._s_n_for === "_s") || (s_json[i]._s_n_for === "keys")) {
        this.create_obj(s_json[i]);
        n_s_json.push(s_json[i]);
      } else {
        console.log("seeding "+ s_json[i]._s_n_for);
        console.time(s_json[i]._s_n_for+" seeded in");
        if (s_json[i]._s_n_for === "_ctl") {
          this.seed_s_json_ctl(s_json[i].json , s_json[i]._s_n_for);
        } else {
          this.seed_s_json(s_json[i].json, s_json[i]._s_n_for);
        }
        this.create_obj(s_json[i]);
        n_s_json.push(s_json[i]);
        console.timeEnd(s_json[i]._s_n_for+" seeded in");
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
    if (obj.key_slave) {
      obj.key_slave = obj.key_slave + "_arr";
    }
    if (!obj._id) {
      obj._id = random.id();
    }
    return obj;

  };

  Seed.prototype.seed_keys = function (keys_json) {
    if (keys_json && Array.isArray(keys_json)) {
      console.log("seeding keys");
      console.time("keys seeded in");
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
          arr.push(keys_json[i]);

      }
      this.col.insert(arr);
      console.timeEnd("keys seeded in");
    }

  };

  exports.seed = function () {
    return new Seed();
  };

}());
