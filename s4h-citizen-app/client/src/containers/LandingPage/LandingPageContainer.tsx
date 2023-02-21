import queryString from 'query-string';
import React, { Component } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Redirect, Route, RouteComponentProps, withRouter } from 'react-router-dom';
import { ExternalPinView, ExternalSharedDataView } from '..';
import config from '../../config';
import { actions, connect } from '../../store';
import { RootState, UserData } from '../../types';
import OnboardingPage from './OnboardingPage';

interface Props extends WithTranslation, RouteComponentProps {
  userData: UserData;
  loggedIn: boolean;
  redirectURL: string;
}

export class LandingPageContainer extends Component<Props> {
  componentDidMount() {
    this.validateUrlActions();
  }

  validateUrlActions = () => {
    const { location } = this.props;
    const search = location.search ?? '';
    const query = queryString.parse(search);
    actions.verifyEmail(query);
  };

  render() {
    const { loggedIn, redirectURL } = this.props;
    const { ROUTES } = config;
    if (loggedIn) {
      /**
       * Check for cases where the user ends up in a separate route
       * eg: d4l/share but goes to webauthapp for login afterwards
       */
      if (redirectURL) {
        return <Redirect to={redirectURL} />;
      }

      return <Redirect to={ROUTES.dashboard} />;
    }
    return (
      <>
        <Route path={ROUTES.home} exact component={OnboardingPage} />
        <Route path={ROUTES.share} exact component={ExternalPinView} />
        <Route path={config.ROUTES.shared_data} component={ExternalSharedDataView} />
      </>
    );
  }
}

export default connect(({ loggedIn, userData, redirectURL }: RootState) => ({
  loggedIn,
  userData,
  redirectURL,
}))(withRouter(withTranslation()(LandingPageContainer)));
