var _ = require('lodash');
var fs = require('fs');
var yaml = require('js-yaml');
    
module.exports = function ConfigFileWriter(filepath, tunnelConfigs, globalConfig) {
  return {
    hello: 'yo', 
    exportConfigToYaml: function() {
      output = globalConfig.presentKeys();
      
      output.tunnels = {};
      _.each(tunnelConfigs, function(tunnelConfig) {
        output.tunnels[tunnelConfig.name] = tunnelConfig.presentKeys();
      });

      fs.writeFileSync(filepath, yaml.safeDump(output));
    }
  };
};
