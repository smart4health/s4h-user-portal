import config from '../../config';
import state from '../state';

describe('state', () => {
  describe('sessionState', () => {
    it('defaults to loading', () => {
      expect(state.sessionState).toEqual(config.SESSION_STATE.LOADING);
    });
  });
});
