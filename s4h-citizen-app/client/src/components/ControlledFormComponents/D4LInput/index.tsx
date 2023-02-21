import React from 'react';
import { Control, useController } from 'react-hook-form';
import { ValidationRules } from '../../../features/MedicalHistory/forms/PersonalData/utils';
import webComponentWrapper from '../../../utils/webComponentWrapper';

interface Props {
  name: string;
  label: string;
  control: Control<Record<string, any>>;
  validationRules: ValidationRules;
  type: string;
  required?: boolean;
}

const ControlledD4LInput = ({
  name,
  control,
  label,
  validationRules,
  type,
  required = false,
}: Props) => {
  const {
    field: { value, onChange },
  } = useController({
    name,
    control,
  });

  const inputRef = webComponentWrapper({
    value,
    handleInput: onChange,
    ...validationRules,
  });

  return (
    <d4l-input
      /*
      // @ts-ignore */
      ref={inputRef}
      label={label}
      name={name}
      value={value}
      data-test={`${name}-documentFieldInput`}
      fullWidth
      type={type}
      required={required}
    />
  );
};

export default ControlledD4LInput;
