(function () {

  "use strict";

  var fs = require('fs'),
    path = require('path');

  var obj2 = {
    "Aetas Residence": "Condo",
    "Sarawan Condominium": "Condo",
    "Seacon Square": "Mall",
    "The Promenade": "Mall",
    "Mccann": "Office",
    "Right Man": "Office",
    "Laad Prao Office": "Office",
    "Zen": "Restaruant",
    "Air Bar": "Restaruant",
    "Moon Bar": "Restaruant",
    "The Roof": "Restaruant",
    "Ananta": "Restaruant",
    "The Scene": "Mall"
  };

  function JSMOD(path) {
    var json = JSON.parse(fs.readFileSync(path));
    for(var i = 0; i < json.length; i++) {
      if (json[i].location_ty_n_arr && json[i].location_ty_n_arr[0]) {
        json[i].location_n_arr = [];
        json[i].location_n_arr[0] = json[i].location_ty_n_arr[0];
        json[i].location_ty_n_arr[0] = obj2[json[i].location_ty_n_arr[0]];
      }
    }
    var json_path_n = path.replace(".json", "_back.json");
    fs.renameSync(path, json_path_n);
    var str = JSON.stringify(json, null, "  ");
    fs.writeFileSync(path, str);
  }

  exports.json_mod = function (path, opts) {
    return new JSMOD(path);
  };



}());
