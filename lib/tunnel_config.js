var keyMapper = require('./config_keys_constants');
var _ = require('lodash');
var util = require('./utility_functions');

module.exports = function TunnelConfig(tunnelName, options) {
  var config = {};

  config.keys = util.convertKeys(keyMapper.tunnelKeys, options);
  config.name = tunnelName;
  
  config.presentKeys = function() {
    return util.compactObject(config.keys);
  };

  return config;
};
