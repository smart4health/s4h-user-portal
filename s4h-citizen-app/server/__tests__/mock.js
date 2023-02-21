const url = require('url');
const express = require('express');
const inspect = require('util').inspect;
const superagent = require('superagent');
const bodyParser = require('body-parser');

const OAUTH_GRANT_TYPE = 'authorization_code';
const OAUTH_REFRESH_TOKEN_TYPE = 'refresh_token';

const maxRetries = 30;
const timeout = 1000;

const app = express();

let server;

const sleep = duration => new Promise(resolve => setTimeout(resolve, duration));

const withRetry = (prom, counter, duration) =>
  prom().catch(err => {
    if (counter--) {
      return sleep(duration).then(() => withRetry(prom, counter, duration));
    }

    return Promise.reject(err);
  });

const waitFor = () =>
  new Promise((resolve, reject) =>
    superagent
      .agent()
      .get('http://localhost:3001/health')
      .end((err, res) => {
        if (err) {
          reject(err);
          return;
        }

        if (res.status != 200) {
          reject(Error(`${res.status} : ${typeof res.status}`));
          return;
        }

        resolve();
      })
  );

exports.waitFor = () => withRetry(waitFor, maxRetries, timeout);

exports.close = () => server.close();

exports.create = ({
  vegaTokenEndpoint,
  vegaRevokeEndpoint,
  code,
  clientID,
  clientSecret,
  refreshToken,
  accessToken,
  debug = false,
}) => {
  const tokenAddr = url.parse(vegaTokenEndpoint, true);
  const revokeAddr = url.parse(vegaRevokeEndpoint, true);

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use((req, _, next) => {
    if (!debug) {
      return next();
    }

    /* eslint-disable no-console */
    console.log(`

== MOCK LOGGER ==========
    req.url: ${req.url}
    req.body: ${inspect(req.body, false, 3, true)}
=========================

        `);
    /* eslint-enable no-console */

    next();
  });

  app.get('/health', (_, res) => {
    res.sendStatus(200);
  });

  app.post(revokeAddr.pathname, (req, res) => {
    // reject requests without correct authorization
    if (
      req.body['client_id'] !== clientID ||
      req.body['client_secret'] !== clientSecret
    ) {
      res.sendStatus(401);
      return;
    }

    // reject requests without correct refresh token and token hint
    if (
      req.body['token_type_hint'] !== OAUTH_REFRESH_TOKEN_TYPE ||
      req.body['token'] !== refreshToken
    ) {
      res.sendStatus(400);
      return;
    }

    res.sendStatus(200);
  });

  app.post(tokenAddr.pathname, (req, res) => {
    // reject requests without correct authorization
    if (
      req.body['client_id'] !== clientID ||
      req.body['client_secret'] !== clientSecret
    ) {
      res.sendStatus(401);
      return;
    }

    // reject access and refresh token requests without correct code
    if (req.body['grant_type'] === OAUTH_GRANT_TYPE && req.body['code'] !== code) {
      res.sendStatus(402);
      return;
    }

    // reject access token requests without correct refresh token
    if (
      req.body['grant_type'] === OAUTH_REFRESH_TOKEN_TYPE &&
      req.body['refresh_token'] !== refreshToken
    ) {
      res.sendStatus(403);
      return;
    }

    return res.json({
      access_token: accessToken,
      token_type: 'mock',
      expires_in: 3600,
      refresh_token: refreshToken,
    });
  });

  server = app.listen(3001);
};
