const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const sessions = require('@d4l/client-sessions');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const uuid = require('uuid');
// All envvars definitions, handling and validations is encapsulated in a parseEnv function.
const { parseEnv, parseClientEnv } = require('./env');

const routes = require('./routes');
const securityMiddleware = require('./lib/security');

const sessionConfig = require('./config/session');

const scriptNonce = uuid.v4();

const createServer = (environment = process.env, environmentOptions = {}) => {
  const env = parseEnv(environment, environmentOptions);
  const clientEnv = parseClientEnv(env);

  const app = express();

  // Adds gzip compression to the response
  app.use(compression());

  // chosen 's' for session
  const COOKIE_NAME = 's';

  // For access_token since it can be in plaintext
  const sessionKey = env.COOKIE_KEY;
  app.use(cookieParser());

  /**
   * For refresh_token since it needs to be encrypted on the client
   */
  app.use(
    sessions({
      // cookie name dictates the key name added to the request object
      cookieName: COOKIE_NAME,
      // should be a large unguessable string
      secret: sessionKey,

      cookie: {
        httpOnly: true,
        secureProxy: true,
        sameSite: 'strict',
      },

      ...sessionConfig,
    })
  );

  // Add the generated nonce to the express session
  app.use((_, res, next) => {
    res.locals.nonce = scriptNonce;
    next();
  });

  // Set the envvars object to the app so it is accessible by middlewares
  app.set('env', env);

  // Rest of static assets
  app.use(
    express.static(path.resolve(__dirname, '..', env.STATIC_CONTENT_PATH), {
      index: false,
    })
  );

  app.use(
    bodyParser.json({
      // application/csp-report is of type json
      type: ['json', 'application/csp-report'],
    })
  );

  // Adds security headers. As for now, only reporting.
  app.use(securityMiddleware);

  app.use(
    routes({
      vegaTokenEndpoint: env.AUTH_SERVICE_TOKEN_URL,
      vegaRevokeEndpoint: env.AUTH_SERVICE_REVOKE_URL,
      clientID: env.OAUTH_CLIENT_ID,
      clientSecret: env.OAUTH_CLIENT_SECRET,

      cookieName: COOKIE_NAME,
    })
  );

  const INDEX_FILE_PATH = path.resolve(
    __dirname,
    '..',
    env.STATIC_CONTENT_PATH,
    'index.html'
  );
  /**
   * Read the contents of the index.html file and inject the
   * client relevant ENV variables. This is done here and stored
   * in-memory to prevent parsing on reach request.
   */
  const INDEX_FILE_CONTENTS = fs
    .readFileSync(INDEX_FILE_PATH, 'utf8')
    .replace('__ENV_DATA__', JSON.stringify(clientEnv))
    .replace(/__NONCE__/g, scriptNonce);

  // Any other request that is not a static asset or app route, goes to index.html
  // 404 is supposed to be implemented in the client side
  app.get('*', (_, res) => {
    res.send(INDEX_FILE_CONTENTS);
  });

  return app;
};

const startServer = (app = createServer()) => {
  const port = app.get('env').PORT;
  return app.listen(port, () => {
    // eslint-disable-next-line
    console.log(`App listening on port ${port}`);
  });
};

if (require.main === module) {
  startServer();
}

exports.createServer = createServer;
exports.startServer = startServer;
