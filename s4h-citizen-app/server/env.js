const envalid = require('envalid');
const path = require('path');
const dotenv = require('dotenv');

if (process.env.NODE_ENV !== 'test') {
  dotenv.config({
    path: path.join(__dirname, '/../.env'),
  });
}

/**
 * Default values
 */
const DEFAULT_PORT = 8080;
const DEFAULT_CLIENT_NAME = 's4h-citizen-app';
const DEFAULT_STATIC_CONTENT_PATH = 'client/build/';

/**
 * There seems to already be an ENVIRONMENT variable set
 * but it does not have the correct value
 */
const DEFAULT_APP_ENVIRONMENT = 'development';

const validators = {
  PORT: envalid.port({ default: DEFAULT_PORT }),

  CLIENT_NAME: envalid.str({ default: DEFAULT_CLIENT_NAME }),

  COOKIE_KEY: envalid.str(),

  OAUTH_CLIENT_ID: envalid.str(),
  OAUTH_CLIENT_SECRET: envalid.str(),
  OAUTH_REDIRECT_URI: envalid.url(),

  GC_HOST: envalid.url(),

  FEATURE_FLAGS_HOST: envalid.url(),
  USER_DATA_HOST: envalid.url(),

  AUTH_SERVICE_USERS_URL: envalid.url(),
  AUTH_SERVICE_TOKEN_URL: envalid.url(),
  AUTH_SERVICE_REVOKE_URL: envalid.url(),

  APP_ENVIRONMENT: envalid.str({ default: DEFAULT_APP_ENVIRONMENT }),

  MATOMO_ENABLE_LOCALHOST: envalid.str({ default: '' }),
  MATOMO_HOST: envalid.str({ default: '' }),
  MATOMO_SITE_ID_LOCALHOST: envalid.str({ default: '' }),

  STATIC_CONTENT_PATH: envalid.str({ default: DEFAULT_STATIC_CONTENT_PATH }),

  TCTOKEN_URL: envalid.url(),
  TCTOKEN_URL_EIDAS: envalid.url(),
};

const OPTIONAL_PROPERTIES = [
  'MATOMO_ENABLE_LOCALHOST',
  'MATOMO_HOST',
  'MATOMO_SITE_ID_LOCALHOST',
];

const parseClientEnv = env => {
  const {
    GC_HOST: REACT_APP_GC_HOST,
    AUTH_SERVICE_USERS_URL: REACT_APP_AUTH_SERVICE_USERS_URL,
    FEATURE_FLAGS_HOST: REACT_APP_FEATURE_FLAGS_HOST,
    TCTOKEN_URL: REACT_APP_TCTOKEN_URL,
    TCTOKEN_URL_EIDAS: REACT_APP_TCTOKEN_URL_EIDAS,
    USER_DATA_HOST: REACT_APP_USER_DATA_HOST,
    OAUTH_CLIENT_ID: REACT_APP_OAUTH_CLIENT_ID,
    OAUTH_REDIRECT_URI: REACT_APP_OAUTH_REDIRECT_URI,
    APP_ENVIRONMENT: REACT_APP_ENVIRONMENT,
  } = JSON.parse(JSON.stringify(env));
  const clientEnv = {
    REACT_APP_GC_HOST,
    REACT_APP_AUTH_SERVICE_USERS_URL,
    REACT_APP_FEATURE_FLAGS_HOST,
    REACT_APP_TCTOKEN_URL,
    REACT_APP_TCTOKEN_URL_EIDAS,
    REACT_APP_USER_DATA_HOST,
    REACT_APP_OAUTH_CLIENT_ID,
    REACT_APP_OAUTH_REDIRECT_URI,
    REACT_APP_ENVIRONMENT,
  };
  // optional properties should not be returned even if they are empty or null
  OPTIONAL_PROPERTIES.forEach(property => {
    if (env[property] && env[property] !== '') {
      clientEnv[`REACT_APP_${property}`] = env[property];
    }
  });

  return clientEnv;
};

exports.parseEnv = (environment = process.env, _options = {}) => {
  const options = _options;

  if (!options.reporter) {
    options.reporter = ({ errors }) => {
      if (Object.keys(errors).length > 0) {
        throw errors;
      }
    };
  }
  return envalid.cleanEnv(environment, validators, {
    ...options,
  });
};

exports.parseClientEnv = parseClientEnv;
