import { LandingPageContainer } from './LandingPageContainer';
import { render, history } from '../../utils/test-utils';
import { actions } from '../../store';

describe('LandingPageContainer', () => {
  beforeEach(() => {
    actions.verifyEmail = jest.fn();
  });
  describe('Functionality', () => {
    describe('When the user is logged in', () => {
      it('redirects the user to the redirectURL when the prop is passed', () => {
        const props = {
          loggedIn: true,
          redirectURL: '/legal',
          location: history.location,
        };
        render(<LandingPageContainer {...props} />);
        expect(history.location.pathname).toEqual('/legal');
      });
      it('redirects the user to the dashboard when redirectURL prop is not passed', () => {
        const props = {
          loggedIn: true,
          redirectURL: undefined,
          location: history.location,
        };
        render(<LandingPageContainer {...props} />);
        expect(history.location.pathname).toEqual('/d4l/dashboard');
      });
    });

    it('validates the email when the search query parameter is available', () => {
      history.location.search = '?email=test@test.com&code=abcd';
      const props = {
        loggedIn: false,
        location: history.location,
      };
      render(<LandingPageContainer {...props} />);

      expect(actions.verifyEmail).toHaveBeenCalledTimes(1);
    });
  });
});
