/*jslint white: true, forin: false, node: true, indent: 4 */
(function (module) {
    "use strict";

    var assert = require('assert'),
        vows = require('vows'),
        command = require('../lib/command');

    // Create a Test Suite
    vows.describe('spawn').addBatch({
        'ls -lah':{
            topic:function () {
                command({
                    info:function() {
                        console.log.apply(null, arguments);
                    },
                    error:function() {
                        console.error.apply(null, arguments);
                    }
                }, "ls", ["-lah"], this.callback);
            },
            'check results':function (content) {
                assert.isUndefined(content);
            }
        }
    }).export(module);
})(module);
