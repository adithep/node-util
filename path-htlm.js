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



  function BuildH() {}

  BuildH.prototype.build = function (database) {
    this.database = database;
    var server = new Server('127.0.0.1:27017');
    this.col = server.db(database).getCollection("data");
    var tem_str = this.each_tem();
    this.write_file(tem_str, '../packages/bads:alpha-layout/atem.html');
    server.close();
  };

  BuildH.prototype.write_file = function (obj, path_to) {
    var pp = path.resolve(__dirname, path_to);
    fs.writeFileSync(pp, obj);

  };

  BuildH.prototype.tem_loop = function (arr, html, tem_n, options) {
    var cla, th, tem;
    var opts = options || {};

    for (var i = 0; i < arr.length;i++) {
      if (arr[i].tem_comp) {
        html = this.tem_loop(arr[i].tem_comp, html, {client: opts.client});
      }
      if (opts.top) {
        if (opts.client === "htmc") {
          cla = arr[i].class + " " + "{{get_evt}}";
        } else if (opts.client === "html") {
          cla = arr[i].class + " " + "{{get_look}}";
        }
      } else {
        cla = arr[i].class;
      }
      if (arr[i].tag === "img") {
        th = "<" + arr[i].tag + " " + "class='" + cla +"' src='{{_sel_img}}'>";
      } else {
        th = "<" + arr[i].tag + " " + "class='" + cla +"'>";
        if (html) {
          th = th + html;
        }
        th = th + "</" + arr[i].tag + ">";
      }
      if (html === "{{_sel_doc}}") {
        th = "{{>dis_key}}" + th;
      }
      if (opts.top && opts.client === "htmc") {
        th = "<a href='{{get_href}}'>" + th + "</a>";
      }
    }
    if (opts.top) {
      if (opts.client === "htmc") {
        th = "{{#each k_yield}}"+th+"{{/each}}";
      }
      th = "<template name='"+tem_n+"'>"+th+"</template>";
    }

    return th;
  };

  BuildH.prototype.each_tem = function () {
    var tem_str = "";
    var self = this;
    this.col.find({_s_n: "templates"}).forEach(function(doc){
      if (doc.tem_comp) {
        var html, htmc, tem_n, tem_c;
        html = "{{#each t_yield}}{{>_sel_spa}}{{/each}}";
        tem_n = doc.tem_ty_n;
        html = self.tem_loop(doc.tem_comp, html, tem_n, {client: 'html', top: true});
        tem_str = tem_str+html;
        if (doc.doc_comp) {
          var comp = self.col.findOne({_s_n: "templates", tem_ty_n: doc.doc_comp});
          if (comp.tem_comp) {
            htmc = "{{_sel_doc}}";
            tem_c = doc.tem_ty_n + "_c";
            htmc = self.tem_loop(comp.tem_comp, htmc, tem_c, {client: 'htmc', top: true});
            tem_str = tem_str+htmc;
          }
        }

      }
    });
    return tem_str;
  };

  exports.build = function () {
    return new BuildH();
  };

}());
