const proxy = require('http-proxy-middleware');
const { parseEnv } = require('../../server/env');
const env = parseEnv();

function httpLog(proxyReq, req) {
  // eslint-disable-next-line no-console
  console.log('-->  ', req.method, req.path, '->', proxyReq.path);
}

module.exports = app => {
  // The proxy of `/oauth` with the modification of vega's auth-cookie has been removed
  // The cookie is set for a dedicated domain (localhost) and would not be presented by the
  // user-agent when the login is completed by sending the form the vega

  app.use(
    '/handshake',
    proxy({
      target: env.GC_HOST,
      secure: false,
      changeOrigin: true,
      onProxyReq: httpLog,
    })
  );
};
