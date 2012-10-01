(function (module, JSON) {
    "use strict";

    var fs = require('fs'),
        awssum = require('awssum'),
        amazon = awssum.load('amazon/amazon'),
        S3 = awssum.load('amazon/s3').S3,
        runner = require("./runner"),
        provision = require("./provision"),
        config = require("ec2-user-data");

    function merge(cfg1, cfg2) {
        var keys = Object.keys(cfg2);

        keys.forEach(function (key) {
            cfg1[key] = cfg2[key];
        });

        return cfg1;
    }

    function parseJson(data, cb) {
        try {
            return cb(undefined, JSON.parse(data));
        }
        catch (e) {
            return cb(new Error("failed to parse " + data + " " + e.toString()));
        }
    }

    function loadLocalFile(logger, file, cb) {
        logger.info("using local configuration", file);

        return fs.readFile(file, 'utf8', function (err, content) {
            if (err) {
                return cb(err);
            }

            try {
                return cb(undefined, content);
            }
            catch (e) {
                return cb(e);
            }
        });
    }

    function loadS3File(logger, config, bucket, file, SS3, cb) {
        logger.info("using s3 configuration", bucket, file);

        var s3 = new SS3({
            'accessKeyId':config['aws-access-key-id'],
            'secretAccessKey':config['aws-secret-access-key'],
            'region':config['aws-region']
        });

        return s3.GetObject({
            BucketName:bucket,
            ObjectName:file
        }, function (err, result) {
            if (err) {
                return cb(err);
            }

            return cb(undefined, result.Body.toString())
        });
    }

    function loadFile(logger, config, SSS, cb) {
        if (!config.manifest) {
            return cb(new Error("no manifest specified"));
        }

        var matched = config.manifest.match(/^\s*s3\:\/\/([^\/]+)\/(.*)\s*$/),
            callback = function (err, data) {
                if (err) {
                    return cb(err);
                }

                return parseJson(data, function (err, parsed) {
                    if (err) {
                        return cb(err);
                    }

                    var merged = merge(config, parsed);

                    return cb(undefined, merged);
                });
            };

        if (matched) {
            return loadS3File(logger, config, matched[1], matched[2], SSS, callback);
        }

        matched = config.manifest.match(/^\s*file\:\/(.*)\s*$/);

        if (!matched) {
            return cb(new Error("unknown protocol used for " + config.manifest));
        }

        return loadLocalFile(logger, matched[1], callback);
    }

    function execute(logger, config, provision, run, SSS, cb) {
        return loadFile(logger, config, SSS, function (err, config) {
            if (err) {
                return cb(err);
            }

            return provision(logger, config.repository, function (err) {
                if (err) {
                    return cb(err);
                }

                return run(logger, config, cb);
            });
        });
    }

    module.exports = function (cb) {
        var cfg = arguments[1] || config,
            prvson = arguments[2] || provision,
            rnnr = arguments[3] || runner,
            SSS = arguments[4] || S3; // for unit testing

        return cfg(function (err, config) {
            if (err) {
                return cb(err);
            }

            var logger = require("jolira-logger")(config),
                error = "",
                msg = "";

            logger.info("deploying", config['user-data']);

            if (logger.awsLogging) {
                process.stdout.write = function (message) {
                    msg += message;

                    var lines = msg.split("\n");

                    if (lines.length > 1) {
                        msg = lines.pop();

                        logger.error("npm", lines);
                    }
                };
                process.stderr.write = function (message) {
                    error += message;

                    var lines = error.split("\n");

                    if (lines.length > 1) {
                        error = lines.pop();

                        logger.error("npm", lines);
                    }
                };
            }

            return execute(logger, config, prvson, rnnr, SSS, function (err) {
                if (logger.awsLogging) {
                    logger.error("deploy failed", err);
                }

                return cb(err);
            });
        });
    };
})(module, JSON);