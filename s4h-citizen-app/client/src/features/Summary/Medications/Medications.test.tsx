import React from 'react';
import { render } from '../../../utils/test-utils';
import Medications from './Medications';
import { medicationMock, medicationSliceMock } from './mocks';

describe('Medications', () => {
  describe('Rendering', () => {
    it('renders nothing when no medications are available', () => {
      const { container } = render(<Medications />);

      expect(container.firstChild).toEqual(null);
    });

    describe('Medication Title', () => {
      it('displays if it was resolved', () => {
        const { getByText } = render(<Medications />, {
          initialState: {
            medication: medicationSliceMock([medicationMock({})]),
          },
        });
        expect(
          getByText(medicationMock({}).code!.resolvedText!)
        ).toBeInTheDocument();
      });

      it('displays unidentified medication into if title is empty', () => {
        const { getByText } = render(<Medications />, {
          initialState: {
            medication: medicationSliceMock([medicationMock({ emptyTitle: true })]),
          },
        });
        expect(getByText('medication.description.infotext')).toBeInTheDocument();
      });
    });
    describe('Medication details button', () => {
      it('will be displayed', () => {
        const med1 = medicationMock({});
        const { getAllByTestId } = render(<Medications />, {
          initialState: {
            medication: medicationSliceMock([med1]),
          },
        });
        expect(getAllByTestId('medication-details-button')).toHaveLength(1);
      });
    });
  });
});
