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
        npm.load({
            "loglevel": "verbose",
            "argv": {
                "remain": [],
                "cooked": [
                    "install",
                    "--loglevel",
                    "verbose"
                ],
                "original": [
                    "install",
                    "-d"
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

            return npm.commands.install(["git://github.com/MensWearhouse/tailorapp.git#master", "."], function (err, data) {
                if (err) {
                    return logger.error("npm install failed", err);
                }

                console.log("data", data);
            });

        });
    };
})(module);