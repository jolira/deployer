/*jslint white: true, forin: false, node: true, indent: 4 */
(function (module) {
    "use strict";

    var assert = require('assert'),
        vows = require('vows'),
        fs = require('fs'),
        readFile = fs.readFile,
        horaa = require('horaa'),
        fsHorra = horaa("fs"),
        deployer = require("../lib/deployer");

    fsHorra.hijack("readFile", function (file, encoding, cb) {
        if (file !== '/home/jfk/myapp.json') {
            return cb(new Error("unexpected file name", file));
        }
        return cb(undefined, JSON.stringify({
            app: "app",
            env: {
                PORT: 3000
            }
        }));
    });

    // Create a Test Suite
    vows.describe('deploy').addBatch({
        'configure from file':{
            topic:function () {
                deployer(this.callback, function(cb) {
                    setTimeout(function() {
                        cb(undefined, {
                            "user-data": "file://home/jfk/myapp.json"
                        });
                    }, 10);
                }, function(logger, app, cb) {
                    logger.info("provisioning app", app);
                    assert.equal(app, "app");

                    return cb();
                }, function(logger, config, cb) {
                    logger.info("running config", config);

                    return cb();
                });
            },
            'configure from s3':function (result) {
                assert.isUndefined(result);
            }
        }
    }).export(module);
})(module);
