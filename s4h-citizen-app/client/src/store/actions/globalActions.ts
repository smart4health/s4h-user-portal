import config from '../../config';
import { getFlags } from '../../config/flags';
import { getToken, getUserData, logout, setupSDK } from '../../services';
import verifyEmail from '../../services/verifyEmail';
import { Actions, RootState, UserData } from '../../types';
import d4lDB from '../../utils/D4LDB';
import settings, { SettingKeys } from '../../utils/settings';
import rootState from '../state';

export const setLoginData = (userData: UserData, access_token: string) => ({
  access_token,
  userData,
  loggedIn: true,
  registrationPassword: '',
  recoveryKey: '',
  sessionState: config.SESSION_STATE.INITIALIZED,
});

const persistRegistrationFlag = () => {
  if (!settings.isRegisteredUser) {
    settings.isRegisteredUser = true;
  }

  settings.lastSessionRefresh = new Date().getTime();
};

const globalActions = {
  reactivateSessionOrRedirect: async (currentState: RootState, actions: Actions) => {
    // either pull current user Data and store it for established sessions
    // if no cap is available, the user must login and is forwarded to the landing page

    // if cap is present, all necessary crypto material is there
    // it is expected, that the user's session can be re-activated
    // so that the user can be loogedIn automatically
    const cap = await d4lDB.get('cap');
    if (cap) {
      // Even if currently no access token is defined, the user data is requested.
      // The interceptor will try to retrieve the access token on error
      const access_token = currentState.access_token || '';

      // try to fetch user details
      //   if a the access token is not present or valid a new access token will be requested implicitly from the backend
      const userData = await getUserData(access_token);
      actions.loginSuccess(cap, userData);
      // session has successfully established
    } else {
      const urlBeforeLogin = window.location.pathname;
      if (urlBeforeLogin !== '/') {
        await d4lDB.set('redirect-after-login-url', urlBeforeLogin);
      }
      actions.redirectToLanding();
    }
  },
  finishLogin: async (
    _currentState: RootState,
    actions: Actions,
    code: any,
    state: string
  ) => {
    const authorisationState = await d4lDB.get('authorisationState');
    const cap = await d4lDB.get('temp-cap');

    if (state !== authorisationState) {
      actions.setNotification('error_auth_state', 'error');
      actions.setAppState(config.APP_STATE.SUCCESS);

      throw new Error(
        'The authorizaton state parameter is missing or does not match the one stored in d4lDB session data as authorizationState.'
      );
    }

    const tokenResponse = await getToken(code);
    const tokenResponseAccessToken = tokenResponse.data.access_token;

    await actions.setAccessToken(tokenResponseAccessToken);
    const userData = await getUserData(tokenResponseAccessToken);

    // @ts-ignore
    await d4lDB.set('verified', userData.verified);
    await d4lDB.set('cap', cap);

    const redirectURL = await d4lDB.get('redirect-after-login-url');
    d4lDB.remove('redirect-after-login-url');
    if (redirectURL) {
      actions.setRedirectURL(redirectURL);
    }

    return actions.loginSuccess(cap, userData);
  },
  loginSuccess: async (
    currentState: RootState,
    actions: Actions,
    cap: string,
    userData: UserData
  ) => {
    persistRegistrationFlag();
    const { access_token } = currentState;
    try {
      await actions.setupD4LSDK(cap, access_token);
      await d4lDB.set('logged-in', true);
      await actions.populateFlags();
      actions.dismissNotification();
      // @ts-ignore
      const state = setLoginData(userData, access_token);
      return { ...state };
    } catch (error) {
      console.error(error);
      return actions.onSessionExpired();
    }
  },
  setupD4LSDK: async (
    _currentState: RootState,
    _actions: Actions,
    privateKey: string,
    accessToken: string
  ) => {
    await setupSDK(privateKey, accessToken);
    return { SDKConnected: true };
  },
  setAccessToken: (
    _currentState: RootState,
    _actions: Actions,
    access_token: string
  ) => ({
    access_token,
  }),
  doLogout: (
    _currentState: RootState,
    // @ts-ignore
    actions: Actions,
    additionalState: object = {}
  ) => {
    localStorage.removeItem(SettingKeys.END_OF_LIFE_BANNER_VISIBLE);
    logout();

    d4lDB.clear();

    return {
      ...rootState,
      ...additionalState,
      redirectToLanding: true,
      appState: config.APP_STATE.SUCCESS,
    };
  },
  // @ts-ignore
  onSessionExpired: (currentState: RootState, actions: Actions) => {
    const notificationState = settings.hadRefreshedSessionToday
      ? {
          notification: {
            translationKey: 'SESSION_EXPIRED',
            notifPrefix: '',
            show: true,
            type: 'warning',
          },
        }
      : {};

    return actions.doLogout(notificationState);
  },
  verifyEmail: async (
    _currentState: RootState,
    actions: Actions,
    query: { email: string; code: string }
  ) => {
    try {
      const { email, code } = query;
      if (email && code) {
        const response = await verifyEmail(email, code);
        if (response.status < 400) {
          actions.setNotification('email_validated', 'success');
        } else {
          // @ts-ignore
          const data = await response.json();
          actions.setNotification(data.error_code, 'error');
        }
      }
    } catch (error) {
      actions.setNotification('email_validated_error', 'error');
    }
  },
  redirectToLanding: () => ({
    redirectToLanding: true,
    sessionState: config.SESSION_STATE.INITIALIZED,
  }),
  setNotification: (
    currentState: RootState,
    _actions: Actions,
    translationKey: string,
    type: string = 'error',
    notifPrefix: string = ''
  ) => ({
    ...currentState,
    notification: { type, translationKey, notifPrefix, show: true },
  }),

  dismissNotification: () => ({
    notification: {
      translationKey: '',
      notifPrefix: '',
      type: '',
      show: false,
    },
  }),
  async populateFlags({ access_token }: RootState) {
    return {
      flags: await getFlags(access_token || undefined),
    };
  },
  setAppInitialized: (
    _currentState: RootState,
    _actions: Actions,
    appInitialized: boolean
  ) => ({
    appInitialized,
  }),
  setRedirectURL: (
    currentState: RootState,
    _actions: Actions,
    redirectURL?: string
  ) => ({
    ...currentState,
    ...(redirectURL !== document.location.pathname && { redirectURL }),
  }),
  /**
   * Set the app state. Possible values: loading, success, error
   */
  setAppState: (_currentState: RootState, _actions: Actions, appState: string) => ({
    appState,
  }),
};

export default globalActions;
