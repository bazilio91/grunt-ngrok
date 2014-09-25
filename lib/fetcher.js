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
    darwinia32: 'https://api.equinox.io/1/Applications/ap_pJSFC5wQYkAyI0FIVwKYs9h1hW/Updates/Asset/ngrok.zip?os=darwin&arch=386&channel=stable',
    darwinx64: 'https://api.equinox.io/1/Applications/ap_pJSFC5wQYkAyI0FIVwKYs9h1hW/Updates/Asset/ngrok.zip?os=darwin&arch=amd64&channel=stable',
    linuxarm: 'https://api.equinox.io/1/Applications/ap_pJSFC5wQYkAyI0FIVwKYs9h1hW/Updates/Asset/ngrok.zip?os=linux&arch=arm&channel=stable',
    linuxia32: 'https://api.equinox.io/1/Applications/ap_pJSFC5wQYkAyI0FIVwKYs9h1hW/Updates/Asset/ngrok.zip?os=linux&arch=386&channel=stable',
    linuxx64: 'https://api.equinox.io/1/Applications/ap_pJSFC5wQYkAyI0FIVwKYs9h1hW/Updates/Asset/ngrok.zip?os=linux&arch=amd64&channel=stable',
    win32ia32: 'https://api.equinox.io/1/Applications/ap_pJSFC5wQYkAyI0FIVwKYs9h1hW/Updates/Asset/ngrok.zip?os=windows&arch=386&channel=stable',
    win32x64: 'https://api.equinox.io/1/Applications/ap_pJSFC5wQYkAyI0FIVwKYs9h1hW/Updates/Asset/ngrok.zip?os=windows&arch=amd64&channel=stable',
    freebsdia32: 'https://api.equinox.io/1/Applications/ap_pJSFC5wQYkAyI0FIVwKYs9h1hW/Updates/Asset/ngrok.zip?os=freebsd&arch=386&channel=stable',
    freebsdx64: 'https://api.equinox.io/1/Applications/ap_pJSFC5wQYkAyI0FIVwKYs9h1hW/Updates/Asset/ngrok.zip?os=freebsd&arch=amd64&channel=stable'
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