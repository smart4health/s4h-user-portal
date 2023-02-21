import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  selectIsCookieChoiceMade,
  setIsCookieChoiceMade,
} from '../../redux/globalsSlice';
import initializeErrorTracking from '../../utils/errorTracking';
import settings from '../../utils/settings';
import webComponentWrapper from '../../utils/webComponentWrapper';
import './Cookie.scss';

const dnt = navigator.doNotTrack === '1';

type BannerSettings = {
  acceptCookies: boolean;
  acceptTracking: boolean;
};

const CookieBanner = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isCookieChoiceMade = useSelector(selectIsCookieChoiceMade);

  const saveSettings = ({ acceptCookies, acceptTracking }: BannerSettings) => {
    settings.acceptsCookies = acceptCookies;
    settings.acceptsTracking = acceptCookies && acceptTracking;
    dispatch(setIsCookieChoiceMade(true));
    if (acceptCookies) {
      initializeErrorTracking();
    }
  };
  return isCookieChoiceMade ? null : (
    <>
      <d4l-cookie-bar
        classes="CookieBanner"
        accept-text={t('cookie_bar_accept')}
        reject-text={t('cookie_bar_reject')}
        // @ts-ignore
        ref={webComponentWrapper({
          uppercaseButtons: true,
          handleAccept: () =>
            saveSettings({ acceptCookies: true, acceptTracking: !dnt }),
          handleReject: () =>
            saveSettings({ acceptCookies: false, acceptTracking: false }),
        })}
      >
        <div slot="cookie-bar-text">
          <span>{dnt ? t('cookie_bar_text_dnt') : t('cookie_bar_text')}</span>{' '}
          <Link className="CookieBanner__link" to="/legal/data">
            {t('cookie_bar_data_privacy')}
          </Link>
        </div>
      </d4l-cookie-bar>
    </>
  );
};

export default CookieBanner;
