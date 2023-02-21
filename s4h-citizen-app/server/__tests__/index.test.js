const request = require('supertest');
const sessions = require('@d4l/client-sessions');
const express = require('express');
const bodyParser = require('body-parser');

const routes = require('../routes');
const security = require('../lib/security');
const mock = require('./mock');

const COOKIE_NAME = 's';
const ACCESS_TOKEN = 'xs-token';
const REFRESH_TOKEN = 'fancy secret refresh token';

const CLIENT_ID = 'der mandant';
const CLIENT_SECRET = 'tommy lee jones';

const OAUTH_CODE = 'abrakadabra';

const TOKEN_ENDPOINT = '/auth/token';

const AUTH_SERVICE_TOKEN_ENDPOINT = 'http://localhost:3001/oauth/token';
const AUTH_SERVICE_REVOKE_ENDPOINT = 'http://localhost:3001/oauth/revoke';

const setupApp = () => {
  // TODO we need to use the actual express app
  // app = createServer();

  // Temporary Solution: It is currently not possible (time wise)
  // to easily test the whole express app. Therefor to have at least
  // some amount of testing in it, we create an express app on the
  // fly and hook in the handler / router / controller under test.
  const app = express();

  app.use(
    sessions({
      cookieName: COOKIE_NAME,
      secret: 'blargadeeblargblarg',
      duration: 24 * 60 * 60 * 1000,
      activeDuration: 1000 * 60 * 5,
    })
  );

  app.use(bodyParser.json());

  app.use(
    routes({
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,

      cookieName: COOKIE_NAME,
      vegaTokenEndpoint: AUTH_SERVICE_TOKEN_ENDPOINT,
      vegaRevokeEndpoint: AUTH_SERVICE_REVOKE_ENDPOINT,
    })
  );

  return app;
};

const requestNewAccessToken = (agent, done) => {
  agent
    .post('/access_token')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err, res) => {
      if (err) {
        return done(err);
      }

      expect(res.body.access_token).toBe(ACCESS_TOKEN);
      expect(res.body.refresh_token).toBeFalsy();

      done();
    });
};

describe('headers', () => {
  it('should contain csp and other security related headers', done => {
    const res = {
      headers: '',
      locals: {
        nonce: 'oh_y3@h',
      },
      setHeader(key, value) {
        this.headers += `${key}:${value}\n`;
      },
      removeHeader() {
        /* used to remove expressjs header */
      },
    };

    security({}, res, () => {
      expect(res.headers).toMatch(/script-src 'self'/);
      expect(res.headers).toMatch(/'nonce-oh_y3@h'/);
      expect(res.headers).toMatch(/style-src 'self' 'unsafe-inline'/);
      expect(res.headers).toMatch(/default-src 'self'/);
      expect(res.headers).toMatch(/img-src 'self' blob: data:/);
      expect(res.headers).toMatch(/worker-src 'self' blob:/);
      expect(res.headers).toMatch(/frame-src 'none'/);
      expect(res.headers).toMatch(/frame-ancestors 'none'/);
      expect(res.headers).toMatch(/block-all-mixed-content/);
      expect(res.headers).toMatch(/x-content-type-options:nosniff/);
      expect(res.headers).toMatch(/x-xss-protection:1;mode=block/);
      expect(res.headers).toMatch(/x-frame-options:DENY/);
      expect(res.headers).toMatch(/referrer-policy:no-referrer/);
      done();
    });
  });
});

describe('server', () => {
  describe('session', () => {
    // set up mock server
    beforeAll(done => {
      mock.create({
        code: OAUTH_CODE,
        accessToken: ACCESS_TOKEN,
        refreshToken: REFRESH_TOKEN,

        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        vegaTokenEndpoint: AUTH_SERVICE_TOKEN_ENDPOINT,
        vegaRevokeEndpoint: AUTH_SERVICE_REVOKE_ENDPOINT,
      });

      mock
        .waitFor()
        .then(() => done())
        .catch(done);
    });

    // clean up mock server
    afterAll(() => {
      mock.close();
    });

    describe('create', () => {
      let agent;

      // setting up an on-the-fly express app
      beforeAll(() => {
        agent = request.agent(setupApp());
      });

      it('should receive refresh token with proper code', done => {
        agent
          .post(TOKEN_ENDPOINT)
          .send({ code: OAUTH_CODE })
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res.body.access_token).toBe(ACCESS_TOKEN);
            expect(res.body.refresh_token).toBeFalsy();

            requestNewAccessToken(agent, done);
          });
      });
    });

    describe('use', () => {
      let agent;

      // setting up an on-the-fly express app
      beforeAll(() => {
        agent = request.agent(setupApp());
      });

      beforeEach(done => {
        agent
          .post(TOKEN_ENDPOINT)
          .send({ code: OAUTH_CODE })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res.body.access_token).toBe(ACCESS_TOKEN);
            expect(res.body.refresh_token).toBeFalsy();

            done();
          });
      });

      it('should receive access token with proper session', done => {
        requestNewAccessToken(agent, done);
      });

      it('should have no session on logout', done => {
        agent
          .post('/logout')
          .expect(204)
          .end(err => {
            if (err) {
              return done(err);
            }

            requestNewAccessToken(agent, e => {
              if (e) {
                return done();
              }

              done(Error('Session not cleared!'));
            });
          });
      });
    });

    describe('without', () => {
      let app;

      // setting up an on-the-fly express app
      beforeAll(() => {
        app = setupApp();
      });

      it('should fail to request refresh token without code', done => {
        request(app)
          .post(TOKEN_ENDPOINT)
          .expect(400, done);
      });

      it('should fail to request access token without session', done => {
        request(app)
          .post('/access_token')
          .expect(401, done);
      });
    });
  });
});
