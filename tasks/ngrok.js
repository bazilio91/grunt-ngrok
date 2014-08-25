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
    os = require('os'),
    spawn = require('child_process').spawn;


module.exports = function (grunt) {
    var ngrokTunnels = {};

    function getNgrokBin() {
        var suffix = os.platform() === 'win32' ? '.exe' : '';
        return 'ngrok' + suffix;
    }

    grunt.registerMultiTask('ngrok', 'Expose localhost to the web.', function () {
        var done = this.async(),
            tunnelUrl,
            task = this,
            options = this.options({
                authToken: null,
                port: null,
                proto: 'http',
                subdomain: this.target + Math.round(Math.random() * 100000),
                remotePort: null,
                onConnected: null
            }, this.data),
            fileName = __dirname + '/../tmp/' + this.target + '.yaml',
            yamlConfig = {
                auth_token: options.authToken,
                tunnels: {

                }
            };

        yamlConfig.tunnels[options.subdomain] = {proto: {}};
        if (options.remotePort) {
            yamlConfig.tunnels[options.subdomain]['remote_port'] = parseInt(options.remotePort);
        }

        yamlConfig.tunnels[options.subdomain].proto[options.proto] = options.port;


        fs.writeFileSync(fileName, yaml.safeDump(yamlConfig));
        if (!fs.existsSync(__dirname + '/../bin/' + getNgrokBin())) {
            grunt.fatal('No ngrok bin at ' + __dirname + '/../bin/' + getNgrokBin());
        }

        var ngrok = spawn(
            getNgrokBin(),
            ['-config=' + fileName, '-log=stdout', 'start', options.subdomain]
        );

        ngrok.stdout.on('data', function (data) {
            var urlMatch = data.toString().match(/\[INFO\] \[client\] Tunnel established at ((tcp|https?)..*.ngrok.com(:[0-9]+)?)/);
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
            var urlBusy = data.toString().match(/\[EROR\] \[client\] Server failed to allocate tunnel: The tunnel ((tcp|http|https)..*.ngrok.com([0-9]+)?) (.*is already registered)/);
            if (urlBusy && urlBusy[1]) {
                ngrok.kill();
                var info = 'ngrok: The tunnel ' + urlBusy[1] + ' ' + urlBusy[4];
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

};
