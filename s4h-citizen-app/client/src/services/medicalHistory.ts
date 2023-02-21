import D4LSDK from '@d4l/js-sdk';
import {
  apiReadMedicalHistory,
  apiWriteMedicalHistory,
  IssueList,
  PersonalData,
} from '@d4l/s4h-fhir-xforms';
import logIssueList from '../utils/logIssueList';

export const fetchPatient = async (): Promise<{
  issues: IssueList;
  personalData: PersonalData | undefined;
  inputResourceIds: readonly string[] | undefined;
}> => {
  const [issues, model] = await apiReadMedicalHistory({ sdk: D4LSDK });

  const errors = issues.filter(issue => issue.severity === 'error');

  if (errors.length > 0) {
    throw new Error('Reading failed');
  }

  return {
    issues,
    personalData: model?.personalData,
    inputResourceIds: model?.inputResourceIds,
  };
};

export const savePatient = async (
  personalData: PersonalData
): Promise<{
  personalData: PersonalData;
  inputResourceIds: readonly string[] | undefined;
}> => {
  const result = await apiWriteMedicalHistory(
    {
      modelType: 'MedicalHistory/1',
      personalData: personalData,
    },
    { sdk: D4LSDK, dateTime: new Date() }
  );

  const errors = result[0].filter(issue => issue.severity === 'error');

  logIssueList(errors);
  if (errors.length > 0) {
    throw new Error('Update failed');
  }
  return {
    personalData: result[1]?.personalData ?? {},
    inputResourceIds: result[1]?.inputResourceIds,
  };
};
