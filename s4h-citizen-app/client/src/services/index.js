import axios from 'axios';
import D4LSDK from '@d4l/js-sdk';
import { actions } from '../store';
import { fetchApplications, revokeAccessOfApplication } from './applications';
import deleteAccount from './deleteAccount';
import verifyEmail from './verifyEmail';
import getToken from './getToken';
import logout from './logout';
import getUserData from './userData';
import { setupSDK } from './D4L';

// use this instance for ALL api calls!
const client = axios.create({});

client.interceptors.request.use(
  async config => {
    await D4LSDK.throttleRequest();

    if (config.params && 'retry' in config.params) {
      // eslint-disable-next-line no-param-reassign
      config.retry = config.params.retry;
      // eslint-disable-next-line no-param-reassign
      delete config.params.retry;
    }

    return config;
  },
  error => Promise.reject(error) // TODO properly handle here, e.g. when offline
);

client.interceptors.response.use(
  config => config,
  async error => {
    const { config } = error;
    const retry = !config || config.retry !== false;

    if (error.response && error.response.status === 401 && retry) {
      try {
        const { data } = await axios.post('/access_token');
        if (data && data.access_token) {
          actions.setAccessToken(data.access_token);
          config.headers.Authorization = `Bearer ${data.access_token}`;
          config.params = { ...config.params, retry: false };
          return client.request(config);
        }

        actions.onSessionExpired();
        return Promise.reject(error);
      } catch (retryError) {
        actions.onSessionExpired();
        return Promise.reject(retryError);
      }
    } else {
      return Promise.reject(error);
    }
  }
);

export {
  logout,
  fetchApplications,
  revokeAccessOfApplication,
  deleteAccount,
  verifyEmail,
  getToken,
  getUserData,
  setupSDK,
  client,
};

export * from './document';
