(function (module) {
    "use strict";

    var command = require('./command');

    module.exports = function (logger, respository, cb) {
        var runner = arguments[3] || command; // support better testing.

        return runner(logger, [
            {
                cmd:"git",
                args:["clone", respository, "."]
            },
            {
                cmd:"npm",
                args:["install", "-d"]
            }
        ], {
            "NODE_ENV":"production"
        }, cb);
    };
})(module);