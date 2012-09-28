(function (module) {
    "use strict";

    module.exports = {
        merge:function (cfg1, cfg2) {
            var keys = Object.keys(cfg2);

            keys.forEach(function (key) {
                cfg1[key] = cfg2[key];
            });

            return cfg1;
        },
        parseJson:function (data, cb) {
            try {
                return cb(undefined, JSON.parse(data));
            }
            catch (e) {
                return cb(new Error("failed to parse " + data + " " + e.toString()));
            }
        }
    };
})(module);