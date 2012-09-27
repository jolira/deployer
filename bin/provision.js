#!/usr/bin/env node
(function (process, console) {
    "use strict";

    var provision = require("../lib/provision"),
        repo = process.argv[2];

    provision({
        info:function() {
            console.log.apply(null, arguments);
        },
        error:function() {
            console.error.apply(null, arguments);
        }
    }, repo, function(err) {
        if (err) {
            console.error("failed to provision", repo, err);
        }
    });
})(process, console);