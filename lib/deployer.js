(function (module) {
    "use strict";

    var npm = require("npm"),
        config = require("./config"),
        logger = require("jolira-logger")(config),
        err = "",
        msg = "";

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

    module.exports = function() {
        config(function (err, config) {
            npm.load({
                "loglevel": "info",
                "argv": {
                    "remain": [],
                    "cooked": [
                        "install",
                        "--loglevel",
                        "info"
                    ],
                    "original": [
                        "install"
                    ]
                },
                "_exit": true
            }, function (err) {
                if (err) {
                    return logger.error("npm load failed", err);
                }

                npm.on("log", function (message) {
                    logger("npm log", message);
                });

                return npm.commands.install(["git+ssh://git@github.com:MensWearhouse/tailorapp.git#master", "."], function (err, data) {
                    if (err) {
                        return logger.error("npm install failed", err);
                    }

                    logger.info("data", data);
                });

            });
        });
    };
})(module);