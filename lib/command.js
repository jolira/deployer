(function (module, process) {
    "use strict";

    var spawn = require('child_process').spawn,
        counter = 0;

    function merge(cfg1, cfg2) {
        var keys1 = Object.keys(cfg1),
            keys2 = Object.keys(cfg2),
            result = {};

        keys1.forEach(function(key) {
            result[key] = cfg1[key];
        });
        keys2.forEach(function(key) {
            result[key] = cfg2[key];
        });

        return result;
    }

    function execute(logger, command, args, env, cb) {
        var count = ++ counter,
            childEnv = merge(process.env, env),
            cmd;

        logger.info("launching", {
            count: count,
            command: command,
            args: args,
            env: env
        });

        cmd = spawn(command, args, {
            pwd: process.pwd,
            env: childEnv
        });

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
    }

    function sync(logger, commands, env, cb) {
        var command = commands.shift();

        if (!command) {
            return cb();
        }

        return execute(logger, command.cmd, command.args || [], env || {}, function (err) {
            if (err) {
                return cb(err);
            }

            return sync(logger, commands, env, cb);
        });
    }

    module.exports = sync;
})(module, process);