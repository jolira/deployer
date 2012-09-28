#!/usr/bin/env node
(function (process, console) {
    "use strict";

    var config = require("../lib/config"),
        message = process.argv[2];

    return cfg(function (err, config) {
        if (err) {
            return cb(err);
        }

        var logger = require("jolira-logger")(config);

        logger.info(mesage);

    });
})(process, console);