import React, { ChangeEvent, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import startUserEmailChange from '../../../../services/changeEmail';
import { actions, getState as waterfallGlobalState } from '../../../../store';
import webComponentWrapper from '../../../../utils/webComponentWrapper';
import { hideModal } from '../../modalsSlice';
import ModalWrapper from '../../ModalWrapper';
import ModalButton from '../ModalButton';
import ModalFooter from '../ModalFooter';
import ModalHeader from '../ModalHeader';
import './ChangeEmail.scss';

export interface Props {
  email: string;
}

const ChangeEmail = (props: Props) => {
  const { t } = useTranslation();
  const [isUpdatePending, setIsUpdatePending] = useState(false);
  const [password, setPassword] = useState('');
  const { userData, access_token } = waterfallGlobalState();
  const dispatch = useDispatch();

  const updateEmail = useCallback(async () => {
    try {
      const code = await startUserEmailChange(
        userData.email,
        props.email,
        password,
        access_token!
      );

      const isSuccess = code === 204;
      if (isSuccess) {
        dispatch(hideModal());
        actions.doLogout();
      }
      actions.setNotification(
        `change_email_${code}`,
        isSuccess ? 'success' : 'error'
      );

      return isSuccess;
    } catch (e) {
      actions.setNotification('change_email_network', 'error');
      return false;
    }
  }, [userData.email, props.email, password, access_token, dispatch]);

  const handleClick = useCallback(async () => {
    setIsUpdatePending(true);
    await updateEmail();
  }, [updateEmail]);

  return (
    <ModalWrapper>
      <div className="ChangeEmail">
        <ModalHeader title={t('prompt_password')} />
        <div className="ChangeEmail_content">
          <div className="ChangeEmail__info-text">{t('prompt_password_hint')}</div>
          <d4l-input
            type="password"
            name="promptPassword"
            label={t('prompt_password_label')}
            placeholder={t('prompt_password_placeholder')}
            data-test="promptPasswordInput"
            value={password}
            // @ts-ignore
            ref={webComponentWrapper({
              handleInput: (event: ChangeEvent<HTMLInputElement>) =>
                setPassword(event.target.value),
            })}
          />
        </div>
        <ModalFooter isCancelable>
          <ModalButton
            dataTest="doneBtn"
            disabled={isUpdatePending || !password}
            isLoading={isUpdatePending}
            onClick={handleClick}
            text={t('prompt_password_submit')}
          />
        </ModalFooter>
      </div>
    </ModalWrapper>
  );
};

export default ChangeEmail;
