(function (module) {
    "use strict";

    var spawn = require('child_process').spawn,
        counter = 0;

    module.exports = function (logger, command, args, cb) {
        var count = ++ counter,
            cmd;

        logger.info("launching", {
            count: count,
            command: command,
            args: args
        });

        cmd = spawn(command, args);

        cmd.stdout.on('data', function (data) {
            logger.info(count + ': ' + data);
        });

        cmd.stderr.on('data', function (data) {
            logger.error(count + ': ' + data);
        });

        return cmd.on('exit', function (code) {
            if (code) {
                return cb(new Error("execution failed: " + JSON.stringify({
                    count: count,
                    command: command,
                    args: args,
                    code: code
                })));
            }

            return cb();
        });
    };
})(module);