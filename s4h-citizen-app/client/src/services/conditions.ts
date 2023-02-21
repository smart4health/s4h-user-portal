import D4LSDK from '@d4l/js-sdk';
import { apiReadProblemList, Problem } from '@d4l/s4h-fhir-xforms';
import { EntityId } from '@reduxjs/toolkit';
import logIssueList from '../utils/logIssueList';
import { deleteSDKResourceWithRejectionPropagation } from './D4L';

export const getConditions = async (): Promise<Problem[] | undefined> => {
  // The hard error happens only in cases when SDK fails to make the call
  // In all other cases, we have soft errors. Meaning, if retrieved FHIR resources have
  // errors, they are in the issueList and that could be processed are in ConditionList
  const [issueList, conditionList] = await apiReadProblemList({ sdk: D4LSDK });
  logIssueList(issueList);
  if (conditionList?.model.problems.length) {
    return conditionList.model.problems;
  } else {
    // no conditions were processable. Meaning everything errored.
    const errors = issueList.filter(issue => issue.severity === 'error');

    if (errors.length > 0) {
      throw new Error(JSON.stringify(errors));
    }
  }
  // cases where there are no condition list uploaded
  return undefined;
};

export interface DeleteConditionsResult {
  deletedConditionIds: EntityId[];
  hasErrored: boolean;
}

export const deleteConditionResources = async (
  conditionIds: EntityId[]
): Promise<DeleteConditionsResult> => {
  let deletedConditionIds: EntityId[] = [];
  let hasErrored = false;

  const results = await Promise.allSettled(
    conditionIds.map(deleteSDKResourceWithRejectionPropagation)
  );

  results.forEach(result => {
    hasErrored = hasErrored || result.status === 'rejected';
    if (result.status === 'fulfilled') {
      deletedConditionIds.push(result.value);
    }
  });

  return { deletedConditionIds, hasErrored };
};
