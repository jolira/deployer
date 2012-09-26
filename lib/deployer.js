(function (module, JSON) {
    "use strict";

    var config = require("./config");

    function merge(cfg1, cfg2) {
        var keys = Object.keys(cfg2);

        keys.forEach(function(key) {
            cfg1[key] = cfg2[key];
        });

        return cfg1;
    }

    function parseUserData(logger, data) {
        if (data === '{') {
            try {
                return JSON.parse(data);
            }
            catch(e) {
                logger.error("failed to parse", data, e);

                return undefined;
            }
        }

        return data && {
            file: data
        };
    }

    function loadLocalFile(logger, config, file, cb) {

    }

    function loadFile(logger, config, cb) {
        if (!config.file) {
            return logger.error("no configuration file specified");
        }

        var matched = config.file.match(/^\s*s3\:\/\/([^\/]+)\/(.*)\s*$/);

        if (matched) {
            return loadS3File(logger, config, matched[1], matched[2], cb);
        }

        matched = config.file.match(/^\s*file\:\/(.*)\s*$/);

        if (!matched) {
            return loadS3File(logger, config, matched[1], matched[2], cb);
        }

        return loadLocalFile(logger, config, matched[1], cb);
    }

    function execute(logger, config) {
        var parsed = parseUserData(logger, config["user-data"]);

        if (!parsed) {
            return logger.error("no user-data specified");
        }

        return loadFile(logger, merge(config, parsed), function(err, config) {

        });
    }

    module.exports = function() {
        return config(function(err, config) {
            if (err) {
                return console.error("deployer failed", err);
            }

            var logger = require("jolira-logger")(config),
                err = "",
                msg = "";

            logger.info("deploying configuration", config);

            if (logger.awsLogging) {
                process.stdout.write = function(message) {
                    msg += message;

                    var lines = msg.split("\n");

                    if (lines.length > 1) {
                        msg = lines.pop();

                        logger.error("npm", lines);
                    }
                };
                process.stderr.write = function(message) {
                    err += message;

                    var lines = err.split("\n");

                    if (lines.length > 1) {
                        err = lines.pop();

                        logger.error("npm", lines);
                    }
                };
            }

            return execute(logger, config);
        });
    };
})(module, JSON);