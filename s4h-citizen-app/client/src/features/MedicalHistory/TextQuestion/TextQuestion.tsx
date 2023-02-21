/* eslint-disable react/require-default-props */
import React from 'react';
import { Control, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledD4LInput from '../../../components/ControlledFormComponents/D4LInput';
import { getQuestionClass, ValidationRules } from '../forms/PersonalData/utils';
import ViewField from '../ViewField';

interface Props {
  name: string;
  readOnly: boolean;
  label: string;
  validationRules: ValidationRules;
  control: Control<Record<string, any>>;
  type?: string;
  required?: boolean;
}

const TextQuestion: React.FC<Props> = ({
  readOnly = false,
  label,
  type = 'text',
  name,
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
        <ControlledD4LInput
          label={`${t(label)}${required ? ' *' : ''}`}
          type={type}
          name={name}
          control={control}
          validationRules={validationRules}
          required={required}
        />
      )}
    </div>
  );
};

export default TextQuestion;
