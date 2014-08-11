(function () {

  "use strict";

  var seed = require('./seed').seed();
  var hbuild = require('./path-htlm').build();
  seed.seed_all("marathon");
  hbuild.build("marathon");


}());
