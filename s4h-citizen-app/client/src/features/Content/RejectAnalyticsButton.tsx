import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import disableErrorTracking from '../../utils/errorTracking';
import settings from '../../utils/settings';
import webComponentWrapper from '../../utils/webComponentWrapper';

interface Props {
  children?: React.ReactChild;
  translationNamespace: string;
}

const RejectAnalyticsButton = (props: Props) => {
  const [success, setSuccess] = useState<boolean>(false);
  const { t } = useTranslation(props.translationNamespace);
  const reject = useCallback(() => {
    settings.acceptsCookies = false;
    settings.acceptsTracking = false;
    disableErrorTracking();

    setSuccess(true);
  }, []);

  return !success ? (
    <d4l-button
      classes="button--secondary"
      // @ts-ignore
      ref={webComponentWrapper({
        handleClick: () => reject(),
      })}
      text={props.children as string}
    />
  ) : (
    <strong className="Content__success">{t('settings.saved')}</strong>
  );
};

export default RejectAnalyticsButton;
