import React from 'react';
import { Control, useController } from 'react-hook-form';
import {
  ValidationRules,
  validationRules,
} from '../../../features/MedicalHistory/forms/PersonalData/utils';
import webComponentWrapper from '../../../utils/webComponentWrapper';

interface Props {
  name: string;
  label: string;
  control: Control<Record<string, any>>;
  validationRules: ValidationRules;
  fields: {
    day: {
      label: string;
      placeholder: string;
    };
    month: {
      label: string;
      placeholder: string;
    };
    year: {
      label: string;
      placeholder: string;
    };
  };
  dataTestId?: string;
  order?: [string, string, string];
  futureAllowed?: boolean;
  required?: boolean;
}

const ControlledD4LDateInput = ({
  fields,
  order = ['day', 'month', 'year'],
  name,
  control,
  label,
  dataTestId,
  futureAllowed = false,
  required = false,
}: Props) => {
  const {
    field: { value, onChange },
  } = useController({
    name,
    control,
    rules: validationRules,
  });
  const date = value ? value.split('-') : ['', '', ''];
  const inputRef = webComponentWrapper({
    handleChange: onChange,
    order,
    fields: {
      day: {
        ...fields.day,
        value: date[2],
      },
      month: {
        ...fields.month,
        value: date[1],
      },
      year: {
        ...fields.year,
        value: date[0],
      },
    },
    futureAllowed,
    ...validationRules,
  });

  return (
    <d4l-date-input
      /*
      // @ts-ignore */
      ref={inputRef}
      label={label}
      name={name}
      data-test={dataTestId}
      required={required}
    />
  );
};

export default ControlledD4LDateInput;
