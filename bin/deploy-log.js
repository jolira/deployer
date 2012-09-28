#!/usr/bin/env node
(function (process, console) {
    "use strict";

    var config = require("../lib/config"),
        message = process.argv[2];

    return config(function (err, config) {
        if (err) {
            return console.error("logging failed", err);
        }

        var logger = require("jolira-logger")(config);

        logger.info(message);

    });
})(process, console);