import FilterErrorEventData from '../filterErrorEventData';

const mockXFormsIssue = {
  context: {
    cause:
      'nodes cannot be merged: 42ac51bd-ca79-4080-bc26-311188e56055 vs a7bbb846-3162-4ca4-8140-0d1028d15cf0',
    severity: 'error',
  },
  severity: 'error',
  message: 'could not add Medication to graph',
  tags: ['insertMedicationResource'],
};

describe('FilterErrorEventData', () => {
  describe('Methods', () => {
    describe('filterXFormsIssue', () => {
      it('sanitizes the xform issue', () => {
        const { context, ...sanitized } = mockXFormsIssue;
        expect(
          new FilterErrorEventData().filterXFormsIssue(mockXFormsIssue)
        ).toMatchObject(sanitized);
      });
    });
  });
});
