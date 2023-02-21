import React from 'react';
import { useTranslation } from 'react-i18next';
import IconFileError from '../../images/FileError.svg';
import './ErrorView.scss';

const ErrorView = () => {
  const { t } = useTranslation();

  return (
    <div className="GroupItemErrorView">
      <img src={IconFileError} alt="" />
      {t('preview_error')}
    </div>
  );
};

export default ErrorView;
