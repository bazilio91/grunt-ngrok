/*
 * grunt-init-gruntplugin-sample
 * https://github.com/gruntjs/grunt-init-gruntplugin-sample
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
    function getRandomPort() {
        return Math.round(Math.random() * (65535 - 50000) + 50000);
    }

    var tcpPort = getRandomPort();

    // Project configuration.
    grunt.initConfig({
        results: [],
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                '<%= nodeunit.tests %>'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        // Configuration to be run (and then tested).
        ngrok: {
            options: {
                authToken: '-LgL9yAD_PcQoSXfhD2q',
                port: 50000,
                onConnected: function (url) {
                    var results = grunt.config.get('results');
                    results.push({task: this, url: url});
                    grunt.config.set('results', results);
                }
            },
            basicHttp: {},
            basicHttps: {
                proto: 'https'
            },
            httpSubdomain: {
                subdomain: 'grunt-ngrok-test' + tcpPort, // just for random
                expect: 'http://grunt-ngrok-test' + tcpPort + '.ngrok.com'
            },
            tcp: {
                name: 'tcp',
                proto: 'tcp'
            },
            tcpRemote: {
                name: 'tcpRemote',
                expect: 'tcp://ngrok.com:' + tcpPort,
                proto: 'tcp',
                remotePort: tcpPort
            }
        },

        // Unit tests.
        nodeunit: {
            tests: ['test/*_test.js']
        }

    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    grunt.registerTask('test', ['jshint', 'testServer', 'ngrok', 'nodeunit']);

    grunt.registerTask('testServer', function () {
        require('http').createServer(function (req, res) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write('grunt-ngrok');
            res.end();
        }).listen(50000);
    });
};
