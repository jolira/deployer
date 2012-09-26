(function (module) {
    "use strict";

    var command = require('./command');

    module.exports = function (logger, app, cb) {
        var runner = arguments[3] || command; // support better testing.

        return runner(logger, [{
            cmd: "git",
            args: ["clone", app, "."]
        }, {
            cmd: "npm",
            args: ["install", "-d"]
        }], cb);
    };
})(module);