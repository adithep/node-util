(function () {

  "use strict";

  var seed = require('./seed').seed();
  var hbuild = require('./path-htlm').build();
  seed.seed_all();
  hbuild.build();


}());
