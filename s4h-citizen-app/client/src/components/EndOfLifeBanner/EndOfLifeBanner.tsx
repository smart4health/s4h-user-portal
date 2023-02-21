import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import config from '../../config';
import { setIsEOLBannerVisible } from '../../redux/globalsSlice';
import WebComponentWrapperInstance from '../../utils/webComponentWrapper';
import './EndOfLifeBanner.scss';

export const EndOfLifeBanner = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  return (
    <d4l-snack-bar class="EndOfLifeBanner" classes="EndOfLifeBanner__snack-bar">
      <div slot="snack-bar-content">
        {t('endoflife.banner.message')}{' '}
        <Link to={config.ROUTES.legal_eol}>{t('endoflife.banner.link')}</Link>.
      </div>
      <div slot="snack-bar-controls">
        <d4l-button
          classes="button--text button--uppercase"
          text={t('endoflife.banner_close.button')}
          // @ts-ignore TS-FIXME
          ref={WebComponentWrapperInstance<Components.D4lButton>({
            handleClick: () => {
              dispatch(setIsEOLBannerVisible(false));
            },
          })}
          data-testid="endoflife-banner-close-button"
        />
      </div>
    </d4l-snack-bar>
  );
};
export default EndOfLifeBanner;
