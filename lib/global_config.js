var keyMapper = require('./config_keys_constants');
var _ = require('lodash');
var util = require('./utility_functions');

module.exports = function GlobalConfig(options) {
  options.logLevel = 'debug';
  
  var config = {};

  config.keys = util.convertKeys(keyMapper.globalKeys, options);

  config.presentKeys = function() {
    return util.compactObject(config.keys); 
  };

  config.onConnected = options.onConnected;

  return config; 
};


