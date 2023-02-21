import { PersonalData } from '@d4l/s4h-fhir-xforms';
/* eslint-disable import/prefer-default-export */
import classNames from 'classnames';

export const valueSetUrls = {
  gender: 'http://hl7.org/fhir/ValueSet/administrative-gender',
  blood: 'http://loinc.org/vs/LL2419-1',
  rh: 'http://loinc.org/vs/LL360-9',
};

export type Option = {
  value: string;
  text: string;
};

const FEMALE = 'female';
const MALE = 'male';
const OTHER = 'other';
const UNKNOWN = 'unknown';

const BLOOD_0 = '0';
const BLOOD_A = 'A';
const BLOOD_B = 'B';
const BLOOD_AB = 'AB';

const BLOOD_RHESUS_FACTOR_POSITIVE = 'Positive';
const BLOOD_RHESUS_FACTOR_NEGATIVE = 'Negative';

const valueSetCodes: { [key: string]: string } = {
  'LA19708-9': BLOOD_0,
  'LA19709-7': BLOOD_B,
  'LA19710-5': BLOOD_A,
  'LA28449-9': BLOOD_AB,
  'LA6576-8': BLOOD_RHESUS_FACTOR_POSITIVE,
  'LA6577-6': BLOOD_RHESUS_FACTOR_NEGATIVE,
  female: FEMALE,
  male: MALE,
  other: OTHER,
  unknown: UNKNOWN,
};

export const mapValueSetCodeToTranslationKey = (code: string): string =>
  valueSetCodes[code];

export const fieldNames = {
  firstName: 'firstName',
  lastName: 'lastName',
  dateOfBirth: 'dateOfBirth',
  occupation: 'occupation',
  gender: 'gender',
  weight: 'weight',
  height: 'height',
  blood: 'blood',
  rh: 'rh',
};

export type FormValues = {
  firstName: string | undefined;
  lastName: string | undefined;
  dateOfBirth: string | undefined;
  occupation: string | undefined;
  gender: 'male' | 'female' | 'other' | 'unknown' | undefined;
  blood: 'LA19708-9' | 'LA19709-7' | 'LA19710-5' | 'LA28449-9' | undefined;
  rh: 'Positive' | 'Negative' | undefined;
  weight: string | undefined;
  height: string | undefined;
};

export type ValidationRules = {
  required?: boolean;
  min?: number;
  max?: number;
  maxlength?: number;
};

export const validationRules: { [key: string]: ValidationRules } = {
  [fieldNames.firstName]: {
    required: true,
  },
  [fieldNames.lastName]: {
    required: true,
  },
  [fieldNames.dateOfBirth]: {
    required: true,
  },
  [fieldNames.occupation]: {
    required: true,
  },
  [fieldNames.gender]: {
    required: true,
  },
  [fieldNames.weight]: {
    required: true,
    min: 1,
    max: 300,
  },
  [fieldNames.height]: {
    required: true,
    min: 1,
    max: 300,
  },
  [fieldNames.blood]: {
    required: true,
  },
  [fieldNames.rh]: {
    required: true,
  },
};

export const formToPersonalData = (formState: FormValues): PersonalData => {
  return {
    firstName: formState.firstName,
    lastName: formState.lastName,
    gender: formState.gender,
    dateOfBirth: formState.dateOfBirth,
    height: {
      value: parseInt(formState.height ? formState.height : '', 10),
      unit: 'cm',
    },
    weight: {
      value: parseInt(formState.weight ? formState.weight : '', 10),
      unit: 'kg',
    },
    bloodGroup: {
      system: 'http://loinc.org',
      code: formState.blood,
    },
    bloodRhesus: {
      system: 'http://loinc.org',
      code: formState.rh,
    },
    occupation: formState.occupation,
  };
};

export const personalDataToFormState = (personalData: PersonalData) => ({
  [fieldNames.firstName]: personalData?.firstName,
  [fieldNames.lastName]: personalData?.lastName,
  [fieldNames.dateOfBirth]: personalData?.dateOfBirth,
  [fieldNames.occupation]: personalData?.occupation,
  [fieldNames.gender]: personalData?.gender,
  [fieldNames.blood]: personalData?.bloodGroup?.code,
  [fieldNames.rh]: personalData?.bloodRhesus?.code,
  [fieldNames.weight]: personalData?.weight?.value,
  [fieldNames.height]: personalData?.height?.value,
});

export const getQuestionClass = (
  isReadOnly: boolean,
  hasBeenAnswered: boolean,
  additionalClasses = ''
) =>
  classNames(
    'MedicalHistoryQuestion',
    additionalClasses,
    {
      'MedicalHistoryQuestion--readonly': isReadOnly,
    },
    {
      'MedicalHistoryQuestion--answered': hasBeenAnswered,
    }
  );

export const formatDate = (year: string, month: string, day: string) =>
  `${year}${month ? `-${month}${day ? `-${day}` : ''}` : ''}`;
