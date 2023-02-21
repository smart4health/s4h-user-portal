import D4LSDK from '@d4l/js-sdk';
import * as xForms from '@d4l/s4h-fhir-xforms';
import { simpleGroupIdentifier } from '../../features/DocumentsViewer/mocks';
import { mockProvenanceResponse } from '../../mocks/provenance';
import { fetchProvenance } from '../provenance';
jest.mock('@d4l/s4h-fhir-xforms', () => {
  return {
    __esModule: true,
    apiReadProvenanceData: jest.fn(),
  };
});

const params = [simpleGroupIdentifier];

describe('fetchProvenance', () => {
  afterAll(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('makes a call to the right endpoint with the right data', async () => {
    try {
      await fetchProvenance(params);
    } catch (error) {
    } finally {
      expect(xForms.apiReadProvenanceData).toHaveBeenCalledWith(
        expect.objectContaining({
          sdk: D4LSDK,
          resourceIdentifiers: params,
        })
      );
    }
  });
  it('returns the data of the response when successful', async () => {
    jest
      .spyOn(xForms, 'apiReadProvenanceData')
      .mockImplementationOnce(() => Promise.resolve([[], mockProvenanceResponse]));
    const response = await fetchProvenance(params);
    expect(response).toEqual(mockProvenanceResponse.model.provenances);
  });
  it('throws the issue list entries with severity error when no provenance information is retrieved', async () => {
    const issueList: xForms.IssueList = [
      {
        severity: 'error',
        message: 'no provenance resources specified',
      },
    ];
    jest
      .spyOn(xForms, 'apiReadProvenanceData')
      .mockImplementationOnce(() => Promise.resolve([issueList, undefined]));
    try {
      await fetchProvenance(params);
    } catch (error) {
      expect(error).toEqual(new Error(JSON.stringify(issueList)));
    }
  });
  it('throws an error in case of any errors', async () => {
    const errorObject = {
      error: 'error',
    };
    jest
      .spyOn(xForms, 'apiReadProvenanceData')
      .mockImplementationOnce(() => Promise.reject(errorObject));
    try {
      await fetchProvenance(params);
    } catch (error) {
      expect(error).toEqual(errorObject);
    }
  });
});
