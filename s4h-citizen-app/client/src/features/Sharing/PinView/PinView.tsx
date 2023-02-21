import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import ViewHeader from '../../../components/ViewHeader';
import config from '../../../config';
import { pushTrackingEvent, TRACKING_EVENTS } from '../../../utils/analytics';
import webComponentWrapper from '../../../utils/webComponentWrapper';
import { showModal } from '../../modals/modalsSlice';
import { getApplications } from '../handshakeConnectionsSlice';
import {
  approveSharing,
  selectIsApprovalInProgress,
  selectPinValidity,
} from '../reduxSlice';
import PinInput from './PinInput';
import './PinView.scss';

const PinView: React.FC = () => {
  const { t } = useTranslation(['master', 'sharing']);
  const dispatch = useDispatch();
  const [pin, setPin] = useState<string>('');
  const isPinValid = useSelector(selectPinValidity);
  const isApprovalInProgress = useSelector(selectIsApprovalInProgress);

  const handleApproveButtonClick = async () => {
    pushTrackingEvent(TRACKING_EVENTS.SHARING_START);
    await dispatch(approveSharing());
    await dispatch(getApplications());
  };

  return (
    <div className="PinView">
      <d4l-card classes="Sharing__card">
        <div slot="card-header">
          <ViewHeader title={t('sharing.pin_view.title')} />
        </div>
        <div slot="card-content" className="PinView__card-content">
          <div className="PinView__review">
            <div className="PinView__review-heading">
              {t('sharing.pin_view_data_confirm.infotext')}
            </div>
            <d4l-button
              classes="button--block button--secondary button--uppercase"
              /*
                // @ts-ignore */
              ref={webComponentWrapper({
                handleClick: () =>
                  dispatch(
                    showModal({
                      type: 'ResourceSharingReview',
                      options: {},
                    })
                  ),
              })}
              text={t('sharing.pin_view_data_review.button')}
              data-test="ReviewBtn"
            />
          </div>
          <div className="PinView__description">
            <p>{t('share_intro_description')}</p>
            <p className="PinView__share-url">
              {`${window.location.origin}${config.ROUTES.share}`}
            </p>
          </div>
          <div className="PinView__qr-description">
            <p>{t('or_scan_it_with_qr_reader')}</p>
          </div>
          <div className="PinView__qr-button">
            <d4l-button
              classes="button--block button--secondary button--uppercase"
              /*
                // @ts-ignore */
              ref={webComponentWrapper({
                handleClick: () =>
                  dispatch(
                    showModal({
                      type: 'QRReader',
                      options: { setPin: setPin },
                    })
                  ),
              })}
              text={t('scan')}
              data-test="ScanBtn"
            />
          </div>
          <d4l-divider />
          <div className="PinView__pin-code-title">{t('pin_number')}</div>
          <PinInput isPinValid={isPinValid} pin={pin} setPin={setPin} />
          <div slot="card-footer" className="PinView__card-footer">
            <d4l-button
              data-test="submitBtn"
              disabled={!isPinValid}
              // @ts-ignore
              ref={webComponentWrapper({
                handleClick: handleApproveButtonClick,
                isLoading: isApprovalInProgress,
              })}
              classes="button--block button--uppercase"
              text={t('provide_access')}
            ></d4l-button>
          </div>
        </div>
      </d4l-card>
    </div>
  );
};

export default PinView;
