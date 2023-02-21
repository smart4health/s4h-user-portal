import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TwoColumnSidebar } from '../../components';
import config from '../../config';
import { actions } from '../../store';
import webComponentWrapper from '../../utils/webComponentWrapper';

interface Props {
  rightColumnId: string;
}

const ProfileSidebar = (props: Props) => {
  const { t } = useTranslation();

  const handleLogout = useCallback((event: Event) => {
    event.preventDefault();
    actions.doLogout();
    actions.setNotification('logged_out', 'success');
  }, []);

  const sidebarItems = [
    {
      title: t('account_settings'),
      path: config.ROUTES.profile_acc,
    },
    { title: t('your_data'), path: config.ROUTES.profile_data },
  ];
  return (
    <TwoColumnSidebar
      rightColumnId={props.rightColumnId}
      rootTitle={t('profile')}
      items={sidebarItems}
      hasActionButton={true}
      actionButton={
        <d4l-button
          classes="button--block
    button--uppercase button--large"
          text={t('logout')}
          // @ts-ignore
          ref={webComponentWrapper({
            handleClick: handleLogout,
          })}
          data-test="LogoutBtn"
        />
      }
    />
  );
};

export default ProfileSidebar;
