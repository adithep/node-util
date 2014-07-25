(function () {
  "use strict";

  var fs = require('fs'),
    path = require('path'),
    arr = [];

  var main_json_path = "../seed-json/essential-list-json/currencies.json";

  var main_key = "currency_c";

  var json_arr_path = [
    {path: "../seed-json/essential-list-json/country_currency.json", key: "country_n"}
  ];

  var json = JSON.parse(fs.readFileSync(main_json_path));

  var get_index = function(array, attr, value) {
    for(var i = 0; i < array.length; i++) {
      if(array[i].hasOwnProperty(attr) && array[i][attr] === value) {
        return i;
      }
    }
    return -1;
  };

  if (json && Array.isArray(json)) {

    for (var i = 0; i < json_arr_path.length; i++) {
      var jj = JSON.parse(fs.readFileSync(json_arr_path[i].path));
      var key2 = json_arr_path[i].key + "_arr";
      if (jj && Array.isArray(jj)) {
        for (var j = 0; j < jj.length; j++) {
          var index = get_index(json, main_key, jj[j][main_key]);
          if (json[index][key2] && Array.isArray(json[index][key2])) {
            json[index][key2].push(jj[j][json_arr_path[i].key]);
          } else {
            json[index][key2] = [jj[j][json_arr_path[i].key]];
          }

        }
      }
    }
    var json_path_n = main_json_path.replace(".json", "_back.json");
    fs.renameSync(main_json_path, json_path_n);
    var str = JSON.stringify(json, null, "  ");
    fs.writeFileSync(main_json_path, str);

  } else {
    console.log("file is not json");
  }

  console.log("done");

}());
