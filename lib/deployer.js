(function (module) {
    "use strict";

    var npm = require("npm"),
        config = require("./config"),
        logger = require("jolira-logger")(config);

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

            return npm.commands.install(["git://github.com/jolira/logger.git#master"], function (err, data) {
                if (err) {
                    return logger.error("npm install failed", err);
                }

                console.log("data", data);
            });

        });
    };
})(module);