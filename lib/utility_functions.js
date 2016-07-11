var _ = require('lodash');

var util = {};

util.compactObject = function(obj) {
  _.each(obj, function(v, k) {
    if(!v) {
      delete obj[k];
    }
  });
  return obj;
};

util.convertKeys = function(keyMapping, options) {
  var convertedOptions = {};
  _.each(keyMapping, function(value, key) {
    convertedOptions[value] = options[key];
  });
  return convertedOptions;
};

module.exports = util;
