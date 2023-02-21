import classnames from 'classnames';
import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { TwoColumnCardLayout } from '../../components';
import ViewWrapper from '../../components/ViewWrapper';
import config from '../../config';
import { selectIsDeviceDesktop } from '../../redux/globalsSlice';
import AccountForm from './Account';
import MyData from './MyData';
import ProfileSidebar from './Sidebar';

const RIGHT_COLUMN_ID = 'profile-page-tab-panel';

const Profile = () => {
  const location = useLocation();
  const isDesktop = useSelector(selectIsDeviceDesktop);
  const redirectInDesktop =
    isDesktop &&
    [`${config.ROUTES.profile}/`, config.ROUTES.profile].includes(location.pathname);
  // used to toggle left and right content
  const isRightColumnVisibleOnMobile = location.pathname !== config.ROUTES.profile;
  const viewWrapperClasses = classnames({
    'ViewWrapper--footer-gray': isRightColumnVisibleOnMobile,
  });
  return (
    <ViewWrapper className={viewWrapperClasses}>
      <TwoColumnCardLayout
        isRightColumnVisibleOnMobile={isRightColumnVisibleOnMobile}
        leftColumn={<ProfileSidebar rightColumnId={RIGHT_COLUMN_ID} />}
        rightColumn={
          <Switch>
            {redirectInDesktop && <Redirect to={config.ROUTES.profile_acc} />}
            <Route
              exact
              path={config.ROUTES.profile_acc}
              render={() => <AccountForm id={RIGHT_COLUMN_ID} />}
            />
            <Route
              exact
              path={config.ROUTES.profile_data}
              render={() => <MyData id={RIGHT_COLUMN_ID} />}
            />
          </Switch>
        }
      />
    </ViewWrapper>
  );
};

export default Profile;
