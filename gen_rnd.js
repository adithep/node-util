(function () {

  "use strict";

  var fs = require('fs'),
    path = require('path'),
    EJSON = require('./ejson'),
    random = require('./random').random();

  var num = Number(process.argv[2]);

  if (num && !isNaN(num)) {
    for (var i = 0; i < num; i++) {
      console.log(random.id());
    }
  }

}());
