import React from 'react';
import { render } from '../../../../utils/test-utils';
import DosageTable from '../DosageTable';

describe('MedicationDosage', () => {
  describe('Rendering', () => {
    const props = {
      basic: [
        {
          title: 'medication.medication_unit.title',
          value: 'milligram',
        },
        {
          title: 'medication.number_of_doses.title',
          value: '40',
        },
      ],
      detailed: [
        {
          title: 'medication.number_of_times.title',
          value: '4',
        },
        {
          title: 'medication.interval.title',
          value: '1',
        },
        {
          title: 'medication.time_unit.title',
          value: 'day',
        },
        {
          title: 'medication.when.title',
          value: 'morning , after meal',
        },
      ],
    };

    it('should render two dosage tabes with basic and detailed information', () => {
      const { getAllByTestId } = render(
        <DosageTable
          basicInformation={props.basic}
          detailedInformation={props.detailed}
        />
      );
      expect(getAllByTestId('dosage-table')).toHaveLength(2);
    });
  });
});
