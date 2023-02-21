import { actions } from '../../';
import * as getUserData from '../../../services/userData';
import d4lDB from '../../../utils/D4LDB';
import state from '../../state';
import globalActions from '../globalActions';

const TEST_CAP = 'TEST_CAP';
const TEST_USER_DATA = {
  verified: true,
  email: 'email',
  created: 'created',
};

const TEST_USER_DATA_ERROR = {
  error: new Error(),
};

describe('reactivateSessionOrRedirect', () => {
  afterEach(jest.resetAllMocks);
  afterAll(jest.restoreAllMocks);
  const getUserDataSpy = jest.spyOn(getUserData, 'default');
  // @ts-expect-error
  const loginSuccessSpy = jest.spyOn(actions, 'loginSuccess');
  // @ts-expect-error
  const redirectToLandingSpy = jest.spyOn(actions, 'redirectToLanding');
  describe('with CAP', () => {
    it('tries to reactivate the users session', async () => {
      jest.spyOn(d4lDB, 'get').mockResolvedValue(TEST_CAP);
      getUserDataSpy.mockResolvedValue(TEST_USER_DATA);
      await globalActions.reactivateSessionOrRedirect(state, actions);
      expect(loginSuccessSpy).toHaveBeenCalledWith(TEST_CAP, TEST_USER_DATA);
      expect(getUserDataSpy).toHaveBeenCalled();
      expect(redirectToLandingSpy).not.toHaveBeenCalled();
    });
    describe('without a valid session', () => {
      it('tries to reactivate the users session', async () => {
        jest.spyOn(d4lDB, 'get').mockResolvedValue(TEST_CAP);
        getUserDataSpy.mockResolvedValue(TEST_USER_DATA_ERROR);
        await globalActions.reactivateSessionOrRedirect(state, actions);
        expect(getUserDataSpy).toHaveBeenCalled();
        expect(loginSuccessSpy).toHaveBeenCalled();
        expect(redirectToLandingSpy).not.toHaveBeenCalled();
      });
    });
  });
  describe('without CAP', () => {
    it('should be able to change email', async () => {
      jest.spyOn(d4lDB, 'get').mockResolvedValue(null);
      await globalActions.reactivateSessionOrRedirect(state, actions);
      expect(getUserDataSpy).not.toHaveBeenCalled();
      expect(loginSuccessSpy).not.toHaveBeenCalled();
      expect(redirectToLandingSpy).toHaveBeenCalled();
    });
  });
});
