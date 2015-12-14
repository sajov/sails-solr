var util = require('util');
var _ = require('lodash');

exports.log = function log(msg, data, depth) {
    if (_.isObject(data)) {
        data = util.inspect(data, showHidden = true, depth = depth ||  5, colorize = true);
    }

    console.log(msg, data || '');
}

exports.inspect = function inspect(data, depth) {
    return util.inspect(data, showHidden = true, depth = depth ||  5, colorize = true);
}
