import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ViewHeader from '../../components/ViewHeader';
import ViewWrapper from '../../components/ViewWrapper';
import config from '../../config';
import { usePolling } from '../../hooks';
import * as shareService from '../../services/share';
import { ClientAccessTokenResponse } from '../../services/types';
import { actions as waterfallGlobalActions } from '../../store';
import { pushTrackingEvent, TRACKING_EVENTS } from '../../utils/analytics';
import webComponentWrapper from '../../utils/webComponentWrapper';
import './PinView.scss';
import {
  generatePin,
  selectExternalSharingState,
  setAccessToken,
} from './reduxSlice';

const QRCodeViewer = React.lazy(() => import('qrcode.react'));

const ExternalSharingPinView = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const sharedState = useSelector(selectExternalSharingState);
  const [startPolling, stopPolling] = usePolling<ClientAccessTokenResponse>();

  const onPollingSuccess = useCallback(
    (response: ClientAccessTokenResponse) => {
      dispatch(setAccessToken(response.access_token));
      waterfallGlobalActions.setNotification('PERMISSION_GRANTED', 'success');
    },
    [dispatch]
  );

  const onPollingError = useCallback(() => {
    waterfallGlobalActions.setNotification('PIN_ERROR_REFRESH', 'error');
  }, []);

  useEffect(
    function onMount() {
      dispatch(generatePin());
    },
    [dispatch]
  );

  useEffect(
    function onPinGeneration() {
      const pin = sharedState.pin;

      if (pin !== '') {
        startPolling({
          // @ts-ignore
          fn: () => shareService.getClientAccessToken(pin),
          onSuccess: onPollingSuccess,
          onError: onPollingError,
        });
      }
      return function cleanup() {
        stopPolling();
      };
    },
    [sharedState.pin, onPollingSuccess, onPollingError, startPolling, stopPolling]
  );

  return (
    <ViewWrapper>
      <div className="SharedContainer">
        <d4l-card classes="card--text-center SharedContainer__card">
          <div slot="card-header" className="SharedContainer__header">
            <ViewHeader title={t('sharing.get_access_to_patient_data.title')} />
          </div>
          <div slot="card-content" className="SharedContainer__pin-info">
            <p>{t('sharing.get_access_to_patient_data.infotext')}</p>
            <div className="SharedContainer__pin-wrapper">
              <div className="SharedContainer__pin">
                {sharedState.pin.split('').map((pinNumber, index) => (
                  <div className="SharedContainer__pin-cell" key={index}>
                    {pinNumber}
                  </div>
                ))}
              </div>
            </div>
            <p
              className="SharedContainer__qr-info"
              dangerouslySetInnerHTML={{
                __html: t('sharing.get_access_to_patient_data_qr.infotext'),
              }}
            />
            <React.Suspense fallback={<d4l-spinner />}>
              {/* @ts-ignore */}
              <QRCodeViewer value={sharedState.pin} size={160} />
            </React.Suspense>
            {sharedState.pin && !sharedState.isFetchingAccessToken ? (
              <div className="SharedContainer__view-data">
                <Link to={`${config.ROUTES.shared_data}`} replace>
                  <d4l-button
                    classes="button--block button--primary button--uppercase"
                    data-test="submitBtn"
                    text={t('view_data')}
                    /*
                //  @ts-ignore */
                    ref={webComponentWrapper({
                      handleClick: () => {
                        pushTrackingEvent(TRACKING_EVENTS.OUTAPP_VIEWDATA_START);
                        waterfallGlobalActions.dismissNotification();
                      },
                    })}
                  />
                </Link>
              </div>
            ) : (
              <div className="SharedContainer__wait-for-pin">
                <d4l-spinner classes="SharedContainer__loader" />
                <p>{t('share_accessing')}</p>
              </div>
            )}
          </div>
        </d4l-card>
        <div
          className="SharedContainer__notification"
          data-testid="external-pin-view-notification"
        >
          <d4l-notification-bar
            classes="SharedContainer__notification-bar"
            text={t('sharing.disclaimer_notification_bar.infotext')}
          />
        </div>
      </div>
    </ViewWrapper>
  );
};

export default ExternalSharingPinView;
