import { actions } from '../..';
import config from '../../../config';
import d4lDB from '../../../utils/D4LDB';
import state from '../../state';
import globalActions from '../globalActions';

const TEST_CAP = 'TEST_CAP';
const TEST_ACCESS_TOKEN = 'TEST_ACCESS_TOKEN';
const TEST_USER_DATA = {
  verified: true,
  email: 'email',
  created: 'created',
};

describe('loginSuccess', () => {
  afterEach(jest.resetAllMocks);
  afterAll(jest.restoreAllMocks);

  it('sets the user data', async () => {
    // @ts-ignore
    const setupD4LSDKSpy = jest.spyOn(actions, 'setupD4LSDK').mockImplementation();
    const populateFlagsSpy = jest
      // @ts-ignore
      .spyOn(actions, 'populateFlags')
      .mockImplementation();

    // @ts-ignore
    const dismissNotificationSpy = jest.spyOn(actions, 'dismissNotification').mockImplementation(); // prettier-ignore
    const d4lDBSetSpy = jest.spyOn(d4lDB, 'set').mockImplementation();

    state.access_token = TEST_ACCESS_TOKEN;
    const newState = await globalActions.loginSuccess(
      state,
      actions,
      TEST_CAP,
      TEST_USER_DATA
    );

    expect(setupD4LSDKSpy).toHaveBeenCalledWith(TEST_CAP, TEST_ACCESS_TOKEN);
    expect(d4lDBSetSpy).toHaveBeenCalledWith('logged-in', true);
    expect(populateFlagsSpy).toHaveBeenCalled();
    expect(dismissNotificationSpy).toHaveBeenCalled();

    expect(newState).toEqual({
      access_token: TEST_ACCESS_TOKEN,
      userData: TEST_USER_DATA,
      loggedIn: true,
      registrationPassword: '',
      recoveryKey: '',
      sessionState: config.SESSION_STATE.INITIALIZED,
    });
  });
});
