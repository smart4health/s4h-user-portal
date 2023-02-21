import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { NotFoundContent, TwoColumnCardLayout } from '../../../components';
import ViewWrapper from '../../../components/ViewWrapper';
import config from '../../../config';
import { selectIsDeviceDesktop } from '../../../redux/globalsSlice';
import Content from './Content';
import LegalSidebar from './Sidebar';

export type ContentRoute = { path: string; root: string };

const LEGAL_ROUTES: ContentRoute[] = [
  {
    path: config.ROUTES.legal_terms,
    root: 'terms',
  },
  {
    path: config.ROUTES.legal_data,
    root: 'dataPrivacy',
  },
  {
    path: config.ROUTES.legal_imprint,
    root: 'imprint',
  },
  {
    path: config.ROUTES.legal_consent,
    root: 'consent',
  },
  {
    path: config.ROUTES.legal_features,
    root: 'features',
  },
  {
    path: config.ROUTES.legal_licensing,
    root: 'licensing_and_copyright',
  },
  {
    path: config.ROUTES.legal_eol,
    root: 'end_of_life',
  },
];

const RIGHT_COLUMN_ID = 'legal-page-tab-panel';

export const Legal = () => {
  const location = useLocation();
  const isRightColumnVisibleOnMobile = location.pathname !== config.ROUTES.legal;
  const isDesktop = useSelector(selectIsDeviceDesktop);
  const redirectInDesktop =
    isDesktop &&
    [`${config.ROUTES.legal}/`, config.ROUTES.legal].includes(location.pathname);
  return (
    <ViewWrapper>
      <TwoColumnCardLayout
        isRightColumnVisibleOnMobile={isRightColumnVisibleOnMobile}
        leftColumn={<LegalSidebar rightColumnId={RIGHT_COLUMN_ID} />}
        rightColumn={
          <Switch>
            {redirectInDesktop && <Redirect to={config.ROUTES.legal_terms} />}
            {LEGAL_ROUTES.map(route => (
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

export default Legal;
