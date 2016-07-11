module.exports = function NgrokOutputParser(outputLine) {
  return {

    sessionEstablished: function() {
      if (outputLine.match(/URL\:/)) {
        return true;
      }
      else {
        return false;
      }
    },
    heartbeatDetected: function() {
      if (outputLine.match(/msg=\"heartbeat received\"/)) {
        return true;
      }
      else {
        return false;
      }
    },
    getUrl: function() {
      return outputLine.split('URL:')[1].split(' ')[0];
    },
    tooManyTunnelsOpen: function() {
      if (outputLine.match(/err=\"Tunnel session failed: Your account '....' is limited to 1 simultaneous ngrok client session/)) {
        return true;
      }
      else {
        return false;
      }
    }
  }
}
