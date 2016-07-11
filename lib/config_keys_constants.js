var keyMapping = {};

keyMapping.globalKeys = {
  authToken: 'authtoken',
  compressConn: 'compress_con',
  consolueUI: 'consolue_ui', 
  httpProxy: 'http_proxy',
  inspectDBSize: 'inspect_db_size', 
  log: 'log',
  logFormat: 'log_format',
  logLevel: 'log_level',
  metadata: 'metadata',
  region: 'region',
  rootCAS: 'root_cas', 
  socks5Proxy: 'socks5_proxy', 
  update: 'update', 
  updateChannel: 'update_channel', 
  webAddr: 'web_addr' 
};

keyMapping.tunnelKeys = {
  addr: 'addr',
  auth: 'auth',
  bindTLS: 'bind_tls',
  crt: 'crt',
  hostname: 'hostname', 
  hostHeader: 'host_header',
  inspect: 'inspect',
  key: 'key',
  proto:'proto', 
  remoteAddr: 'remote_addr',
  subdomain: 'subdomain'
};

module.exports = keyMapping;
