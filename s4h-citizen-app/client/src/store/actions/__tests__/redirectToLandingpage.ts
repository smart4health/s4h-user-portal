import config from '../../../config';
import globalActions from '../globalActions';

describe('redirectToLanding', () => {
  it('sets the redirectToLanding', () => {
    const newState = globalActions.redirectToLanding();
    expect(newState.redirectToLanding).toEqual(true);
  });
  it('sets the sessionState', () => {
    const newState = globalActions.redirectToLanding();
    expect(newState.sessionState).toEqual(config.SESSION_STATE.INITIALIZED);
  });
});
