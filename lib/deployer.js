(function (module) {
    "use strict";

    var config = require("./config");

    module.exports = function() {
        return config(function(err, config) {
            console.log("config", config);
            
            if (err) {
                return console.error("deployer failed", err);
            }
            var logger = require("jolira-logger")(config),
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
        });
    };
})(module);