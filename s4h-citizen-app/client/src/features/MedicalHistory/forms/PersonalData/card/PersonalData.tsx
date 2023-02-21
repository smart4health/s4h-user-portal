import React from 'react';
import { Control } from 'react-hook-form';
import DateInput from '../../../DateInput';
import DropdownQuestion from '../../../DropdownQuestion';
import TextQuestion from '../../../TextQuestion';
import { fieldNames, validationRules, valueSetUrls } from '../utils';
import NameViewField from './NameViewField';
import './PersonalData.scss';

export interface Props {
  readOnly: boolean;
  control: Control<Record<string, any>>;
}

const PersonalDataForm: React.FC<Props> = ({ readOnly, control }) => {
  return (
    <div className="PersonalDataForm" data-testid="personal-data-form">
      {readOnly ? (
        <div className="PersonalDataForm__name">
          <NameViewField control={control} />
        </div>
      ) : (
        <>
          <TextQuestion
            label="questions.given"
            name={fieldNames.firstName}
            control={control}
            validationRules={validationRules.firstName}
            readOnly={readOnly}
            required
          />
          <TextQuestion
            label="questions.family"
            name={fieldNames.lastName}
            control={control}
            validationRules={validationRules.lastName}
            readOnly={readOnly}
            required
          />
        </>
      )}

      <DropdownQuestion
        label="questions.gender"
        control={control}
        name={fieldNames.gender}
        valueSetUrl={valueSetUrls.gender}
        validationRules={validationRules.gender}
        readOnly={readOnly}
        required
      />
      <DateInput
        label="questions.birthDate"
        name={fieldNames.dateOfBirth}
        control={control}
        validationRules={validationRules.dateOfBirth}
        readOnly={readOnly}
        required
      />
      <TextQuestion
        label="questions.weight"
        name={fieldNames.weight}
        type="number"
        control={control}
        validationRules={validationRules.weight}
        readOnly={readOnly}
        required
      />
      <TextQuestion
        label="questions.height"
        name={fieldNames.height}
        type="number"
        control={control}
        validationRules={validationRules.height}
        readOnly={readOnly}
        required
      />
      <DropdownQuestion
        label="questions.blood_type"
        control={control}
        name={fieldNames.blood}
        valueSetUrl={valueSetUrls.blood}
        validationRules={validationRules.blood}
        readOnly={readOnly}
        required
      />
      <DropdownQuestion
        label="questions.blood_rh_factor"
        control={control}
        name={fieldNames.rh}
        valueSetUrl={valueSetUrls.rh}
        validationRules={validationRules.rh}
        readOnly={readOnly}
        required
      />
      <TextQuestion
        label="questions.job_position"
        name={fieldNames.occupation}
        control={control}
        validationRules={validationRules.occupation}
        readOnly={readOnly}
        required
      />
    </div>
  );
};

export default PersonalDataForm;
