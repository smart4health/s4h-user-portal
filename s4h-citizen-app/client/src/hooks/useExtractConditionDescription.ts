import { Problem } from '@d4l/s4h-fhir-xforms';
import { useTranslation } from 'react-i18next';

const useExtractConditionDescription = (namespace?: string) => {
  const { t } = useTranslation(namespace);

  const extractDescription = (condition: Problem) => {
    const conditionDescription = condition.code?.resolvedText;
    const conditionCode = condition.code?.resolvedText;
    const conditionCodeSystem = condition.code?.codeableConcept.coding?.[0].system;

    const defaultDescription = `${t(
      'patient_summary.conditions_description_code.title'
    )}: ${conditionCode}, ${t(
      'patient_summary.conditions_description_system.title'
    )}: ${conditionCodeSystem}`;
    const description = !!conditionDescription
      ? conditionDescription
      : defaultDescription;

    return description;
  };

  return extractDescription;
};

export default useExtractConditionDescription;
