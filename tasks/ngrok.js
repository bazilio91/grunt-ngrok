/*
 * grunt-ngrok
 * https://github.com/bazilio91/grunt-ngrok
 *
 * Copyright (c) 2014 "bazilio91" Vasiliy Ostanin
 * Licensed under the MIT license.
 */

'use strict';
var yaml = require('js-yaml'),
    fs = require('fs'),
    _ = require('lodash'),
    os = require('os'),
    spawn = require('child_process').spawn,
    fetcher = require('../lib/fetcher');


module.exports = function (grunt) {
    var ngrokTunnels = {};

    grunt.registerMultiTask('ngrok', 'Expose localhost to the web.', function () {
        var done = this.async(),
            tunnelUrl,
            task = this,
            options = this.options({
                authToken: null,
                rootCAS: null,
                inspectAddress: null,
                httpProxy: null,
                addr: null,
                proto: 'http',
                subdomain: this.target + Math.round(Math.random() * 100000),
                remoteAddr: null,
                onConnected: null,
                files: null
            }, this.data),
            fileName = __dirname + '/../tmp/' + this.target + '.yaml',
            yamlConfig = {
                tunnels: {

                }
            };

        var globalKeyMap = {
            'rootCAS': 'root_cas',
            'authToken': 'authtoken',
            'httpProxy': 'http_proxy'
        }
        grunt.util._.each(globalKeyMap, function (key, option) {
            if (options[option] !== null) {
                yamlConfig[key] = options[option];
            }
        });

        var yamlOptions = _.pickBy(options, function (val, key) { 
          return val !== null &&
            !_.isFunction(val) && 
            !_.hasIn(yamlConfig, key) &&
            !_.includes(_.keys(globalKeyMap), key); 
        });

        yamlConfig[this.target] = yamlOptions;

        fs.writeFileSync(fileName, yaml.safeDump(yamlConfig));

        if (options.files !== null) {
            fetcher.files = options.files;
        }

        fetcher.getBinary(function (err, binaryPath) {
            if (err) {
                grunt.fatal(err);
            }

            var ngrok = spawn(
                binaryPath, ['start', '-config=' + fileName, '-log=stdout', options.subdomain]
            );

            ngrok.stdout.on('data', function (data) {
                console.log(data.toString());
                var urlMatch = data.toString().match(/\[INFO\] \[client\] Tunnel established at ((tcp|https?)..*.([^:\s]*)(:[0-9]+)?)/);
                if (urlMatch && urlMatch[1]) {
                    tunnelUrl = urlMatch[1];
                    ngrokTunnels[tunnelUrl] = ngrok;
                    grunt.log.writeln('ngrok: tunnel established at ' + tunnelUrl);
                    if (typeof options.onConnected === 'function') {
                        options.onConnected(tunnelUrl);
                    }
                    done();
                    return grunt.event.emit('ngrok.' + task.target + '.connected', tunnelUrl);
                }
                var urlBusy = data.toString().match(/\[EROR\] \[client\] Server failed to allocate tunnel: The tunnel ((tcp|http|https)..*.([^:]*)([0-9]+)?) (.*is already registered)/);
                if (urlBusy && urlBusy[1]) {
                    ngrok.kill();
                    var info = 'ngrok: The tunnel ' + urlBusy[1] + ' ' + urlBusy[5];
                    grunt.log.writeln(info);
                }

                if (data.toString().indexOf('Server failed to allocate tunnel') !== -1) {
                    grunt.fatal('ngrok: ' + data.toString());
                }
            });

            ngrok.stderr.on('data', function (data) {
                ngrok.kill();
                var info = 'ngrok: process exited due to error\n' + data.toString().substring(0, 10000);
                grunt.fatal('ngrok: ' + info);
            });

            ngrok.on('close', function () {
                var tunnelInfo = tunnelUrl ? tunnelUrl + ' ' : '';
                grunt.log.writeln('ngrok: ' + tunnelInfo + 'disconnected');

                done();
            });
        });
    });

};
