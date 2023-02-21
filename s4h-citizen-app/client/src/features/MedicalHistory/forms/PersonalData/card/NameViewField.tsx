/* eslint-disable react/require-default-props */
import React from 'react';
import { Control, useWatch } from 'react-hook-form';
import ViewField from '../../../ViewField';
import { fieldNames, getQuestionClass } from '../utils';

interface Props {
  control: Control<Record<string, any>>;
}

const NameViewField: React.FC<Props> = ({ control }) => {
  const firstName = useWatch({
    name: fieldNames.firstName,
    control,
  });

  const lastName = useWatch({
    name: fieldNames.lastName,
    control,
  });

  const value = firstName && lastName ? `${firstName} ${lastName}` : '-';

  return (
    <div className={getQuestionClass(true, !!firstName && !!lastName)}>
      <ViewField value={value as string} />
    </div>
  );
};

export default NameViewField;
