/*jslint white: true, forin: false, node: true, indent: 4 */
(function (module) {
    "use strict";

    var assert = require('assert'),
        vows = require('vows'),
        fs = require('fs'),
        readFile = fs.readFile,
        horaa = require('horaa'),
        fsHorra = horaa("fs"),
        deployer = require("../lib/deployer"),
        SSS = function (args) {
            assert.equal(args.accessKeyId, "AKIAJAVD6PLCIAPQRQTA");
            assert.equal(args.secretAccessKey, "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");
            assert.equal(args.region, "us-east-1");
        };

    SSS.prototype.GetObject = function (args, cb) {
        assert.equal(args.BucketName, "joachimkainz");
        assert.equal(args.ObjectName, "config/testapp.json");

        cb(undefined, {
            Body:{
                toString:function () {
                    return JSON.stringify({
                        "repository":"s3-defined-repository",
                        "env":{
                            "PORT":1234
                        }
                    })
                }
            }
        });
    };

    fsHorra.hijack("readFile", function (file, encoding, cb) {
        if (file !== '/home/jfk/myapp.json') {
            return cb(new Error("unexpected file name", file));
        }
        return cb(undefined, JSON.stringify({
            repository:"repository",
            env:{
                PORT:3000
            }
        }));
    });

    // Create a Test Suite
    vows.describe('deploy').addBatch({
        'configure from file':{
            topic:function () {
                deployer(this.callback, function (cb) {
                    setTimeout(function () {
                        cb(undefined, {
                            "manifest":"file://home/jfk/myapp.json"
                        });
                    }, 10);
                }, function (logger, repository, cb) {
                    logger.info("provisioning app from", repository);
                    assert.equal(repository, "repository");

                    return cb();
                }, function (logger, config, cb) {
                    logger.info("running config", config);

                    return cb();
                });
            },
            'configure from s3':function (result) {
                assert.isUndefined(result);
            }
        },
        'configure from s3':{
            topic:function () {
                deployer(this.callback, function (cb) {
                    setTimeout(function () {
                        cb(undefined, {
                            "manifest":"s3://joachimkainz/config/testapp.json",
                            "aws-access-key-id":"AKIAJAVD6PLCIAPQRQTA",
                            "aws-secret-access-key":"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",
                            "aws-region":"us-east-1",
                            "aws-logging":false
                        });
                    }, 10);
                }, function (logger, repository, cb) {
                    logger.info("provisioning app from", repository);
                    assert.equal(repository, "s3-defined-repository");

                    return cb();
                }, function (logger, config, cb) {
                    logger.info("running config", config);

                    return cb();
                }, SSS);
            },
            'configure from s3':function (result) {
                assert.isUndefined(result);
            }
        }
    }).export(module);
})(module);
