'use strict';

var grunt = require('grunt'),
    request = require('request'),
    async = require('async');

/*
 ======== A Handy Little Nodeunit Reference ========
 https://github.com/caolan/nodeunit

 Test methods:
 test.expect(numAssertions)
 test.done()
 Test assertions:
 test.ok(value, [message])
 test.equal(actual, expected, [message])
 test.notEqual(actual, expected, [message])
 test.deepEqual(actual, expected, [message])
 test.notDeepEqual(actual, expected, [message])
 test.strictEqual(actual, expected, [message])
 test.notStrictEqual(actual, expected, [message])
 test.throws(block, [error], [message])
 test.doesNotThrow(block, [error], [message])
 test.ifError(value)
 */

exports.ngrok = {
    test: function (test) {
        var results = grunt.config.get('results');
        async.each(results, function (result, cb) {
            if (result.task.expect) {
                test.equal(result.url, result.task.expect);
            }

            var url = result.url.replace('tcp', 'http');
            request(url, function (e, r, body) {
                test.equal(body, 'grunt-ngrok');

                cb();
            });
        }, test.done);
    }
};
