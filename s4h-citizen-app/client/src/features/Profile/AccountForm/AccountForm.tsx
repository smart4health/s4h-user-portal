import D4LSDK from '@d4l/js-sdk';
import queryString from 'query-string';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import config from '../../../config';
import { featureNames, Flags } from '../../../config/flags';
import { connect } from '../../../store';
import { RootState, UserData } from '../../../types';
import d4lDB from '../../../utils/D4LDB';
import { getAllScopes } from '../../../utils/scopes';
import { isEmail } from '../../../utils/validation';
import webComponentWrapper from '../../../utils/webComponentWrapper';
import { showModal } from '../../modals/modalsSlice';
import AccountFormEid from '../AccountFormEid/AccountFormEid';
import AccountFormItem from '../AccountFormItem';
import AccountFormSection from '../AccountFormSection';
import '../Profile.scss';

interface Props {
  userData: UserData;
  flags: Flags;
}

const AccountForm = (props: Props) => {
  const [email, setEmail] = useState<string>(props.userData.email);
  const [isValidEmail, setEmailValidity] = useState<boolean>();
  const changePasswordRef = useRef<HTMLAnchorElement>(null);
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const flags = props.flags;

  useEffect(
    function validateEmail() {
      if (isEmail(email)) {
        setEmailValidity(true);
      } else {
        setEmailValidity(false);
      }
    },
    [email]
  );

  useEffect(() => {
    const calculateAuthorizationURL = async () => {
      const authorisationState = await d4lDB.get('authorisationState');
      const publicKey = await d4lDB.get('public-key');
      const authorisationData = {
        client_id: config.REACT_APP_OAUTH_CLIENT_ID,
        redirect_uri: config.REACT_APP_OAUTH_REDIRECT_URI,
        response_type: 'code',
        scope: getAllScopes(),
        public_key: publicKey,
        state: authorisationState,
        redirect: 'start-password-reset',
      };

      const authURL = `${config.REACT_APP_GC_HOST}${
        config.REACT_APP_PROXY_VEGA_BASE_ENDPOINT
      }/authorize?${queryString.stringify(authorisationData)}&lng=${i18n.language}`;

      return authURL;
    };
    (async () => {
      changePasswordRef.current?.setAttribute(
        'href',
        await calculateAuthorizationURL()
      );
    })();
  }, [i18n.language]);

  const copyUserIdToClipboard = () => {
    // use input-id for getting the input field as d4l-input is not shadow DOM
    const input = document.getElementById('profile-user-id') as HTMLInputElement;
    input.disabled = false;
    input.select();
    document.execCommand('copy');
    input.disabled = true;
  };

  const hasChangedEmail = useCallback(() => {
    return props.userData.email !== email;
  }, [email, props.userData.email]);

  const handleEmailChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      console.log(event.target.value);
      setEmail(event.target.value);
    },
    []
  );

  const handleDeleteAccount = () => {
    dispatch(
      showModal({
        type: 'DeleteAccount',
        options: {},
      })
    );
  };

  const handleSaveEmail = () => {
    dispatch(
      showModal({
        type: 'ChangeEmail',
        options: {
          email,
        },
      })
    );
  };

  return (
    <div className="ProfileForm">
      <d4l-card classes="ProfileForm__card">
        <div slot="card-content">
          <AccountFormSection headline="personal_info">
            <AccountFormItem>
              <d4l-input
                type="email"
                value={email}
                data-test="emailInput"
                classes="ProfileForm__input"
                label={t('email')}
                // @ts-ignore
                ref={webComponentWrapper({
                  handleInput: handleEmailChange,
                })}
              />
              {hasChangedEmail() && (
                <d4l-button
                  id="updateAccountsButton"
                  classes="button--secondary button--block button--uppercase ProfileForm__button"
                  text={t('save_changes')}
                  disabled={!isValidEmail}
                  // @ts-ignore
                  ref={webComponentWrapper({
                    handleClick: () => handleSaveEmail(),
                  })}
                  data-test="updateAccountsButton"
                />
              )}
            </AccountFormItem>
            <AccountFormItem>
              <d4l-input
                input-id="profile-user-id"
                classes="ProfileForm__user-id"
                label={t('profile_userid_fieldlabel')}
                value={D4LSDK.getCurrentUserId()!}
                disabled
              />

              <d4l-button
                classes="button--block button--secondary button--uppercase ProfileForm__button"
                text={t('profile_copy_userid_button')}
                // @ts-ignore
                ref={webComponentWrapper({
                  handleClick: copyUserIdToClipboard,
                })}
              />
            </AccountFormItem>
          </AccountFormSection>
          <AccountFormSection
            headline="authentication_details.headline"
            namespace="profile"
          >
            <AccountFormItem>
              <p>{t('change_password')}</p>
              {/* eslint-disable jsx-a11y/anchor-is-valid  */}
              <a
                href="#"
                target="_self"
                ref={changePasswordRef}
                className="ProfileForm__button"
              >
                <d4l-button
                  classes="button--block button--secondary button--uppercase"
                  text={t('button_change_password')}
                  data-test="ChangePasswordBtn"
                  is-route-link
                />
              </a>
            </AccountFormItem>
            {flags[featureNames.EID] && (
              <AccountFormItem>
                <AccountFormEid />
              </AccountFormItem>
            )}
          </AccountFormSection>
          <AccountFormSection headline="delete_user">
            <p>{t('if_you_delete')}</p>
            <d4l-button
              classes="button--block button--secondary button--uppercase ProfileForm__button"
              text={t('delete')}
              // @ts-ignore
              ref={webComponentWrapper({
                handleClick: handleDeleteAccount,
              })}
              data-test="deleteAccountBtn"
            />
          </AccountFormSection>
        </div>
      </d4l-card>
    </div>
  );
};

export default connect(({ userData, flags }: RootState) => ({
  userData,
  flags,
}))(AccountForm);
