import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { actions as waterfallGlobalActions } from '../../../../store';
import { removeEid } from '../../../Profile/reduxSlice';
import { hideModal } from '../../modalsSlice';
import ModalWrapper from '../../ModalWrapper';
import ModalButton from '../ModalButton';
import ModalFooter from '../ModalFooter';
import ModalHeader from '../ModalHeader';

const RemoveEid = () => {
  const { t } = useTranslation('profile');
  const [removalInProgress, setRemovalInProgress] = useState(false);
  const dispatch = useDispatch();

  const handleClick = async () => {
    try {
      setRemovalInProgress(true);
      await dispatch(removeEid());
      dispatch(hideModal());
      waterfallGlobalActions.setNotification('REMOVE_EID_SUCCESS', 'success');
    } catch (error) {
      waterfallGlobalActions.setNotification('REMOVE_EID_ERROR', 'error');
    } finally {
      setRemovalInProgress(false);
    }
  };
  return (
    <ModalWrapper>
      <div className="RemoveEid">
        <ModalHeader title={t('eid_remove_confirm.headline')} />
        <section className="RemoveEid__content">
          {t('eid_remove_confirm.content')}
        </section>
        <ModalFooter isCancelable>
          <ModalButton
            data-testid="confirmEidRemove"
            onClick={handleClick}
            text={t('eid_remove_confirm.button')}
            isLoading={removalInProgress}
          />
        </ModalFooter>
      </div>
    </ModalWrapper>
  );
};

export default RemoveEid;
