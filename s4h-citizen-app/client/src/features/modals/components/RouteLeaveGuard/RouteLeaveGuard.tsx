import { Location } from 'history';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useGetTrackingSectionName } from '../../../../hooks';
import { pushTrackingEvent, TRACKING_EVENTS } from '../../../../utils/analytics';
import { hideModal } from '../../modalsSlice';
import ModalWrapper from '../../ModalWrapper';
import ModalButton from '../ModalButton';
import ModalFooter from '../ModalFooter';
import ModalHeader from '../ModalHeader';

export type Props = {
  lastLocation: Location;
};

const RouteLeaveGuard = ({ lastLocation }: Props) => {
  const getTrackingSectionName = useGetTrackingSectionName();
  const dispatch = useDispatch();

  const handleConfirm = () => {
    pushTrackingEvent(TRACKING_EVENTS[getTrackingSectionName('_CANCEL')]);
    if (lastLocation !== null) {
      // It seems like history.push doesnt work here.
      // Suspecting its because of how the portals work
      window.location.assign(lastLocation.pathname);
    }
    dispatch(hideModal());
  };
  const { t } = useTranslation();
  return (
    <ModalWrapper>
      <div className="RouteLeaveGuard">
        <ModalHeader title={t('cancel_without_saving_modal.headline')} />
        <section>
          <p>{t('cancel_without_saving_modal.message')}</p>
        </section>
        <ModalFooter isCancelable>
          <ModalButton
            dataTest="doneBtn"
            onClick={handleConfirm}
            text={t('continue')}
          />
        </ModalFooter>
      </div>
    </ModalWrapper>
  );
};

export default RouteLeaveGuard;
