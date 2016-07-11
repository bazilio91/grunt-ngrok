var os = require('os'),
    fs = require('fs'),
    util = require('util'),
    DecompressZip = require('decompress-zip'),
    binaryPath = __dirname + '/../bin/';

var fetcher = {};

function unzipFile(file, cb) {
    var suffix = os.platform() === 'win32' ? '.exe' : '',
        unzipper = new DecompressZip(file);

    unzipper.extract({ path: binaryPath });
    unzipper.once('error', function (e) {
        cb(e);
        process.exit(1);
    });
    unzipper.once('extract', function () {
        if (suffix === '.exe') {
            fs.writeFileSync(binaryPath + 'ngrok.cmd', 'ngrok.exe');
        }
        fs.unlinkSync(binaryPath + 'ngrok.zip');
        var target = binaryPath + 'ngrok' + suffix;
        fs.chmodSync(target, 0755);
        if (fs.existsSync(target) && fs.statSync(target).size > 0) {
            console.error('ngrok - Binary downloaded.');
            cb(null, target);
            return;
        }
        cb(new Error('ngrok - Binary NOT downloaded.'));
        process.exit(-1);
    });
}

fetcher.files = {
    darwinia32: 'https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-darwin-386.zip',
    darwinx64: 'https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-darwin-amd64.zip',
    linuxarm: 'https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-arm.zip',
    linuxia32: 'https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-386.zip',
    linuxx64: 'https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip',
    win32ia32: 'https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-windows-386.zip',
    win32x64: 'https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-windows-amd64.zip',
    freebsdia32: 'https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-freebsd-386.zip',
    freebsdx64: 'https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-freebsd-amd64.zip'
};

fetcher.fetch = function (cb) {
    if (!fs.existsSync(binaryPath)) {
        fs.mkdirSync(binaryPath);
    }

    var fetchLib,
        fileUrl = this.getUrl();

    if (fileUrl.indexOf('https') === 0) {
        fetchLib = require('https');
    } else {
        fetchLib = require('http');
    }

    var zip = fs.createWriteStream(binaryPath + 'ngrok.zip');

    console.log('Downloading ' + fileUrl);
    fetchLib.get(fileUrl, function (response) {
        response.pipe(zip).on('finish', function () {
            console.log('ngrok - Zipfile received (' + fileUrl + ') ...');
            unzipFile(binaryPath + 'ngrok.zip', cb);
            fs.writeFileSync(binaryPath + 'current.txt', fileUrl);
        });
    });
};


fetcher.getUrl = function () {
    var binaryType = os.platform() + os.arch();

    if (!this.files[binaryType]) {
        throw new Error('Unsupported system: ' + os.platform() + os.arch());
    }

    return this.files[binaryType]
};

fetcher.getBinary = function (cb) {
    var url = this.getUrl(),
        binaryName = 'ngrok' + (os.platform() === 'win32' ? '.exe' : '');

    if (fs.existsSync(binaryPath + 'current.txt') &&
        fs.readFileSync(binaryPath + 'current.txt').toString() === url &&
        fs.existsSync(binaryPath +  binaryName)) {

        cb(null, binaryPath + binaryName);
        return;
    }

    this.fetch(cb);
    return false;
};

module.exports = fetcher;
