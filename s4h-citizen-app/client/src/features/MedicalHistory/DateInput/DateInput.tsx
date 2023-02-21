import React from 'react';
import { Control, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ControlledD4LDateInput } from '../../../components/ControlledFormComponents';
import { getQuestionClass, ValidationRules } from '../forms/PersonalData/utils';
import ViewField from '../ViewField';

interface Props {
  name: string;
  readOnly?: boolean;
  label: string;
  validationRules: ValidationRules;
  control: Control<Record<string, any>>;
  required?: boolean;
}

const DateInput: React.FC<Props> = ({
  name,
  readOnly = false,
  label,
  control,
  validationRules,
  required = false,
}) => {
  const { t } = useTranslation('anamnesis');
  const value = useWatch({
    name,
    control,
  });

  return (
    <div className={getQuestionClass(readOnly, !!value)}>
      {readOnly ? (
        <ViewField label={label} value={value as string} />
      ) : (
        <ControlledD4LDateInput
          name={name}
          label={`${t(label)}${required ? ' *' : ''}`}
          control={control}
          validationRules={validationRules}
          fields={{
            day: {
              label: t('medical_history_condition_section.day_label'),
              placeholder: t('medical_history_condition_section.day_label'),
            },
            month: {
              label: t('medical_history_condition_section.month_label'),
              placeholder: t('medical_history_condition_section.month_label'),
            },
            year: {
              label: t('medical_history_condition_section.year_label'),
              placeholder: t('medical_history_condition_section.year_label'),
            },
          }}
          dataTestId="dateInput"
          required={required}
        />
      )}
    </div>
  );
};

export default DateInput;
