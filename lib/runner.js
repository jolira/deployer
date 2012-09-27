(function (module) {
    "use strict";

    var command = require('./command');

    module.exports = function (logger, config, cb) {
        var runner = arguments[3] || command; // support better testing.

        return runner(logger, [{
            cmd: config.command.cmd,
            args: config.command.args
        }], cb);
    };
})(module);