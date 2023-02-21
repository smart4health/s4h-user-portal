import React from 'react';
import { Control, useController } from 'react-hook-form';
import {
  Option,
  ValidationRules,
} from '../../../features/MedicalHistory/forms/PersonalData/utils';
import webComponentWrapper from '../../../utils/webComponentWrapper';

interface Props {
  name: string;
  label: string;
  options: Option[];
  control: Control<Record<string, any>>;
  validationRules: ValidationRules;
  required?: boolean;
}

const ControlledD4LSelect = ({
  name,
  control,
  options,
  label,
  validationRules,
  required = false,
}: Props) => {
  const {
    field: { value, onChange },
  } = useController({
    name,
    control,
  });

  const inputRef = webComponentWrapper({
    handleChange: onChange,
    options,
    selectedValue: value,
    ...validationRules,
  });

  return (
    <d4l-select
      // @ts-ignore
      ref={inputRef}
      label={label}
      selectedValue={value}
      required={required}
    />
  );
};

export default ControlledD4LSelect;
