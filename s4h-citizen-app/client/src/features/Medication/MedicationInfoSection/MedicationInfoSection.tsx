import React from 'react';
import { useTranslation } from 'react-i18next';
import './MedicationInfoSection.scss';

interface Props {
  headline: string;
  children: React.ReactNode;
}

const MedicationInfoSection = ({ headline, children }: Props) => {
  const { t } = useTranslation();

  return (
    <section className="MedicationInfoSection">
      {headline && (
        <h6
          className="MedicationInfoSection__headline"
          data-testid="info-section-headline"
        >
          {t(headline)}
        </h6>
      )}
      {children}
    </section>
  );
};

export default MedicationInfoSection;
