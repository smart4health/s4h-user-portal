import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import WebComponentWrapperInstance from '../../utils/webComponentWrapper';
import './IncompletenessDisclaimer.scss';

export const IncompletenessDisclaimer = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { t } = useTranslation();

  if (!isVisible) {
    return null;
  }

  return (
    <d4l-snack-bar
      class="IncompletenessDisclaimer"
      classes="IncompletenessDisclaimer__snack-bar"
    >
      <div slot="snack-bar-icon">
        <d4l-icon-info
          classes="icon--small IncompletenessDisclaimer__icon"
          data-testid="incompleteness-disclaimer-icon"
        />
      </div>
      <div slot="snack-bar-content">
        {t('sharing.incompleteness_disclaimer.message')}
      </div>
      <div slot="snack-bar-controls">
        <d4l-button
          classes="button--text button--uppercase"
          text={t('sharing.incompleteness_disclaimer.button')}
          // @ts-ignore TS-FIXME
          ref={WebComponentWrapperInstance<Components.D4lButton>({
            handleClick: () => {
              setIsVisible(false);
            },
          })}
          data-testid="incompleteness-disclaimer-close-button"
        />
      </div>
    </d4l-snack-bar>
  );
};

export default IncompletenessDisclaimer;
