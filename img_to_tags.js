(function () {
  "use strict";

  var walk = require('walk')
    , fs = require('fs')
    , options
    , walker
    , arr = []
    ;
  var obj = {
    "Aetas Residence": "ELwKPCaJARdyYFkzq",
    "Sarawan Condominium": "FuvWq2sGea3bxSeQM",
    "Seacon Square": "D6D4RiZQZ7nQFqS27",
    "The Promenade": "t6WFM8CCgGiD3TC5L",
    "Mccann": "FGADmqtBKdT5Amxyk",
    "Right Man": "jucfEpoga6MgdW2vT",
    "Laad Prao Office": "jdi37ZrXd6z9FDziX",
    "Zen": "EmCxofXsebsXQHJLY",
    "Air Bar": "vFD4jn97ez4Em7Tr4",
    "Moon Bar": "5QSJaYoCNCarWrc7y",
    "The Roof": "KMSLHowfDHZqNtGe7",
    "Ananta": "NpTRr8hX5ueask3mW",
    "The Scene": "oWZuGMmvMQttrMT2a"
  };

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

  // To be truly synchronous in the emitter and maintain a compatible api,
  // the listeners must be listed before the object is created
  options = {
    listeners: {
      names: function (root, nodeNamesArray) {
      }
    , directories: function (root, dirStatsArray, next) {
        // dirStatsArray is an array of `stat` objects with the additional attributes
        // * type
        // * error
        // * name

        next();
      }
    , file: function (root, fileStats, next) {
        var rr = root.replace("./tem/", "");

        if (obj[rr]) {
          var lo = {
            img_uuid: fileStats.name,
            location_id_arr: [obj[rr]],
            location_ty_n_arr: [rr],
            country_n_arr: ["Thailand"],
            city_n_arr: ["Bangkok"]
          };
          arr.push(lo);
        } else {
          console.log("cant " + rr);
        }

      }
    , errors: function (root, nodeStatsArray, next) {
        next();
      }
    }
  };

  walker = walk.walkSync("./tem", options);
  var str = JSON.stringify(arr);
  fs.writeFileSync('tags.json', str);
  console.log("done");
}());
