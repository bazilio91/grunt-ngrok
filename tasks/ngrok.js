/*
 * grunt-ngrok
 * https://github.com/bazilio91/grunt-ngrok
 *
 * Copyright (c) 2014 "bazilio91" Vasiliy Ostanin
 * Licensed under the MIT license.
 */

'use strict';
var _ = require('lodash'),
    os = require('os'),
    spawn = require('child_process').spawn,
    fetcher = require('../lib/fetcher'),
    GlobalConfig = require('../lib/global_config'),
    TunnelConfig = require('../lib/tunnel_config'),
    ConfigFileWriter = require('../lib/config_file_writer'),
    NgrokOutputParser = require('../lib/ngrok_output_parser');

module.exports = function (grunt) {
    var ngrokTunnels = {};
    var filename = __dirname+'/../tmp/ngrok_config.yaml';
    var url = null;
    
    grunt.registerMultiTask('ngrok', 'Expose localhost to the web.', function () {
        var done = this.async(),
            task = this;
  
        var globalConfig = GlobalConfig(this.options());
        var tunnelConfigs = _.map(this.data, function(tunnelConfig, tunnelName) { return TunnelConfig(tunnelName, tunnelConfig); });

        var writer = ConfigFileWriter(filename, tunnelConfigs, globalConfig);

        writer.exportConfigToYaml();

        fetcher.getBinary(function (err, binaryPath) {
            if (err) {
                grunt.fatal(err);
            }

            var ngrok = spawn(
                binaryPath, ['start', '--all', '-config=' + filename, '-log=stdout']
            );

            ngrok.stdout.on('data', function (data) {
                var parser = NgrokOutputParser(data.toString()); 
                
                if (parser.foundHTTPSUrl()) { url = parser.getHTTPSUrl(); }
                
                if (parser.sessionEstablished()) {
                  if (_.isFunction(globalConfig.onConnected)) {
                    globalConfig.onConnected(url || 'unknown');
                  }
                  if (url) { done(); }
                }
                // TODO: Add checks for failed tunnel
            });

            ngrok.stderr.on('data', function (data) {
                ngrok.kill();
                var info = 'ngrok: process exited due to error\n' + data.toString().substring(0, 10000);
                grunt.fatal('ngrok: ' + info);
            });

            ngrok.on('close', function () {
                var tunnelInfo = 'hrmm ';
                grunt.log.writeln('ngrok: ' + tunnelInfo + 'disconnected');

                done();
            });
        });
    });

};
