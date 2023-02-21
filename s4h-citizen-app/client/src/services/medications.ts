import D4LSDK from '@d4l/js-sdk';
import {
  apiDeleteMedication,
  apiReadMedicationList,
  MedicationStatement,
} from '@d4l/s4h-fhir-xforms';
import { NotLoggedInError } from '../utils/error/login';
import logIssueList from '../utils/logIssueList';

export const fetchMedications = async (
  language: string
): Promise<MedicationStatement[]> => {
  const lang = language !== 'en' && language !== 'de' ? 'en' : language;

  const [issues, result] = await apiReadMedicationList({
    sdk: D4LSDK,
    // any other language than 'en' and 'de' is not supported
    language: lang,
  });

  const errors = issues.filter(issue => issue.severity === 'error');
  logIssueList(errors);

  const medications: MedicationStatement[] = [
    ...(result?.model.medicationStatements || []),
  ];

  return medications;
};

export const deleteMedication = async (
  medicationId: string,
  medicationList: MedicationStatement[]
): Promise<string> => {
  const [issues] = await apiDeleteMedication(
    {
      sdk: D4LSDK,
    },
    {
      medicationStatements: medicationList,
      modelType: 'MedicationList/1',
    },
    medicationId
  );

  const errors = issues.filter(issue => issue.severity === 'error');
  logIssueList(errors);

  if (errors.length > 0) {
    throw new Error('Deletion failed');
  }

  return medicationId;
};

export interface DeleteMedicationsResult {
  deletedMedicationStatementIds: string[];
  hasErrored: boolean;
}

export const deleteMedications = async (
  medicationStatementIds: string[],
  medicationList: MedicationStatement[]
): Promise<DeleteMedicationsResult> => {
  const deletedMedicationStatementIds: string[] = [];
  let hasErrored = false;

  await Promise.all(
    medicationStatementIds.map(async medicationStatementId => {
      const [issues] = await apiDeleteMedication(
        {
          sdk: D4LSDK,
        },
        {
          medicationStatements: medicationList,
          modelType: 'MedicationList/1',
        },
        medicationStatementId
      );

      const errors = issues.filter(issue => issue.severity === 'error');
      logIssueList(errors);

      if (errors.length === 0) {
        deletedMedicationStatementIds.push(medicationStatementId);
      }

      hasErrored = hasErrored || errors.length > 0;
    })
  );

  return { deletedMedicationStatementIds, hasErrored };
};

export const fetchResource = async (resourceId: string): Promise<D4LSDK.Record> => {
  const userId = D4LSDK.getCurrentUserId();

  if (!userId) {
    throw new NotLoggedInError();
  }

  return await D4LSDK.fetchResource(userId, resourceId);
};
