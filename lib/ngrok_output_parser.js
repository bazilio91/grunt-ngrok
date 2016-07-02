module.exports = function NgrokOutputParser(outputLine) {
  return {

    sessionEstablished: function() {
      if (outputLine.match(/msg=\"start tunnel listen\"/)) {
        return true;
      }
      else {
        return false;
      }
    },
    foundHTTPSUrl: function() {
      if (outputLine.match(/URL\:https\:/)) {
        return true;
      }
      else {
        return false;
      }
    },
    getHTTPSUrl: function() {
      return outputLine.split('https://')[1].split(' ')[0];
    }
  }
}
