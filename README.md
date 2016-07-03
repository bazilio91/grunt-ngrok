# grunt-ngrok
[![Build Status](https://travis-ci.org/bazilio91/grunt-ngrok.svg)](https://travis-ci.org/bazilio91/grunt-ngrok)
[![Dependency Status](https://david-dm.org/bazilio91/grunt-ngrok.svg)](https://david-dm.org/bazilio91/grunt-ngrok)
[![devDependency Status](https://david-dm.org/bazilio91/grunt-ngrok/dev-status.svg)](https://david-dm.org/bazilio91/grunt-ngrok#info=devDependencies)

> Exposes local port to the web.

[![NPM](https://nodei.co/npm/grunt-ngrok.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/grunt-ngrok/)

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-ngrok --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-ngrok');
```

_Run this task with the `grunt ngrok` command._


### Options

See the ngrok website for details about what each key does (https://ngrok.com/docs)

#### Global Config Options

```
authToken
compressConn
consolueUI 
httpProxy
inspectDBSize 
log
logFormat
logLevel
metadata
region
rootCAS 
socks5Proxy 
update 
updateChannel
webAddr 
```

#### Tunnel Specific Options

```
addr
auth
bindTLS
crt
hostname 
hostHeader
inspect
key
proto 
remoteAddr
subdomain
```

example:
```js
grunt.initConfig({
  ngrok: {
    options: {
      authToken: '-your-auth-token',
      onConnected: function(url) {
        grunt.log.writeln('Local server exposed to %s!', url);
      }
    },
    server: {
      proto: 'tcp',
      addr: 50010,
      remoteAddr: 50010,
      subdomain: 'mytestapp',
    },
  },
});
```

Notice global go inside the options object, while the new tunnels you want to open (i.e. `server`)
have their own object, with tunnel specific options in it.

#### Grunt Events
The ngrok plugin will emit a grunt event, `ngrok.{taskName}.connected`, once connected.
You can listen for this event to run things against a keepalive server, for example:

```javascript
grunt.registerTask('jasmine-server', 'start web server for jasmine tests in browser', function() {
  grunt.task.run('jasmine:tests:build');

  grunt.event.once('ngrok.tests.connected', function(url) {
    var specRunnerUrl = url + '/_SpecRunner.html';
    grunt.log.writeln('Jasmine specs available at: ' + specRunnerUrl);
    require('open')(specRunnerUrl);
  });

  grunt.task.run('ngrok:tests');
});
```



