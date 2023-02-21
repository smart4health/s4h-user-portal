import D4LSDK from '@d4l/js-sdk';
import {
  AllergyIntolerance,
  apiReadAllergyIntoleranceList,
} from '@d4l/s4h-fhir-xforms';
import { EntityId } from '@reduxjs/toolkit';
import logIssueList from '../utils/logIssueList';
import { deleteSDKResourceWithRejectionPropagation } from './D4L';

export const getAllergiesIntolerances = async (): Promise<
  AllergyIntolerance[] | undefined
> => {
  const [issueList, allergiesIntolerancesList] = await apiReadAllergyIntoleranceList(
    { sdk: D4LSDK }
  );
  if (allergiesIntolerancesList?.model.allergyIntolerances.length) {
    return allergiesIntolerancesList.model.allergyIntolerances;
  } else {
    logIssueList(issueList);
    const errors = issueList.filter(issue => issue.severity === 'error');

    if (errors.length > 0) {
      throw new Error(JSON.stringify(errors));
    }
    return undefined;
  }
};

export interface DeleteAllergiesIntolerancesResult {
  deletedAllergiesIntolerancesIds: EntityId[];
  hasErrored: boolean;
}

export const deleteAllergiesIntolerancesResources = async (
  allergiesIntolerancesIds: EntityId[]
): Promise<DeleteAllergiesIntolerancesResult> => {
  let deletedAllergiesIntolerancesIds: EntityId[] = [];
  let hasErrored = false;

  const results = await Promise.allSettled(
    allergiesIntolerancesIds.map(deleteSDKResourceWithRejectionPropagation)
  );

  results.forEach(result => {
    hasErrored = hasErrored || result.status === 'rejected';
    if (result.status === 'fulfilled') {
      deletedAllergiesIntolerancesIds.push(result.value);
    }
  });

  return { deletedAllergiesIntolerancesIds, hasErrored };
};
