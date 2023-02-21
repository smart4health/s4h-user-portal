import D4LSDK from '@d4l/js-sdk';
// eslint-disable-next-line import/named
import { client } from '.';
import config from '../config';
import { actions } from '../store';
import { NotLoggedInError } from '../utils/error/login';

/**
 * onceElse executed the first arg on the first call
 * and executes the second arg on all other calls.
 *
 * @param {function} f - function executed on first call
 * @param {function} h - function executed on every other call
 * @returns {*} what ever f and h are returning
 */
const onceElse =
  (f, h, notCalled = true) =>
  () => {
    if (notCalled) {
      // eslint-disable-next-line no-param-reassign
      notCalled = false;
      return f();
    }
    return h();
  };

export const fetchAccessToken = () =>
  client
    .post('/access_token', {
      credentials: 'same-origin',
    })
    .then(res => {
      if (!res.data || !res.data.access_token) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject('SESSION_EXPIRED');
      }

      return res.data.access_token;
    });

export const setupSDK = async (privateKey, accessToken) => {
  const getToken = onceElse(
    () => Promise.resolve(accessToken),
    () =>
      fetchAccessToken().catch(error => {
        actions.onSessionExpired();
        return Promise.reject(error);
      })
  );

  // Error handling is outside of this method to facilitate
  // proper redirect to Login screen if SDK can't be initialised
  // Without SDK initialised there's no point in accessing the rest
  // of the app

  // eslint-disable-next-line no-return-await
  return await D4LSDK.setup({
    clientId: config.REACT_APP_OAUTH_CLIENT_ID,
    environment: config.REACT_APP_ENVIRONMENT,
    privateKey,
    requestAccessToken: getToken,
    extendedEnvConfig: {
      api: config.REACT_APP_GC_HOST,
    },
    fhirVersion: '4.0.1',
  });
};

export const handleSDKErrors = error => {
  console.error(error);

  /**
   * Something bad happened with the SDK and is no longer able to work
   * with data. Log out the user.
   */
  if (error.status === 401 && actions && actions.doLogout) {
    actions.doLogout();
  }
};

/*
 * Simple wrapper for SDK.createResource with userId and error handling.
 */
export const createSDKResource = async resource => {
  try {
    if (!D4LSDK.getCurrentUserId()) {
      throw new NotLoggedInError();
    }
    return await D4LSDK.createResource(D4LSDK.getCurrentUserId(), resource);
  } catch (error) {
    handleSDKErrors(error);
  }
};

/*
 * Simple wrapper for SDK.fetchResources with userId and error handling.
 */
export const fetchSDKResources = async params => {
  try {
    if (!D4LSDK.getCurrentUserId()) {
      throw new NotLoggedInError();
    }
    return await D4LSDK.fetchResources(D4LSDK.getCurrentUserId(), params);
  } catch (error) {
    handleSDKErrors(error);
  }
};

/*
 * Simple wrapper for SDK.updateResource with userId and error handling.
 */
export const updateSDKResource = async (resource, date, tags) => {
  try {
    if (!D4LSDK.getCurrentUserId()) {
      throw new NotLoggedInError();
    }
    return await D4LSDK.updateResource(
      D4LSDK.getCurrentUserId(),
      resource,
      date,
      tags
    );
  } catch (error) {
    handleSDKErrors(error);
  }
};

/*
 * Simple wrapper for SDK.deleteResource with userId and error handling.
 */
export const deleteSDKResource = async resourceId => {
  try {
    if (!D4LSDK.getCurrentUserId()) {
      throw new NotLoggedInError();
    }
    return await D4LSDK.deleteResource(D4LSDK.getCurrentUserId(), resourceId);
  } catch (error) {
    handleSDKErrors(error);
  }
};

/*
 * This is a variant of `deleteSDKResource`, with a difference in the return behavior.
   
   1. Instead of swallowing any errors up, this returns a rejected promise, so the
   caller can know that something went wrong.
   2. In the non-error case the resource id of the just deleted resource is returned.
 */
export const deleteSDKResourceWithRejectionPropagation = async resourceId => {
  try {
    if (!D4LSDK.getCurrentUserId()) {
      throw new NotLoggedInError();
    }
    await D4LSDK.deleteResource(D4LSDK.getCurrentUserId(), resourceId);
    return resourceId;
  } catch (error) {
    handleSDKErrors(error);
    return Promise.reject(`Deletion of resource failed for id: ${resourceId}`);
  }
};

export const countSDKResouce = async params => {
  try {
    if (!D4LSDK.getCurrentUserId()) {
      throw new NotLoggedInError();
    }
    return await D4LSDK.countResources(D4LSDK.getCurrentUserId(), params);
  } catch (error) {
    handleSDKErrors(error);
  }
};
