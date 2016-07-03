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
    
    grunt.registerMultiTask('ngrok', 'Expose localhost to the web.', function () {
        var done = this.async(),
            completed = false,
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
                if (completed) { return; }
                var parser = NgrokOutputParser(data.toString()); 
                
                if (parser.sessionEstablished()) {
                  if (_.isFunction(globalConfig.onConnected)) {
                    globalConfig.onConnected(parser.getUrl() || 'unknown');
                  }
                }

                if (parser.heartbeatDetected()) {
                  done();
                  completed = true;
                  grunt.event.emit('Ngrok: Tunnels opened successfully.');
                }

                if (parser.tooManyTunnelsOpen()) {
                  ngrok.kill();
                  grunt.fatal('Ngrok: Too Many Tunnels Already Open on your Account');
                }
                // TODO: Add checks for failed tunnel
            });

            ngrok.stderr.on('data', function (data) {
                ngrok.kill();
                grunt.fatal('Ngrok: Failed because of error. Error: \'' + console.log(data.toString()) + '\'');
            });

            ngrok.on('close', function () {
                grunt.log.writeln('Ngrok: Quiting... No tunnels will be left open.');
                done();
            });
        });
    });

};
