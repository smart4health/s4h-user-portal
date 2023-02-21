import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { NotFoundContent, TwoColumnCardLayout } from '../../../components';
import ViewWrapper from '../../../components/ViewWrapper';
import config from '../../../config';
import { selectIsDeviceDesktop } from '../../../redux/globalsSlice';
import { connect } from '../../../store';
import { RootState } from '../../../types';
import Content from './Content';
import SupportSidebar from './Sidebar';

const RIGHT_COLUMN_ID = 'support-page-tab-panel';

export const Support = () => {
  const location = useLocation();
  const isRightColumnVisibleOnMobile = location.pathname !== config.ROUTES.support;
  const isDesktop = useSelector(selectIsDeviceDesktop);
  const redirectInDesktop =
    isDesktop &&
    [`${config.ROUTES.support}/`, config.ROUTES.support].includes(location.pathname);
  const SUPPORT_ROUTES = useMemo(
    () => [
      {
        path: config.ROUTES.support_user_account,
        root: 'user_account',
      },
      {
        path: config.ROUTES.support_trust_privacy,
        root: 'trust_privacy',
      },
      {
        path: config.ROUTES.support_feature_eid,
        root: 'eid',
      },
      {
        path: config.ROUTES.support_feature_sharing,
        root: 'sharing',
      },
      {
        path: config.ROUTES.support_data_ingestion,
        root: 'data_ingestion',
      },
      {
        path: config.ROUTES.support_feature_medications,
        root: 'medications',
      },
      {
        path: config.ROUTES.support_feature_conditions,
        root: 'conditions',
      },
      {
        path: config.ROUTES.support_feature_allergies,
        root: 'allergies',
      },
      {
        path: config.ROUTES.support_contact,
        root: 'contact_us',
      },
    ],
    []
  );

  return (
    <ViewWrapper>
      <TwoColumnCardLayout
        isRightColumnVisibleOnMobile={isRightColumnVisibleOnMobile}
        leftColumn={<SupportSidebar rightColumnId={RIGHT_COLUMN_ID} />}
        rightColumn={
          <Switch>
            {redirectInDesktop && (
              <Redirect to={config.ROUTES.support_user_account} />
            )}

            {SUPPORT_ROUTES.map(route => (
              <Route
                exact
                key={route.path}
                path={route.path}
                render={() => <Content {...route} id={RIGHT_COLUMN_ID} />}
              />
            ))}
            <Route component={NotFoundContent} />
          </Switch>
        }
      />
    </ViewWrapper>
  );
};

export default connect(({ flags }: RootState) => ({
  flags,
}))(Support);
