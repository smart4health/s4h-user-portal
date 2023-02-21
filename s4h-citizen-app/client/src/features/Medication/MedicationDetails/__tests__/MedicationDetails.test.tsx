import { cleanup } from '@testing-library/react';
import React from 'react';
import { render } from '../../../../utils/test-utils';
import MedicationDetails from '../MedicationDetails';
import { createMedicationItemMock, medicationEmptyDescription } from '../mocks';

afterEach(cleanup);

const medicationMock = createMedicationItemMock(1504828800000, Infinity);

const props = {
  id: 'my-id',
  medicationItem: medicationMock,
};

describe('MedicationDetails', () => {
  describe('Rendering', () => {
    it('should return null when there is no medicationItem passed', () => {
      const { container } = render(<MedicationDetails id={props.id} />);
      expect(container.firstChild).toEqual(null);
    });
    it('displays the title', () => {
      const { getAllByTestId } = render(<MedicationDetails {...props} />);
      expect(getAllByTestId('info-section-headline')).toHaveLength(3);
    });
    it('displays the description', () => {
      const { getByTestId } = render(<MedicationDetails {...props} />);
      expect(getByTestId('medication-description')).toHaveTextContent(
        'medication.description.title'
      );
      expect(getByTestId('medication-description-content')).toHaveTextContent(
        'Fluspiral 50 mcg'
      );
    });

    it('displays medication info block with only title available', () => {
      const onlyTitleProps = {
        ...props,
        medicationItem: {
          ...props.medicationItem,
          ingredients: [],
          form: undefined,
        },
      };
      const { queryByText } = render(<MedicationDetails {...onlyTitleProps} />);
      expect(queryByText('medication.content_section.headline')).toBeInTheDocument();
    });
    it('displays medication info block with only form available', () => {
      const onlyFormProps = {
        ...props,
        medicationItem: {
          ...props.medicationItem,
          ingredients: [],
          code: medicationEmptyDescription,
        },
      };
      const { queryByText } = render(<MedicationDetails {...onlyFormProps} />);
      expect(queryByText('medication.content_section.headline')).toBeInTheDocument();
    });
    it('displays medication info block with only ingredients available', () => {
      const onlyTitleProps = {
        ...props,
        medicationItem: {
          ...props.medicationItem,
          code: medicationEmptyDescription,
          form: undefined,
        },
      };
      const { queryByText } = render(<MedicationDetails {...onlyTitleProps} />);
      expect(queryByText('medication.content_section.headline')).toBeInTheDocument();
    });
    it("doesn't displays the medication info block when no information available", () => {
      const noMedicalInfoProps = {
        ...props,
        medicationItem: {
          ...props.medicationItem,
          code: medicationEmptyDescription,
          ingredients: [],
          form: undefined,
        },
      };
      const { queryByText } = render(<MedicationDetails {...noMedicalInfoProps} />);
      expect(
        queryByText('medication.content_section.headline')
      ).not.toBeInTheDocument();
    });

    it("doesn't display the description", () => {
      const emptyDescriptionProps = {
        ...props,
        medicationItem: {
          ...props.medicationItem,
          code: medicationEmptyDescription,
        },
      };

      const { queryByText, queryByTestId } = render(
        <MedicationDetails {...emptyDescriptionProps} />
      );
      expect(queryByText(/medication.description.title/)).not.toBeInTheDocument();
      expect(queryByTestId('medication-description')).toBe(null);
    });
    it('displays the ingredients', () => {
      const { getAllByTestId } = render(<MedicationDetails {...props} />);
      expect(getAllByTestId('medication-ingredients')).toHaveLength(1);
      expect(getAllByTestId('medication-ingredients-content')).toHaveLength(1);
    });
  });

  describe('Functionality', () => {
    it('displays the "from" and "until" dates when the corresponding values are provided in medication', () => {
      const multiDayMedication = createMedicationItemMock(
        1504828800000,
        new Date().getTime()
      );
      const { getByTestId } = render(
        <MedicationDetails id={props.id} medicationItem={multiDayMedication} />
      );
      expect(getByTestId('medication-date-of-intake-from-label')).toHaveTextContent(
        'medication.from_date.title'
      );
      expect(getByTestId('medication-date-of-intake-until-label')).toHaveTextContent(
        'medication.until_date.title'
      );
    });
    it('displays the "from" label when a valid from and an invalid until date is provided in medication', () => {
      const multiDayMedication = createMedicationItemMock(1504828800000, Infinity);
      const { getByTestId, queryByTestId } = render(
        <MedicationDetails id={props.id} medicationItem={multiDayMedication} />
      );
      expect(getByTestId('medication-date-of-intake-from-label')).toHaveTextContent(
        'medication.from_date.title'
      );
      expect(queryByTestId('medication-date-of-intake-until-label')).toBe(null);
    });
    it('displays the "until" label when an invalid from and a valid until date is provided in medication', () => {
      const multiDayMedication = createMedicationItemMock(Infinity, 1504828800000);
      const { getByTestId, queryByTestId } = render(
        <MedicationDetails id={props.id} medicationItem={multiDayMedication} />
      );
      expect(queryByTestId('medication-date-of-intake-from-label')).toBe(null);
      expect(getByTestId('medication-date-of-intake-until-label')).toHaveTextContent(
        'medication.until_date.title'
      );
    });
    it('displays the "On" label when the medication is taken on a specific day', () => {
      const singleDayMedication = createMedicationItemMock(
        new Date().getTime(),
        new Date().getTime()
      );
      const { getByTestId } = render(
        <MedicationDetails id={props.id} medicationItem={singleDayMedication} />
      );
      expect(getByTestId('medication-date-of-intake-on-label')).toHaveTextContent(
        'medication.on_date.title'
      );
    });

    it('displays two concatenated ingredients with a corresponding strength value', () => {
      const singleDayMedication = createMedicationItemMock(
        new Date().getTime(),
        new Date().getTime()
      );
      const { getByTestId } = render(
        <MedicationDetails id={props.id} medicationItem={singleDayMedication} />
      );
      expect(getByTestId('medication-ingredients-content')).toHaveTextContent(
        'Simvastatin (40 mcg/1 tablet); Pravastatin'
      );
    });
  });
});
