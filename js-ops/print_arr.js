(function () {

  "use strict";

  var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    EJSON = require('../ejson');

  var jpa = String(process.argv[2]);
  parr(jpa);

  function parr(pp) {
    pp = path.resolve(__dirname, '../../json/', pp);
    var json = EJSON.parse(fs.readFileSync(pp, 'utf-8'));
    if (json) {
      var obj = {
        lo: [],
        lou: [],
        ex: [],
        exu: [],
        pro: [],
        prou: [],
        costume: [],
        costumeu: []
      };

      var jj = json[0].locations;
      for (var key_n in jj) {
        for (var i = 0; i < jj[key_n].length; i++) {
          var doc = jj[key_n][i];
          if (doc.lo) {
            obj.lo.push(doc.lo);
          }
          if (doc.ex) {
            obj.ex = obj.ex.concat(doc.ex);
            obj.exu = _.union(obj.exu, doc.ex);
          }
          if (doc.pro) {
            obj.pro = obj.pro.concat(doc.pro);
            obj.prou = _.union(obj.prou, doc.pro);
          }
          if (doc.costume) {
            obj.costume = obj.costume.concat(doc.costume);
            obj.costumeu = _.union(obj.costumeu, doc.costume);
          }
        }

      }
      obj.lou = _.uniq(obj.lo);
      var ejson = EJSON.stringify(obj, {indent: true});
      var re = /.json$/;
      var str = pp.replace(re, "");
      str = str + "-arrc.json";
      var ppp = path.resolve(__dirname, '../../json/', str);
      fs.writeFileSync(str, ejson);
    }
  }



}());
