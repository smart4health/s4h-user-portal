import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { actions, connect } from '../../store';
import { Notification } from '../../types';
import iconError from './images/icon_error.svg';
import iconSuccess from './images/icon_success.svg';
import iconWarning from './images/icon_warning.svg';
import './NotificationComponent.scss';

type Props = {
  notification: Notification;
};

const NOTIFICATION_TYPES = {
  default: 'default',
  success: 'success',
  warning: 'warning',
  error: 'error',
};

const NotificationComponent = (props: Props) => {
  const { t } = useTranslation(['notifications', 'general_reuse']);
  const {
    notification: { translationKey, type, show, notifPrefix = '' },
  } = props;

  if (!show) {
    return null;
  }

  let label, icon, extraClass;
  switch (type) {
    case NOTIFICATION_TYPES.success:
      label = t('success_label');
      icon = iconSuccess;
      extraClass = 'Notification--success';
      break;
    case NOTIFICATION_TYPES.warning:
      label = t('warning_label');
      icon = iconWarning;
      extraClass = 'Notification--warning';
      break;
    case NOTIFICATION_TYPES.error:
      label = t('error_label');
      icon = iconError;
      extraClass = 'Notification--error';
      break;
    default:
      label = '';
      icon = null;
      extraClass = 'Notification--default';
  }
  const notificationClass = classNames('Notification', extraClass);
  const testKey = 'notification' + type.slice(0, 1).toUpperCase() + type.slice(1);

  return (
    <div className={notificationClass} data-test={testKey}>
      <button type="button" onClick={() => actions.dismissNotification()}>
        &times;
      </button>
      {icon && (
        <div className="Notification__icon">
          <img src={icon} alt="" />
        </div>
      )}
      <p>
        <strong>{label}</strong> {`${notifPrefix + ' '}${t(translationKey)}`.trim()}
      </p>
    </div>
  );
};

export default connect(({ notification }: { notification: Notification }) => ({
  notification,
}))(NotificationComponent);
