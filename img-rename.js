(function () {
  "use strict";

  var walk = require('walk'),
    fs = require('fs'),
    path = require('path'),
    options,
    walker,
    EJSON = require('./ejson'),
    random = require('./random').random(),
    arr = [],
    //img_dir = "/Users/alpha/Dropbox/static/img",
    json = fs.readFileSync("../json/img.json", 'utf-8');
    json = EJSON.parse(json);

  // To be truly synchronous in the emitter and maintain a compatible api,
  // the listeners must be listed before the object is created
  options = {
    listeners: {
      names: function (root, nodeNamesArray) {
      },
      directories: function (root, dirStatsArray, next) {
        // dirStatsArray is an array of `stat` objects with the additional attributes
        // * type
        // * error
        // * name

        next();
      },
      file: function (root, fileStats, next) {

        for (var i = 0; i < json.length; i++) {
          if (json[i].img_uuid === fileStats.name) {
            var ran = random.id();
            var pp = path.resolve(root, fileStats.name);
            var name = ran + ".jpg";
            var np = path.resolve(root, name);
            json[i]._id = ran;
            fs.renameSync(pp, np);
          }
        }

      },
      errors: function (root, nodeStatsArray, next) {
        next();
      }
    }
  };

  walker = walk.walkSync(img_dir, options);
  var ejson = EJSON.stringify(json, {indent: true});
  var pp = path.resolve(__dirname, "img.json");
  fs.writeFileSync(pp, ejson);
  console.log("done");

}());
