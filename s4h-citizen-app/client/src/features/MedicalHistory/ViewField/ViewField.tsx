import * as React from 'react';
import { useTranslation } from 'react-i18next';
import './ViewField.scss';

type Props = {
  label?: string;
  value?: string;
  secondaryText?: string;
};

const ViewField = ({ label, value = '-', secondaryText }: Props) => {
  const { t } = useTranslation('anamnesis');
  return (
    <div className="ViewField">
      {label && (
        <label className="MedicalHistoryQuestion__label" htmlFor={label}>
          {t(label)}
        </label>
      )}
      <div
        title={t(value)}
        className="MedicalHistoryQuestion__primaryText"
        data-test={`${label}-viewField`}
      >
        {t(value)}
      </div>
      {secondaryText && (
        <span
          title={secondaryText}
          className="MedicalHistoryQuestion__secondaryText"
        >
          {secondaryText}
        </span>
      )}
    </div>
  );
};

export default ViewField;
