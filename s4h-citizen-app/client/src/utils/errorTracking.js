import * as Sentry from '@sentry/browser';
import FilterErrorEventData from './filterErrorEventData';
import config from '../config';

const initializeErrorTracking = () => {
  if (config.REACT_APP_ENVIRONMENT === 'development') {
    return;
  }

  Sentry.init({
    beforeSend: event => new FilterErrorEventData().onEvent(event),
    dsn: config.SENTRY_DSN,
    environment: config.REACT_APP_ENVIRONMENT,
  });
};

export const disableErrorTracking = () => {
  Sentry.getCurrentHub()
    .getClient()
    .getOptions().enabled = false;
};

export default initializeErrorTracking;
