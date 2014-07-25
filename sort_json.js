(function () {
  "use strict";

  var fs = require('fs'),
    path = require('path'),
    arr = [];

  var json_path = "../seed-json/essential-list-json/keys.json";

  var sort_key = "key_n";

  var json = JSON.parse(fs.readFileSync(json_path));

  var sort_by_key = function(array, key) {
    return array.sort(function(a, b) {
      var x = a[key];
      var y = b[key];

      if (typeof x == "string")
      {
        x = x.toLowerCase();
        y = y.toLowerCase();
        if (x.substr(0, 1) == "_") {
          x = x.substr(1);
        }
        if (y.substr(0, 1) == "_") {
          y = y.substr(1);
        }
      }

      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
  };

  if (json && Array.isArray(json)) {
    json = sort_by_key(json, sort_key);
    var json_path_n = json_path.replace(".json", "_back.json");
    var str = JSON.stringify(json, null, " ");
    fs.renameSync(json_path, json_path_n);
    fs.writeFileSync(json_path, str);
  } else {
    console.log("file is not json");
  }

  console.log("done");

}());
