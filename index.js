(function () {
    "use strict";

    var deployer = require('./lib/deployer');

    return deployer(function(err) {
        if (err) {
            console.error("deploy failed", err);
        }
    });
})();
