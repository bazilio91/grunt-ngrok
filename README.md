# grunt-ngrok
[![Dependency Status](https://david-dm.org/bazilio91/grunt-ngrok.svg)](https://david-dm.org/bazilio91/grunt-ngrok)
[![devDependency Status](https://david-dm.org/bazilio91/grunt-ngrok/dev-status.svg)](https://david-dm.org/bazilio91/grunt-ngrok#info=devDependencies)

Exposes local port to the web.

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

#### authToken
Type: `String`  
Default: `null`

Authtoken on ngrok.com

#### port
Type: `Integer`  
Default: `8000`

Port of local server

#### proto
Type: `String`  
Default: `'http'`

May be `'http'`, `'https'` or `'tcp'`.

#### subdomain
Type: `String`  
Default: `target + random nubmer`

Subdomain to acquire on ngrok.com 

#### remotePort
Type: `Integer`  
Default: `null`

Port on ngrok.com

#### onConnected
Type: `function`  
Default: `null`

Callback function called when url acquired

Example:
```js
grunt.initConfig({
  ngrok: {
    options: {
      authToken: '-LgL9yAD_PcQoSXfhD2q'
    },
    server: {
      proto: 'tcp',
      port: 50010,
      remotePort: 50010,
      subdomain: 'mytestapp',
      onConnected: function(url) {
        grunt.log.writeln('Local server exposed to %s!', url);
      }
    },
  },
});
```

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



