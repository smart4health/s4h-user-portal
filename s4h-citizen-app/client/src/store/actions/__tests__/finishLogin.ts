import { AxiosResponse } from 'axios';
import { actions } from '../../';
import * as getToken from '../../../services/getToken';
import * as getUserData from '../../../services/userData';
import d4lDB from '../../../utils/D4LDB';
import state from '../../state';
import globalActions from '../globalActions';

const TEST_CAP = 'TEST_CAP';
const TEST_CODE = 'TEST_CODE';
const TEST_STATE = 'TEST_STATE';
const TEST_REDIRECT_URL = 'TEST_REDIRECT_URL';
const TEST_USER_DATA = {
  verified: true,
  email: 'email',
  created: 'created',
};

const TEST_GET_TOKEN_RESPONSE: AxiosResponse = {
  data: {
    access_token: 'access_token',
  },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
};

describe('finishLogin', () => {
  afterEach(jest.resetAllMocks);
  afterAll(jest.restoreAllMocks);

  const getUserDataSpy = jest.spyOn(getUserData, 'default');
  const getTokenSpy = jest.spyOn(getToken, 'default');
  // @ts-ignore
  const setNotificationSpy = jest.spyOn(actions, 'setNotification');
  // @ts-ignore
  const setAppStateSpy = jest.spyOn(actions, 'setAppState');
  // @ts-ignore
  const setAccessTokenSpy = jest.spyOn(actions, 'setAccessToken');
  // @ts-ignore
  const setRedirectURLSpy = jest.spyOn(actions, 'setRedirectURL');
  // @ts-ignore
  const loginSuccessSpy = jest.spyOn(actions, 'loginSuccess');

  const d4lDBSetSpy = jest.spyOn(d4lDB, 'set').mockImplementation();
  const d4lDBRemoveSpy = jest.spyOn(d4lDB, 'remove').mockImplementation();
  beforeEach(() => {
    jest
      .spyOn(d4lDB, 'get')
      .mockResolvedValueOnce(TEST_STATE)
      .mockResolvedValueOnce(TEST_CAP)
      .mockResolvedValueOnce(TEST_REDIRECT_URL);
  });

  it('logs in the user', async () => {
    getUserDataSpy.mockResolvedValue(TEST_USER_DATA);
    getTokenSpy.mockResolvedValue(TEST_GET_TOKEN_RESPONSE);
    await globalActions.finishLogin(state, actions, TEST_CODE, TEST_STATE);

    expect(setAccessTokenSpy).toHaveBeenCalledWith(
      TEST_GET_TOKEN_RESPONSE.data.access_token
    );
    expect(getUserDataSpy).toHaveBeenCalledWith(
      TEST_GET_TOKEN_RESPONSE.data.access_token
    );
    expect(d4lDBSetSpy).toHaveBeenCalledWith('verified', TEST_USER_DATA.verified);
    expect(d4lDBSetSpy).toHaveBeenCalledWith('cap', TEST_CAP);
    expect(setRedirectURLSpy).toHaveBeenCalledWith(TEST_REDIRECT_URL);
    expect(d4lDBRemoveSpy).toHaveBeenCalledWith('redirect-after-login-url');
    expect(loginSuccessSpy).toHaveBeenCalledWith(TEST_CAP, TEST_USER_DATA);
  });
  describe('with the wrong state', () => {
    it('stops the procedure', async () => {
      await expect(
        globalActions.finishLogin(state, actions, TEST_CODE, 'wrong_state')
      ).rejects.toThrow();

      expect(setNotificationSpy).toHaveBeenCalledWith('error_auth_state', 'error');
      expect(setAppStateSpy).toHaveBeenCalledWith('success');
      expect(getTokenSpy).not.toHaveBeenCalled();
    });
  });
});
