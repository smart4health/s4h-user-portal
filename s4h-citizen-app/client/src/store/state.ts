import config from '../config';
import { fixedFlags, initialDynamicFlags } from '../config/flags';
import { RootState } from '../types';

const rootState: RootState = {
  loggedIn: false,
  SDKConnected: false,
  redirectURL: null,
  modal: {
    activeModal: '',
  },
  notification: {
    // @ts-ignore
    text: '',
    type: '',
    show: false,
  },
  redirectToLanding: false,
  access_token: null,
  appState: config.APP_STATE.LOADING, // loading, success, error
  appInitialized: false,
  sessionState: config.SESSION_STATE.LOADING,
  flags: {
    ...fixedFlags,
    ...initialDynamicFlags,
  },
};

export const customizeInitialState = (extendedState: Partial<RootState>) => {
  Object.keys(extendedState).forEach(key => {
    (rootState as any)[key] = (extendedState as any)[key];
  });
};

export default rootState;
