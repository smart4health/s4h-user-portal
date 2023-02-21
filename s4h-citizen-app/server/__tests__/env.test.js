const mockedEnv = require('mocked-env');
const { parseEnv, parseClientEnv } = require('../env');

const EXAMPLE_ENV_WITH_REQUIRED_ATTRIBUTES = {
  COOKIE_KEY: 'COOKIE_KEY',
  OAUTH_CLIENT_ID: 'OAUTH_CLIENT_ID',
  OAUTH_CLIENT_SECRET: 'OAUTH_CLIENT_SECRET',
  OAUTH_REDIRECT_URI: 'http://OAUTH_REDIRECT_URI',
  GC_HOST: 'http://GC_HOST',
  AUTH_SERVICE_USERS_URL: 'http://AUTH_SERVICE_USERS_URL',
  AUTH_SERVICE_TOKEN_URL: 'http://AUTH_SERVICE_TOKEN_URL',
  AUTH_SERVICE_REVOKE_URL: 'http://AUTH_SERVICE_REVOKE_URL',
  FEATURE_FLAGS_HOST: 'http://FEATURE_FLAGS_HOST',
  USER_DATA_HOST: 'http://USER_DATA_HOST',
  TCTOKEN_URL: 'http://TCTOKEN_URL',
  TCTOKEN_URL_EIDAS: 'http://TCTOKEN_URL_EIDAS',
};

const EXAMPLE_ENV = {
  GC_HOST: 'GC_HOST',
  AUTH_SERVICE_USERS_URL: 'AUTH_SERVICE_USERS_URL',
  FEATURE_FLAGS_HOST: 'FEATURE_FLAGS_HOST',
  USER_DATA_HOST: 'USER_DATA_HOST',
  OAUTH_CLIENT_ID: 'OAUTH_CLIENT_ID',
  OAUTH_REDIRECT_URI: 'OAUTH_REDIRECT_URI',
  APP_ENVIRONMENT: 'APP_ENVIRONMENT',
};

const EXAMPLE_ENV_WIHT_MATOMO = {
  MATOMO_ENABLE_LOCALHOST: 'MATOMO_ENABLE_LOCALHOST',
  MATOMO_HOST: 'MATOMO_HOST',
  MATOMO_SITE_ID_LOCALHOST: 'MATOMO_SITE_ID_LOCALHOST',
};

function createMockForEnvWithout(attribute) {
  const newEnv = {};
  Object.assign(newEnv, EXAMPLE_ENV_WITH_REQUIRED_ATTRIBUTES);
  delete newEnv[attribute];
  return mockedEnv(newEnv);
}
describe('Server', () => {
  describe('env', () => {
    describe('parseEnv', () => {
      Object.keys(EXAMPLE_ENV_WITH_REQUIRED_ATTRIBUTES).forEach(attribute => {
        it(`throws an error when ${attribute} is missing`, () => {
          const restore = createMockForEnvWithout(attribute);
          expect(() => {
            parseEnv(process.env);
          }).toThrowError();
          restore();
        });
      });
      it(`provides a default value for static content path`, () => {
        const restoreMock = mockedEnv(EXAMPLE_ENV_WITH_REQUIRED_ATTRIBUTES);
        const config = parseEnv(process.env);
        expect(config.STATIC_CONTENT_PATH).toEqual('client/build/');
        restoreMock();
      });
      it(`accepts an override for static content path`, () => {
        const expectedValue = 'client/public/';
        const restoreMock = mockedEnv({
          ...EXAMPLE_ENV_WITH_REQUIRED_ATTRIBUTES,
          STATIC_CONTENT_PATH: expectedValue,
        });

        const config = parseEnv(process.env);
        expect(config.STATIC_CONTENT_PATH).toEqual(expectedValue);
        restoreMock();
      });
    });

    describe('parseClientEnv', () => {
      it('copies relevant attributes and prefixes it with REACT_APP_', () => {
        const clientEnv = parseClientEnv(EXAMPLE_ENV);
        [
          'REACT_APP_GC_HOST',
          'REACT_APP_AUTH_SERVICE_USERS_URL',
          'REACT_APP_FEATURE_FLAGS_HOST',
          'REACT_APP_USER_DATA_HOST',
          'REACT_APP_OAUTH_CLIENT_ID',
          'REACT_APP_OAUTH_REDIRECT_URI',
        ].forEach(properties => {
          expect(clientEnv[properties]).toEqual(
            EXAMPLE_ENV[properties.replace('REACT_APP_', '')]
          );
        });
        expect(clientEnv.REACT_APP_ENVIRONMENT).toEqual(EXAMPLE_ENV.APP_ENVIRONMENT);
      });
    });

    describe('optional parameters for local development', () => {
      it('should not add attributes, when the are undefined', () => {
        const clientEnv = parseClientEnv({});
        const json = JSON.stringify(clientEnv);
        [
          'REACT_APP_MATOMO_ENABLE_LOCALHOST',
          'REACT_APP_MATOMO_HOST',
          'REACT_APP_MATOMO_SITE_ID_LOCALHOST',
        ].forEach(properties => {
          expect(clientEnv[properties]).toBeUndefined();
          expect(json).not.toMatch(properties);
        });
      });
      it('should add attributes, when they are defined', () => {
        const clientEnv = parseClientEnv(EXAMPLE_ENV_WIHT_MATOMO);
        [
          'REACT_APP_MATOMO_ENABLE_LOCALHOST',
          'REACT_APP_MATOMO_HOST',
          'REACT_APP_MATOMO_SITE_ID_LOCALHOST',
        ].forEach(properties => {
          expect(clientEnv[properties]).toEqual(
            EXAMPLE_ENV_WIHT_MATOMO[properties.replace('REACT_APP_', '')]
          );
        });
      });
    });
  });
});
