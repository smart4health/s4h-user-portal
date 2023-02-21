import D4LSDK from '@d4l/js-sdk';
import { apiReadProvenanceData, Provenance } from '@d4l/s4h-fhir-xforms';
import { FHIR_Identifier } from '@d4l/s4h-fhir-xforms/dist/typings/fhir-resources/types';
import logIssueList from '../utils/logIssueList';

const fetchProvenance = async (
  resourceIdentifiers: FHIR_Identifier[][]
): Promise<Provenance[] | undefined> => {
  const [issueList, result] = await apiReadProvenanceData({
    sdk: D4LSDK,
    resourceIdentifiers: resourceIdentifiers,
  });
  if (result?.model.provenances) {
    return result.model.provenances;
  } else {
    logIssueList(issueList);
    const errors = issueList.filter(issue => issue.severity === 'error');

    if (errors.length > 0) {
      throw new Error(JSON.stringify(errors));
    }
    return undefined;
  }
};

export { fetchProvenance };
