import { unwrapResult } from '@reduxjs/toolkit';
// @ts-ignore
import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { actions as waterfallGlobalActions } from '../../../store';
import webComponentWrapper from '../../../utils/webComponentWrapper';
import { showModal } from '../../modals/modalsSlice';
import { getLatestEidInfo, registerEid, selectEidInfo } from '../reduxSlice';
import './AccountFormEid.scss';

const AccountFormEid = () => {
  const { t } = useTranslation(['profile']);
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();

  const eidInfo = useSelector(selectEidInfo);

  const [isEidInfoLoaded, setIsEidInfoLoaded] = useState(false);
  const [isEidInfoRequestSuccessful, setIsEidInfoRequestSuccessful] =
    useState(false);
  const [isEidRegistrationInProgress, setIsEidRegistrationInProgress] =
    useState(false);

  useEffect(() => {
    const search = location.search ?? '';
    const query = queryString.parse(search);

    const handleEidReadoutError = () => {
      waterfallGlobalActions.setNotification('ADD_EID_ERROR', 'error');
    };

    const handleEidReadoutSuccess = async () => {
      try {
        const registerResult = await dispatch(registerEid());
        unwrapResult(registerResult);
        waterfallGlobalActions.setNotification('ADD_EID_SUCCESS', 'success');
      } catch (error: any) {
        if (error.message === 'DEVICE_ID_EXISTS') {
          waterfallGlobalActions.setNotification(
            'ADD_EID_DEVICE_ID_EXISTS_ERROR',
            'error'
          );
        } else {
          waterfallGlobalActions.setNotification('ADD_EID_ERROR', 'error');
        }
      }
    };

    (async () => {
      if (query['eid-readout']) {
        // Returning from ausweisapp. We do no load eID info here
        setIsEidInfoRequestSuccessful(true);
        setIsEidInfoLoaded(true);
        switch (query['eid-readout']) {
          case 'ok':
            setIsEidRegistrationInProgress(true);
            await handleEidReadoutSuccess();
            setIsEidRegistrationInProgress(false);
            break;
          case 'not-found':
          case 'conflict':
          case 'error':
            handleEidReadoutError();
            break;
          default:
            break;
        }
        // remove the query params
        history.replace({
          search: '',
        });
      } else {
        // Normal flow where we need to check if eID is connected
        try {
          setIsEidInfoLoaded(false);
          const response = await dispatch(getLatestEidInfo());
          unwrapResult(response);
          setIsEidInfoRequestSuccessful(true);
        } catch (error) {
          setIsEidInfoRequestSuccessful(false);
        } finally {
          setIsEidInfoLoaded(true);
        }
      }
    })();
    // We have not added location.search here to make sure there is no re-execution of this hook
    // after we replace the history search
    // this is done to  avoid errors happening when refreshing the page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, history]);

  const handleEidRemoval = async () => {
    dispatch(
      showModal({
        type: 'RemoveEid',
        options: {},
      })
    );
  };

  const handleEidConnect = async () => {
    dispatch(
      showModal({
        type: 'EidCountrySelection',
        options: {},
      })
    );
  };

  if (!isEidInfoLoaded) {
    return null;
  }

  return (
    <>
      <h3>{t('eid_settings.headline')}</h3>
      <p className="AccountFormEid__content">{t('eid_settings.content')}</p>
      {eidInfo?.id ? (
        <>
          <d4l-notification-bar
            data-testid="account-form-eid-success-notification"
            text={t('eid_connected.infotext')}
            icon="check"
            classes="AccountFormEid__notification-bar"
          />
          <p>{t('eid_connected.content')}</p>
          <d4l-button
            classes="button--block button--secondary button--uppercase ProfileForm__button"
            text={t('eid_remove.button')}
            // @ts-ignore
            ref={webComponentWrapper({
              handleClick: handleEidRemoval,
            })}
            data-testid="account-form-remove-eid-button"
          />
        </>
      ) : (
        <>
          {!isEidInfoRequestSuccessful ? (
            <d4l-notification-bar
              data-testid="account-form-eid-error-notification"
              text={t('eid_data_fetch_failed.message')}
              icon="error-outline"
              classes="AccountFormEid__notification-bar notification-bar--bgcolor-red notification-bar--color-white"
            />
          ) : (
            <d4l-notification-bar
              data-testid="account-form-eid-connect-notification"
              text={t('eid_not_connected.infotext')}
              classes="AccountFormEid__notification-bar"
            />
          )}
          <d4l-button
            classes="button--block button--secondary button--uppercase ProfileForm__button"
            disabled={!isEidInfoRequestSuccessful}
            isLoading={isEidRegistrationInProgress}
            text={t('eid_add.button')}
            // @ts-ignore
            ref={webComponentWrapper({
              handleClick: handleEidConnect,
            })}
            data-testid="account-form-add-eid-button"
          />
        </>
      )}
    </>
  );
};

export default AccountFormEid;
