import React from 'react';
import { useTranslation } from 'react-i18next';
import './Funding.scss';
import flagOfEurope from './images/flag-of-europe.svg';

const Funding: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="Funding">
      <img src={flagOfEurope} alt={t('landing.eu_logo.alttext')} />
      <span>{t('landing.eu_logo.infotext')}</span>
    </div>
  );
};

export default Funding;
