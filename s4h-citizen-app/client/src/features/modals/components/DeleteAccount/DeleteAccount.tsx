import D4LSDK from '@d4l/js-sdk';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { deleteAccount } from '../../../../services';
import { actions, getState as waterfallGlobalState } from '../../../../store';
import { hideModal } from '../../modalsSlice';
import ModalWrapper from '../../ModalWrapper';
import ModalButton from '../ModalButton';
import ModalFooter from '../ModalFooter';
import ModalHeader from '../ModalHeader';
import './DeleteAccount.scss';

export interface Props {}

const DeleteAccount = () => {
  const { t } = useTranslation();
  const [isDeletionPending, setisDeletionPending] = useState(false);
  const { access_token } = waterfallGlobalState();
  const dispatch = useDispatch();

  const deleteUserAccount = useCallback(async () => {
    try {
      await deleteAccount(D4LSDK.getCurrentUserId(), access_token);
      actions.setNotification('account_deleted', 'success');
      actions.doLogout();
      dispatch(hideModal());
    } catch (err) {
      actions.setNotification('error', 'error');
    }
  }, [access_token, dispatch]);

  const handleClick = useCallback(async () => {
    setisDeletionPending(true);
    await deleteUserAccount();
  }, [deleteUserAccount]);

  return (
    <ModalWrapper>
      <div className="DeleteAccount">
        <ModalHeader title={t('are_you_sure')} />
        <section className="DeleteAccount_content">
          <div className="DeleteAccount__info-text">
            {t('you_will_lose_all_data')}
          </div>
        </section>
        <ModalFooter isCancelable>
          <ModalButton
            data-test="confirmDeleteAccountBtn"
            disabled={isDeletionPending}
            isLoading={isDeletionPending}
            onClick={handleClick}
            text={t('delete_account')}
          />
        </ModalFooter>
      </div>
    </ModalWrapper>
  );
};

export default DeleteAccount;
