import React from 'react';
import { render } from '../../../utils/test-utils';
import AllergiesIntolerances from './AllergiesIntolerances';
import {
  allergyBaseMock,
  allergyClinicalStatusMock,
  allergyCriticalityMock,
  allergyReactionMock,
  allergyVerificationAndClinicalMock,
  allergyVerificationStatusMock,
  initialState,
} from './mocks';

describe('AllergiesIntolerances', () => {
  describe('Rendering', () => {
    it('renders when no allergies and intolerances are available', () => {
      const { container } = render(<AllergiesIntolerances />);

      expect(container.firstChild).toEqual(null);
    });

    it('renders all allergies and intolerances', () => {
      const { getByText } = render(<AllergiesIntolerances />, {
        initialState: {
          allergiesIntolerances: initialState(allergyBaseMock),
        },
      });
      expect(getByText('Allergy to gold (finding)')).toBeInTheDocument();
    });

    describe('reaction', () => {
      describe('present', () => {
        it('contains reaction info', () => {
          const { getAllByText } = render(<AllergiesIntolerances />, {
            initialState: {
              allergiesIntolerances: initialState(allergyReactionMock),
            },
          });
          expect(
            getAllByText(
              allergyReactionMock.reactions[0].manifestations[0].resolvedText
            )
          ).toBeDefined();
        });
      });
      describe('absent', () => {
        [
          allergyBaseMock,
          allergyClinicalStatusMock,
          allergyCriticalityMock,
          allergyVerificationStatusMock,
        ].forEach(mock => {
          it(`does not contain reaction info for ${mock}`, () => {
            const { container } = render(<AllergiesIntolerances />, {
              initialState: {
                allergiesIntolerances: initialState(mock),
              },
            });
            expect(
              container.querySelector('.AllergyIntoleranceListItem__reaction')
            ).toBeNull();
          });
        });
      });
    });
    describe('title', () => {
      [
        allergyBaseMock,
        allergyClinicalStatusMock,
        allergyCriticalityMock,
        allergyVerificationStatusMock,
        allergyReactionMock,
      ].forEach(mock => {
        it(`displays title "${mock.code.resolvedText}"`, () => {
          const { getByText } = render(<AllergiesIntolerances />, {
            initialState: {
              allergiesIntolerances: initialState(mock),
            },
          });
          expect(getByText(mock.code.resolvedText)).toBeInTheDocument();
        });
      });
    });
    describe('tags', () => {
      [
        allergyClinicalStatusMock,
        allergyVerificationAndClinicalMock,
        allergyCriticalityMock,
      ].forEach(mock => {
        it(`displays tag wrapper if at least a single tag is present for ${mock.code.resolvedText}`, () => {
          const { container } = render(<AllergiesIntolerances />, {
            initialState: {
              allergiesIntolerances: initialState(mock),
            },
          });
          expect(container.querySelector('.ListItem__tags')).toBeInTheDocument();
        });
      });

      it(`does not display tag wrapper if no tags present`, () => {
        const { container } = render(<AllergiesIntolerances />, {
          initialState: {
            allergiesIntolerances: initialState(allergyBaseMock),
          },
        });
        expect(container.querySelector('.ListItem__tags')).not.toBeInTheDocument();
      });

      describe('clinicalStatus', () => {
        it('displays tag', () => {
          const { getByTestId } = render(<AllergiesIntolerances />, {
            initialState: {
              allergiesIntolerances: initialState(allergyClinicalStatusMock),
            },
          });
          expect(
            getByTestId('list-item-ai-clinical-status-tag').getAttribute('text')
          ).toContain(allergyClinicalStatusMock.clinicalStatus.resolvedText);
        });
        it('displays verification status', () => {
          const { getByTestId } = render(<AllergiesIntolerances />, {
            initialState: {
              allergiesIntolerances: initialState(
                allergyVerificationAndClinicalMock
              ),
            },
          });
          expect(
            getByTestId('list-item-ai-clinical-status-tag').getAttribute('text')
          ).toContain(
            allergyVerificationAndClinicalMock.verificationStatus.resolvedText
          );
        });
        it('does not display tag when missing', () => {
          const { queryByTestId } = render(<AllergiesIntolerances />, {
            initialState: {
              allergiesIntolerances: initialState(allergyBaseMock),
            },
          });
          expect(
            queryByTestId('list-item-ai-clinical-status-tag')
          ).not.toBeInTheDocument();
        });
        it('does not display verification status when missing', () => {
          const { getByTestId } = render(<AllergiesIntolerances />, {
            initialState: {
              allergiesIntolerances: initialState(allergyClinicalStatusMock),
            },
          });
          expect(
            getByTestId('list-item-ai-clinical-status-tag').getAttribute('text')
          ).not.toContain(
            allergyVerificationStatusMock.verificationStatus.resolvedText
          );
        });
      });
      describe('criticality', () => {
        it('displays tag', () => {
          const { getByTestId } = render(<AllergiesIntolerances />, {
            initialState: {
              allergiesIntolerances: initialState(allergyCriticalityMock),
            },
          });
          expect(
            getByTestId('list-item-ai-criticality-status-tag').getAttribute('text')
          ).toContain(allergyCriticalityMock.criticalityConcept.resolvedText);
        });
        it('does not display tag when missing', () => {
          const { queryByTestId } = render(<AllergiesIntolerances />, {
            initialState: {
              allergiesIntolerances: initialState(allergyBaseMock),
            },
          });
          expect(
            queryByTestId('list-item-ai-criticality-status-tag')
          ).not.toBeInTheDocument();
        });
      });
    });
  });
});
