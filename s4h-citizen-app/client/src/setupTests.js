import { TextEncoder, TextDecoder } from 'util';
import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

global.fetch = require('jest-fetch-mock');
/* eslint-enable import/no-extraneous-dependencies */
global.crypto = require('crypto').webcrypto;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.D4L = {
  SDK: {
    getCodeFromCodeableConcept: () => {},
    getCurrentUserId: () => {},
    setCurrentUserLanguage: () => {},
    sealCAP: () => {},
    crypto: {
      createLoginHash: jest.fn(),
    },
    models: {
      D4LSpecialty: {},
      DocumentReference: {
        fromFHIRObject: () => ({
          getAttachments: () => {},
          getAuthor: () => {},
          getTitle: () => {},
          getType: () => {},
          getPracticeSpecialty: () => {},
        }),
      },
    },
  },
};

/**
 * Had to add this mock due to react-slict causing tests to fail
 */
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener() {},
      removeListener() {},
    };
  };

/**
 * Provide default values for required configuration properties
 * Those are normally provided by craco when running natively
 * or by the backend statically injected into the "index.html"
 * when running on live-clusters.
 */
window.ENV_DATA = {
  REACT_APP_ENVIRONMENT: 'd4l',
  REACT_APP_GC_HOST: 'http://localhost',
  REACT_APP_AUTH_SERVICE_USERS_URL: 'http://localhost/users',
  REACT_APP_OAUTH_CLIENT_ID: '1',
  REACT_APP_OAUTH_REDIRECT_URI: 'aa',
  REACT_APP_FEATURE_FLAGS_HOST: 'aa',
  REACT_APP_TCTOKEN_URL: 'aa',
  REACT_APP_TCTOKEN_URL_EIDAS: 'aa',
  REACT_APP_USER_DATA_HOST: 'aa',
};

global.window = Object.create(window);
