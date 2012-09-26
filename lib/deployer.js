(function (module, JSON) {
    "use strict";

    var runner = require("./runner"),
        provision = require("./provision"),
        config = require("./config"),
        fs = require('fs');

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

    function loadLocalFile(logger, file, cb) {
        logger.info("using local file", file);

        return fs.readFile(file, 'utf8', function(err, content) {
            if (err) {
                return cb(err);
            }

            try {
                return cb(undefined, JSON.parse(content));
            }
            catch(e) {
                return cb(e);
            }
        });
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

        return loadLocalFile(logger, matched[1], function(err, data) {
            if (err) {
                return cb(err);
            }

            var merged = merge(config, data);

            return cb(undefined, merged);
        });
    }

    function execute(logger, config, provision, run, cb) {
        var parsed = parseUserData(logger, config["user-data"]);

        if (!parsed) {
            return cb(new Error("no user-data specified"));
        }

        return loadFile(logger, merge(config, parsed), function(err, config) {
            if (err) {
                return cb(err);
            }

            return provision(logger, config.repository, function(err) {
                if (err) {
                    return cb(err);
                }

                return run(logger, config, cb);
                return run(logger, config, cb);
            });
        });
    }

    module.exports = function(cb) {
        var cfg = arguments[1] || config,
            prvson = arguments[2] || provision,
            rnnr = arguments[3] || runner; // for unit testing

        return cfg(function(err, config) {
            if (err) {
                return cb(err);
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

            return execute(logger, config, prvson, rnnr, function(err) {
                if (logger.awsLogging) {
                    logger.error("deploy failed", err);
                }

                return cb(err);
            });
        });
    };
})(module, JSON);