import React, { Component } from 'react';
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter,
} from 'react-router-dom';
import { HealthDataViewer, MedicationContainer, SharingContainer } from '..';
import { ConditionalRedirectRoute } from '../../components';
import ViewLoader from '../../components/ViewLoader';
import config from '../../config';
import { featureNames, Flags } from '../../config/flags';
import DashboardContainer from '../../features/Dashboard';
import NotFound from '../../features/NotFound';
import ProfileContainer from '../../features/Profile';
import SummaryContainer from '../../features/Summary';
import { actions, connect } from '../../store';
import { RootState, UserData } from '../../types';

interface Props extends RouteComponentProps {
  access_token: string;
  userData: UserData;
  appState: string;
  flags: Flags;
}

class MainLayoutContainer extends Component<Props> {
  componentDidMount() {
    actions.setAppInitialized(true);
    actions.setAppState(config.APP_STATE.SUCCESS);
  }

  render() {
    const { flags } = this.props;
    const healthDataCondition = flags[featureNames.HEALTH_DATA];
    const shareCondition = flags[featureNames.SHARING];
    const medicationCondition = flags[featureNames.MEDICATION];
    const summaryCondition = flags[featureNames.SUMMARY];

    return (
      <ViewLoader>
        <Switch>
          <Redirect
            exact
            from={config.ROUTES.app_home}
            to={config.ROUTES.dashboard}
          />
          <Route
            exact
            path={config.ROUTES.dashboard}
            component={DashboardContainer}
          />
          <ConditionalRedirectRoute
            path={config.ROUTES.summary}
            component={SummaryContainer}
            condition={summaryCondition}
            redirectPath={config.ROUTES.dashboard}
          />
          <ConditionalRedirectRoute
            path={config.ROUTES.medication}
            component={MedicationContainer}
            condition={medicationCondition}
            redirectPath={config.ROUTES.dashboard}
          />
          <ConditionalRedirectRoute
            exact
            path={config.ROUTES.documents}
            component={HealthDataViewer}
            condition={healthDataCondition}
            redirectPath={config.ROUTES.dashboard}
          />
          <ConditionalRedirectRoute
            exact
            path={config.ROUTES.app_share}
            component={SharingContainer}
            condition={shareCondition}
            redirectPath={config.ROUTES.dashboard}
          />
          <Route path={config.ROUTES.profile} component={ProfileContainer} />

          <Route component={NotFound} />
        </Switch>
      </ViewLoader>
    );
  }
}

export default withRouter(
  connect(({ access_token, appState, flags }: RootState) => ({
    access_token,
    appState,
    flags,
  }))(MainLayoutContainer)
);
