import { unwrapResult } from '@reduxjs/toolkit';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { IApplication } from '../../../../types';
import { pushTrackingEvent, TRACKING_EVENTS } from '../../../../utils/analytics';
import {
  getHandshakeConnections,
  revokeApplicationAccess,
} from '../../../Sharing/handshakeConnectionsSlice';
import {
  selectHasShareableData,
  setActiveView,
  ShareSteps,
} from '../../../Sharing/reduxSlice';
import { hideModal } from '../../modalsSlice';
import ModalWrapper from '../../ModalWrapper';
import ModalButton from '../ModalButton';
import ModalFooter from '../ModalFooter';
import ModalHeader from '../ModalHeader';

export interface Props {
  application: IApplication;
}

const RevokeSession: React.FC<Props> = ({ application }) => {
  const { t } = useTranslation();
  const [isRevokePending, setIsRevokePending] = useState(false);
  const dispatch = useDispatch();
  const hasShareableData = useSelector(selectHasShareableData);
  const handleClick = useCallback(async () => {
    setIsRevokePending(true);
    try {
      const applications = unwrapResult(
        await dispatch(revokeApplicationAccess(application))
      );
      const handshakeConnections = getHandshakeConnections(applications);
      if (!handshakeConnections.length) {
        if (hasShareableData) {
          dispatch(setActiveView(ShareSteps.PICKER));
        } else {
          dispatch(setActiveView(ShareSteps.EMPTY));
        }
      }
      dispatch(hideModal());
    } catch (serializedError) {
      setIsRevokePending(false);
      // TODO: add a UI error messaging here instead of console.debug
      console.debug('revoke request failed with id ' + application.id);
      console.error(serializedError);
    }
  }, [application, dispatch, hasShareableData]);

  return (
    <ModalWrapper>
      <>
        <ModalHeader title={t('revoke_access')} />
        <section>{t('app_revoke_warning')}</section>
        <ModalFooter
          isCancelable
          cancelableCallback={() => {
            pushTrackingEvent(TRACKING_EVENTS.REVOKE_CANCEL);
          }}
        >
          <ModalButton
            dataTest="doneBtn"
            disabled={isRevokePending}
            isLoading={isRevokePending}
            onClick={handleClick}
            text={t('sharing.revoke_access_modal.button')}
          />
        </ModalFooter>
      </>
    </ModalWrapper>
  );
};

export default RevokeSession;
