import { SerializedError, unwrapResult } from '@reduxjs/toolkit';
import React, { useEffect, useState } from 'react';
import { Control, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import ControlledD4LSelect from '../../../components/ControlledFormComponents/D4LSelect';
import { useIsMounted } from '../../../hooks';
import { fetchValueSet } from '../../../redux/globalsSlice';
import {
  getQuestionClass,
  mapValueSetCodeToTranslationKey,
  Option,
  ValidationRules,
} from '../forms/PersonalData/utils';
import ViewField from '../ViewField';

interface Props {
  readOnly: boolean;
  name: string;
  label: string;
  valueSetUrl: string;
  control: Control<Record<string, any>>;
  validationRules: ValidationRules;
  required?: boolean;
}

type Coding = {
  system: string;
  code: string;
  display: string;
};

const DropdownQuestion: React.FC<Props> = ({
  label,
  readOnly,
  name,
  control,
  valueSetUrl,
  validationRules,
  required = false,
}) => {
  const { t } = useTranslation('anamnesis');
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [hasValueSetError, setHasValueSetError] = useState(false);
  const [translatedOptions, setTranslatedOptions] = useState<Option[]>();
  const isComponentMounted = useIsMounted();

  useEffect(() => {
    if (isComponentMounted) {
      setIsLoading(true);
      const valueSetApiCall = dispatch(fetchValueSet(valueSetUrl));
      valueSetApiCall
        .then(unwrapResult)
        .then((codings: Coding[]) => {
          const translatedOptions = [
            { text: t('answers.please_choose'), value: '' },
            ...codings.map(({ code }) => ({
              value: code,
              text: t(`answers.${mapValueSetCodeToTranslationKey(code)}`),
            })),
          ];
          setTranslatedOptions(translatedOptions);
        })
        .catch((error: SerializedError) => {
          setHasValueSetError(true);
          console.log(`Error while looking up valueset for ${name}: ${error}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
      return () => {
        valueSetApiCall.abort();
      };
    }
  }, [dispatch, isComponentMounted, name, t, valueSetUrl]);

  const value = useWatch<string | undefined>({
    name,
    control,
  });

  const translatedValue = value
    ? t(`answers.${mapValueSetCodeToTranslationKey(value)}`)
    : value;

  return (
    <div className={getQuestionClass(readOnly, !!translatedValue)}>
      {readOnly || isLoading || hasValueSetError ? (
        <ViewField label={label} value={translatedValue} />
      ) : (
        <div>
          <ControlledD4LSelect
            label={`${t(label)}${required ? ' *' : ''}`}
            name={name}
            data-test={`${name}-documentFieldSelect`}
            options={translatedOptions || []}
            control={control}
            validationRules={validationRules}
            required={required}
          />
        </div>
      )}
    </div>
  );
};

export default DropdownQuestion;
