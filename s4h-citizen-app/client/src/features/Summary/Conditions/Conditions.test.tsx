import React from 'react';
import { render } from '../../../utils/test-utils';
import Conditions, { ClinicalStatusColorCodes } from './Conditions';
import {
  codeMockWithoutResolvedText,
  conditionMock,
  conditionsSliceMock,
  periodWithoutRecordedDate,
} from './mocks';

describe('Conditions', () => {
  describe('Rendering', () => {
    it('renders nothing when no conditions are available', () => {
      const { container } = render(<Conditions />);

      expect(container.firstChild).toEqual(null);
    });
    it('renders all the conditions', () => {
      const { getByText } = render(<Conditions />, {
        initialState: {
          conditions: conditionsSliceMock([conditionMock()]),
        },
      });
      expect(
        getByText('Acute myocardial infarction of anterior wall', { exact: false })
      ).toBeInTheDocument();
    });

    describe('Condition Description', () => {
      it('displays if it was resolved', () => {
        const { getByText } = render(<Conditions />, {
          initialState: { conditions: conditionsSliceMock([conditionMock()]) },
        });
        expect(getByText(conditionMock().code!.resolvedText!)).toBeInTheDocument();
      });
      it('displays the code and system of the corresponding codeableConcept when not available', () => {
        const conditionWithoutResolvedText = {
          ...conditionMock(),
          code: codeMockWithoutResolvedText,
        };
        const { getByText } = render(<Conditions />, {
          initialState: {
            conditions: conditionsSliceMock([conditionWithoutResolvedText]),
          },
        });
        expect(
          getByText('patient_summary.conditions_description_code.title', {
            exact: false,
          })
        ).toBeInTheDocument();
        expect(
          getByText('patient_summary.conditions_description_system.title', {
            exact: false,
          })
        ).toBeInTheDocument();
      });
    });
    describe('Tag', () => {
      it('displays wrapper div if one of  clinical status or recorded date is avalaible', () => {
        const { container } = render(<Conditions />, {
          initialState: { conditions: conditionsSliceMock([conditionMock()]) },
        });

        expect(container.querySelector('.ConditionListItem__tags')).toBeDefined();
      });

      describe('Clinical Status', () => {
        it('is dispayed when available', () => {
          const { getByTestId } = render(<Conditions />, {
            initialState: { conditions: conditionsSliceMock([conditionMock()]) },
          });

          expect(
            getByTestId('list-item-clinical-status-tag').getAttribute('text')
          ).toContain(conditionMock().clinicalStatus.resolvedText);
        });
        it('displays the verification status when available', () => {
          const { getByTestId } = render(<Conditions />, {
            initialState: { conditions: conditionsSliceMock([conditionMock()]) },
          });

          expect(
            getByTestId('list-item-clinical-status-tag').getAttribute('text')
          ).toContain(conditionMock().verificationStatus!.resolvedText);
        });
        it('displays in secondary lighest color when clinical status is "Active"', () => {
          const { getByTestId } = render(<Conditions />, {
            initialState: {
              conditions: conditionsSliceMock([conditionMock('Active')]),
            },
          });

          expect(
            getByTestId('list-item-clinical-status-tag').getAttribute('classes')
          ).toContain(ClinicalStatusColorCodes.Active);
        });
        it('displays in secondary lighest color when clinical status is "Recurrence"', () => {
          const { getByTestId } = render(<Conditions />, {
            initialState: {
              conditions: conditionsSliceMock([conditionMock('Recurrence')]),
            },
          });

          expect(
            getByTestId('list-item-clinical-status-tag').getAttribute('classes')
          ).toContain(ClinicalStatusColorCodes.Recurrence);
        });
        it('displays in secondary lighest color when clinical status is "Relapse"', () => {
          const { getByTestId } = render(<Conditions />, {
            initialState: {
              conditions: conditionsSliceMock([conditionMock('Relapse')]),
            },
          });

          expect(
            getByTestId('list-item-clinical-status-tag').getAttribute('classes')
          ).toContain(ClinicalStatusColorCodes.Relapse);
        });
        it('displays in secondary lighest color when clinical status is "Inactive"', () => {
          const { getByTestId } = render(<Conditions />, {
            initialState: {
              conditions: conditionsSliceMock([conditionMock('Inactive')]),
            },
          });

          expect(
            getByTestId('list-item-clinical-status-tag').getAttribute('classes')
          ).toContain(ClinicalStatusColorCodes.Inactive);
        });
        it('displays in secondary lighest color when clinical status is "Remission"', () => {
          const { getByTestId } = render(<Conditions />, {
            initialState: {
              conditions: conditionsSliceMock([conditionMock('Remission')]),
            },
          });

          expect(
            getByTestId('list-item-clinical-status-tag').getAttribute('classes')
          ).toContain(ClinicalStatusColorCodes.Remission);
        });
        it('displays in secondary lighest color when clinical status is "Resolved"', () => {
          const { getByTestId } = render(<Conditions />, {
            initialState: {
              conditions: conditionsSliceMock([conditionMock('Resolved')]),
            },
          });

          expect(
            getByTestId('list-item-clinical-status-tag').getAttribute('classes')
          ).toContain(ClinicalStatusColorCodes.Resolved);
        });
      });
      describe('Recorded Date', () => {
        it('is displayed when available', () => {
          const { getByTestId } = render(<Conditions />, {
            initialState: { conditions: conditionsSliceMock([conditionMock()]) },
          });

          expect(
            getByTestId('list-item-recorded-date-tag').getAttribute('text')
          ).toEqual('February 26, 2020');
        });
        it('is not displayed when not available', () => {
          const conditionWithoutRecordedDate = {
            ...conditionMock(),
            period: periodWithoutRecordedDate,
          };
          const { queryByTestId } = render(<Conditions />, {
            initialState: {
              conditions: conditionsSliceMock([conditionWithoutRecordedDate]),
            },
          });

          expect(queryByTestId('list-item-recorded-date-tag')).toBeNull();
        });
      });
    });
  });
});
