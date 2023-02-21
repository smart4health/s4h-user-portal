import queryString from 'query-string';
import React, { Component } from 'react';
// @ts-ignore
import { FeatureToggleProvider } from 'react-feature-toggles';
import { connect as reduxConnect, ConnectedProps } from 'react-redux';
import { Route, RouteComponentProps, Switch, withRouter } from 'react-router-dom';
import {
  ConditionalRedirectRoute,
  Cookie,
  CountdownSession,
  NotFoundComponent,
  NotificationComponent,
} from './components';
import EndOfLifeBanner from './components/EndOfLifeBanner';
import IncompletenessDisclaimer from './components/IncompletenessDisclaimer';
import config from './config';
import { Flags } from './config/flags';
import ModalRoot from './features/modals/ModalRoot';
import { AppState } from './redux';
import {
  selectIsEOLBannerVisible,
  selectIsCookieChoiceMade,
  selectIsSharingMode,
  viewportSizeChanged,
} from './redux/globalsSlice';
import { actions, connect } from './store';
import { RootState } from './types';
import debounce from './utils/debounce';
import initializeErrorTracking from './utils/errorTracking';
import settings from './utils/settings';

interface AppProps extends RouteComponentProps {
  loggedIn: boolean;
  redirectToLanding: boolean;
  flags: Flags;
  sessionState: string;
}

const LegalContainer = React.lazy(() => import('./features/Content/Legal'));
const LandingPageContainer = React.lazy(() => import('./containers/LandingPage'));
const MainLayoutContainer = React.lazy(() => import('./containers/MainLayout'));
const SupportContainer = React.lazy(() => import('./features/Content/Support'));

const landingPagePaths = `(${config.ROUTES.home}|${config.ROUTES.share}|${config.ROUTES.shared_data}|${config.ROUTES.shared_documents}|${config.ROUTES.shared_summary}|${config.ROUTES.shared_medication})?/`;

const mapStateToProps = (state: AppState) => ({
  isSharingMode: selectIsSharingMode(state),
  isEOLBannerVisible: selectIsEOLBannerVisible(state),
  isCookieChoiceMade: selectIsCookieChoiceMade(state),
});

const mapDispatchToProps = {
  viewportSizeChanged,
};

const connector = reduxConnect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = AppProps & PropsFromRedux;

export class App extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  resizeChanges = () => {
    this.props.viewportSizeChanged();
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  async componentDidMount() {
    // fix viewport height on mobile devices for modal dialog
    // https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    window.addEventListener('resize', debounce(this.resizeChanges, 160));

    const { location } = this.props;
    const { search } = location;
    const query = queryString.parse(search);
    const { code, state, email } = query;

    if (!code || email) {
      actions.setAppState(config.APP_STATE.SUCCESS);
      await actions.reactivateSessionOrRedirect();
    } else {
      await actions.finishLogin(code, state);
    }

    if (this.props.isCookieChoiceMade && settings.acceptsCookies) {
      initializeErrorTracking();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeChanges);
  }

  renderNotFoundPage = () => {
    const {
      location: { pathname },
    } = this.props;
    if (
      Object.values(config.ROUTES).indexOf(pathname) === -1 &&
      !pathname.startsWith('/d4l')
    ) {
      return <Route component={NotFoundComponent} />;
    }
  };

  render() {
    const {
      loggedIn,
      redirectToLanding,
      flags,
      sessionState,
      isSharingMode,
      isEOLBannerVisible,
    } = this.props;
    const userSessionChecked = sessionState !== config.SESSION_STATE.LOADING;

    return (
      <div className="AppWrapper">
        <div className="AppWrapper__notifications">
          {!isSharingMode && loggedIn && isEOLBannerVisible && <EndOfLifeBanner />}
          <Cookie />
          {isSharingMode && <IncompletenessDisclaimer />}
        </div>
        <div className="AppWrapper__content">
          <React.Suspense
            fallback={
              <div className="AppWrapper__loader">
                <d4l-spinner />
              </div>
            }
          >
            <FeatureToggleProvider featureToggleList={flags}>
              <CountdownSession />
              <NotificationComponent />
              <Switch>
                {(userSessionChecked || redirectToLanding) && (
                  <Route
                    path={landingPagePaths}
                    exact
                    component={LandingPageContainer}
                  />
                )}
                {(loggedIn || redirectToLanding) && (
                  <ConditionalRedirectRoute
                    path={config.ROUTES.app_home}
                    component={MainLayoutContainer}
                    condition={loggedIn}
                    redirectPath="/"
                  />
                )}
                <Route path={config.ROUTES.legal} component={LegalContainer} />
                <Route path={config.ROUTES.support} component={SupportContainer} />
                {this.renderNotFoundPage()}
              </Switch>
              <ModalRoot />
            </FeatureToggleProvider>
          </React.Suspense>
        </div>
      </div>
    );
  }
}

const AppConnectedToWaterfall = connect(
  ({ loggedIn, redirectToLanding, flags, sessionState }: RootState) => ({
    loggedIn,
    redirectToLanding,
    flags,
    sessionState,
  })
)(App);

export default withRouter(connector(AppConnectedToWaterfall));
