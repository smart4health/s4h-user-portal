import { MedicationStatement } from '@d4l/s4h-fhir-xforms';
import userEvent, { specialChars } from '@testing-library/user-event';
import { addDays, setHours, setMinutes, setSeconds, subDays } from 'date-fns';
import React, { KeyboardEvent } from 'react';
import {
  formatDate,
  MMMM_DD_YYYY_LONG_DATE_FORMAT,
} from '../../../../utils/dateHelper';
import { render } from '../../../../utils/test-utils';
import MedicationSidebarItem, {
  determineIsCurrent,
  WAITING_PERIOD,
} from '../MedicationSidebarItem';

type Props = {
  medication: MedicationStatement;
  onSelect: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLLIElement>) => void;
  showAsActive: boolean;
  rightColumnId: string;
};

const now = new Date();

const generateProps = (
  fromDate: number,
  untilDate: number,
  hasEmptyDescription: boolean = false
): Props => ({
  onKeyDown: jest.fn(),
  onSelect: jest.fn(),
  showAsActive: true,
  rightColumnId: 'medication-page-tab-panel',
  medication: {
    medicationStatementId: 'medplan-plus-de-med-statement-example-1',
    period: {
      min: fromDate,
      max: untilDate,
    },
    ingredients: [
      {
        ingredient: {
          codeableConcept: {
            coding: [
              {
                system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                code: '36567',
                display: 'Simvastatin',
              },
            ],
          },
          resolvedText: 'Simvastatin',
        },
        strength: '40 mcg/1 tablet',
      },
      {
        ingredient: {
          codeableConcept: {
            coding: [
              {
                system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                code: '36567',
                display: 'Pravastatin',
              },
            ],
          },
          resolvedText: 'Pravastatin',
        },
        strength: '40 mcg/1 tablet',
      },
    ],
    code: {
      codeableConcept: {
        coding: [
          {
            system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
            code: '757704',
            display: 'Simvastatin 40 MG Disintegrating Oral Tablet',
          },
          {
            system: 'http://www.whocc.no/atc',
            code: 'C10AA01',
            display: 'simvastatin',
          },
        ],
        text: hasEmptyDescription ? undefined : 'Fluspiral 50 mcg',
      },
      resolvedText: hasEmptyDescription ? undefined : 'Fluspiral 50 mcg',
    },
    form: {
      codeableConcept: {
        coding: [
          {
            system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
            code: '1294713',
            display: 'Disintegrating Oral Product',
          },
          {
            system: 'http://standardterms.edqm.eu',
            code: '10219000',
            display: 'Tablet',
          },
        ],
      },
      resolvedText: 'Disintegrating Oral Product, Tablet',
    },
    dosages: [
      {
        timing: {
          code: {
            codeableConcept: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v3-TimingEvent',
                  code: 'CV',
                },
              ],
            },
            resolvedText: 'dinner',
          },
        },
      },
    ],
  },
});

describe('determineIsCurrent', () => {
  describe('When both from and to dates are given', () => {
    it('return true if from date it within current day - WAITING_PERIOD', () => {
      const dayOffsetStartDate = WAITING_PERIOD - 2;
      const dayOffsetEndDate = WAITING_PERIOD + 2;
      const fromDate = subDays(now, dayOffsetStartDate);
      const toDate = addDays(now, dayOffsetEndDate);
      const isCurrent = determineIsCurrent(WAITING_PERIOD, fromDate, toDate);
      expect(isCurrent).toBe(true);
    });
    it('return true if from date it within current day + WAITING_PERIOD', () => {
      const dayOffsetStartDate = WAITING_PERIOD - 2;
      const dayOffsetEndDate = WAITING_PERIOD + 2;
      const fromDate = addDays(now, dayOffsetStartDate);
      const toDate = addDays(now, dayOffsetEndDate);
      const isCurrent = determineIsCurrent(WAITING_PERIOD, fromDate, toDate);
      expect(isCurrent).toBe(true);
    });
    it('return true if to date is within current day - WAITING_PERIOD', () => {
      const dayOffsetStartDate = WAITING_PERIOD + 2;
      const dayOffsetEndDate = WAITING_PERIOD - 2;
      const fromDate = subDays(now, dayOffsetStartDate);
      const toDate = addDays(now, dayOffsetEndDate);
      const isCurrent = determineIsCurrent(WAITING_PERIOD, fromDate, toDate);
      expect(isCurrent).toBe(true);
    });
    it('return true if to date is within current day + WAITING_PERIOD', () => {
      const dayOffsetStartDate = WAITING_PERIOD + 2;
      const dayOffsetEndDate = WAITING_PERIOD - 2;
      const fromDate = subDays(now, dayOffsetStartDate);
      const toDate = subDays(now, dayOffsetEndDate);
      const isCurrent = determineIsCurrent(WAITING_PERIOD, fromDate, toDate);
      expect(isCurrent).toBe(true);
    });
    it('return true if from date is before current day - WAITING_PERIOD and to date is after current day + WAITING_PERIOD', () => {
      const dayOffsetStartDate = WAITING_PERIOD + 2;
      const dayOffsetEndDate = WAITING_PERIOD + 2;
      const fromDate = subDays(now, dayOffsetStartDate);
      const toDate = addDays(now, dayOffsetEndDate);
      const isCurrent = determineIsCurrent(WAITING_PERIOD, fromDate, toDate);
      expect(isCurrent).toBe(true);
    });
    it('return false if from and to dates are beyond current day + WAITING_PERIOD', () => {
      const dayOffsetStartDate = WAITING_PERIOD + 2;
      const dayOffsetEndDate = WAITING_PERIOD + 2;
      const fromDate = addDays(now, dayOffsetStartDate);
      const toDate = addDays(now, dayOffsetEndDate);
      const isCurrent = determineIsCurrent(WAITING_PERIOD, fromDate, toDate);
      expect(isCurrent).not.toBe(true);
    });
    it('return false if from and to dates are beyond current day - WAITING_PERIOD', () => {
      const dayOffsetStartDate = WAITING_PERIOD + 2;
      const dayOffsetEndDate = WAITING_PERIOD + 2;
      const fromDate = subDays(now, dayOffsetStartDate);
      const toDate = subDays(now, dayOffsetEndDate);
      const isCurrent = determineIsCurrent(WAITING_PERIOD, fromDate, toDate);
      expect(isCurrent).not.toBe(true);
    });
  });
  describe('When only from date is given', () => {
    it('returns true if from date is before the current day + WAITING_PERIOD', () => {
      const dayOffset = WAITING_PERIOD - 1;
      const fromDate = addDays(now, dayOffset);
      const isCurrent = determineIsCurrent(
        WAITING_PERIOD,
        fromDate,
        new Date(Infinity)
      );
      expect(isCurrent).toBe(true);
    });
    it('returns true if from date is equal to current day + WAITING_PERIOD', () => {
      const dayOffset = WAITING_PERIOD;
      const latestTimeToday = setSeconds(
        setMinutes(setHours(new Date(), 23), 59),
        59
      );
      const fromDate = addDays(latestTimeToday, dayOffset);
      const isCurrent = determineIsCurrent(
        WAITING_PERIOD,
        fromDate,
        new Date(Infinity)
      );
      expect(isCurrent).toBe(true);
    });
    it('returns false if from date is after the current day + WAITING_PERIOD', () => {
      const dayOffset = WAITING_PERIOD + 1;
      const fromDate = addDays(now, dayOffset);
      const isCurrent = determineIsCurrent(
        WAITING_PERIOD,
        fromDate,
        new Date(Infinity)
      );
      expect(isCurrent).not.toBe(true);
    });
  });
  describe('When only to date is given', () => {
    it('returns true if to date is after the current day - WAITING_PERIOD', () => {
      const dayOffset = WAITING_PERIOD - 2;
      const toDate = subDays(now, dayOffset);
      const isCurrent = determineIsCurrent(
        WAITING_PERIOD,
        new Date(Infinity),
        toDate
      );
      expect(isCurrent).toBe(true);
    });
    it('returns true if to is equal to current day - WAITING_PERIOD', () => {
      const earliestTimeToday = setSeconds(
        setMinutes(setHours(new Date(), 0), 0),
        0
      );

      const dayOffset = WAITING_PERIOD;
      const toDate = subDays(earliestTimeToday, dayOffset);

      const isCurrent = determineIsCurrent(
        WAITING_PERIOD,
        new Date(Infinity),
        toDate
      );
      expect(isCurrent).toBe(true);
    });
    it('returns false if to  is before the current day - WAITING_PERIOD', () => {
      const dayOffset = WAITING_PERIOD + 2;
      const toDate = subDays(now, dayOffset);
      const isCurrent = determineIsCurrent(
        WAITING_PERIOD,
        new Date(Infinity),
        toDate
      );
      expect(isCurrent).not.toBe(true);
    });
  });
  describe('When no from and until dates are given', () => {
    it('returns true', () => {
      const isCurrent = determineIsCurrent(
        WAITING_PERIOD,
        new Date(Infinity),
        new Date(Infinity)
      );
      expect(isCurrent).toBe(true);
    });
  });
});

describe('MedicationSidebarItem', () => {
  it('renders the unidentified medication message', () => {
    const fromDate = 1491609600000;
    const untilDate = Infinity;

    const props = generateProps(fromDate, untilDate, true);

    const { getByText } = render(<MedicationSidebarItem {...props} />);

    expect(getByText(/medication.description.infotext/)).toBeInTheDocument();
  });
  it('renders the from label if medication has only from date', () => {
    const fromDate = 1491609600000;
    const untilDate = Infinity;

    const props = generateProps(fromDate, untilDate);

    const { getByText } = render(<MedicationSidebarItem {...props} />);

    expect(getByText(/medication.from_date.title/)).toBeInTheDocument();
  });

  it('renders the until label if medication only has until date', () => {
    const fromDate = Infinity;
    const untilDate = 1491609600000;

    const props = generateProps(fromDate, untilDate);

    const { getByText } = render(<MedicationSidebarItem {...props} />);

    expect(getByText(/medication.until_date.title/)).toBeInTheDocument();
  });

  it('should return from and until label if fromDate and untilDate are given', () => {
    const fromDate = 149160300023;
    const untilDate = 1491609600000;

    const props = generateProps(fromDate, untilDate);

    const { queryByText } = render(<MedicationSidebarItem {...props} />);
    const formattedFromDate = formatDate(
      new Date(fromDate),
      MMMM_DD_YYYY_LONG_DATE_FORMAT,
      'en'
    );

    expect(queryByText(formattedFromDate)).toBeDefined();
    expect(queryByText(/medication.on_date.title/)).not.toBeInTheDocument();
    expect(queryByText(/medication.from_date.title/)).toBeInTheDocument();
    expect(queryByText(/medication.until_date.title/)).toBeInTheDocument();
  });

  it('should return the null if fromDate and untilDate are not given', () => {
    const fromDate = Infinity;
    const untilDate = Infinity;
    const props = generateProps(fromDate, untilDate);
    const { queryByText } = render(<MedicationSidebarItem {...props} />);

    expect(queryByText(/medication.from_date.title/)).not.toBeInTheDocument();
    expect(queryByText(/medication.on_date.title/)).not.toBeInTheDocument();
    expect(queryByText(/medication.until_date.title/)).not.toBeInTheDocument();
  });
  it('should return the "On" label if from date and until date are equal', () => {
    const fromDate = 1491609600023;
    const untilDate = 1491609600023;

    const props = generateProps(fromDate, untilDate);

    const { getByText } = render(<MedicationSidebarItem {...props} />);

    expect(getByText(/medication.on_date.title/)).toBeInTheDocument();
  });
  describe('Accessibility', () => {
    it('allows selection using enter key', () => {
      const fromDate = 1491609600000;
      const untilDate = Infinity;

      const props = generateProps(fromDate, untilDate);

      const { getByRole } = render(<MedicationSidebarItem {...props} />);
      userEvent.type(getByRole('tab'), specialChars.enter);
      expect(props.onSelect).toHaveBeenCalled();
    });
    it('allows selection using spacebar', () => {
      const fromDate = 1491609600000;
      const untilDate = Infinity;

      const props = generateProps(fromDate, untilDate);

      const { getByRole } = render(<MedicationSidebarItem {...props} />);
      userEvent.type(getByRole('tab'), specialChars.space);
      expect(props.onSelect).toHaveBeenCalled();
    });

    it('allows selection using click', () => {
      const fromDate = 1491609600000;
      const untilDate = Infinity;

      const props = generateProps(fromDate, untilDate);

      const { getByRole } = render(<MedicationSidebarItem {...props} />);
      userEvent.click(getByRole('tab'));
      expect(props.onSelect).toHaveBeenCalled();
    });

    it('executes onKeyDown prop on a key down event', () => {
      const fromDate = 1491609600000;
      const untilDate = Infinity;

      const props = generateProps(fromDate, untilDate);

      const { getByRole } = render(<MedicationSidebarItem {...props} />);
      userEvent.type(getByRole('tab'), specialChars.space);
      expect(props.onKeyDown).toHaveBeenCalled();
    });

    it('has the right aria-control set', () => {
      const fromDate = 1491609600000;
      const untilDate = Infinity;

      const props = generateProps(fromDate, untilDate);

      const { getByRole } = render(
        <MedicationSidebarItem {...props} rightColumnId="test-id" />
      );
      expect(getByRole('tab').getAttribute('aria-controls')).toEqual('test-id');
    });

    it('has the right tab index based on if the item is active', () => {
      const fromDate = 1491609600000;
      const untilDate = Infinity;

      const props = generateProps(fromDate, untilDate);

      const { getByRole } = render(
        <MedicationSidebarItem {...props} showAsActive />
      );
      expect(getByRole('tab').getAttribute('tabindex')).toEqual('0');
    });

    it('has the right tab index based on if the item is active', () => {
      const fromDate = 1491609600000;
      const untilDate = Infinity;

      const props = generateProps(fromDate, untilDate);

      const { getByRole } = render(
        <MedicationSidebarItem {...props} showAsActive />
      );
      expect(getByRole('tab').getAttribute('aria-selected')).toEqual('true');
    });
  });
});
