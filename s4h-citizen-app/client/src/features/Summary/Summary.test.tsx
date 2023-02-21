import { PersonalData } from '@d4l/s4h-fhir-xforms';
import React from 'react';
import { ViewportSize } from '../../redux/globalsSlice';
import * as allergiesIntolerancesService from '../../services/allergiesIntolerances';
import * as conditionsService from '../../services/conditions';
import * as medicalHistoryService from '../../services/medicalHistory';
import * as medicationsService from '../../services/medications';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '../../utils/test-utils';
import { inputResourceIdsMock, personalDataMock } from '../MedicalHistory/mocks';
import { allergyBaseMock } from './AllergiesIntolerances/mocks';
import { conditionMock } from './Conditions/mocks';
import { medicationMock } from './Medications/mocks';
import Summary from './Summary';

function addMedications() {
  jest
    .spyOn(medicationsService, 'fetchMedications')
    .mockImplementation(() => Promise.resolve([medicationMock({})]));
}

function addPersonalData() {
  jest.spyOn(medicalHistoryService, 'fetchPatient').mockImplementation(() =>
    Promise.resolve({
      issues: [],
      personalData: personalDataMock as PersonalData,
      inputResourceIds: inputResourceIdsMock,
    })
  );
}

function addAllergiesIntolerances() {
  jest
    .spyOn(allergiesIntolerancesService, 'getAllergiesIntolerances')
    .mockImplementation(() => Promise.resolve([allergyBaseMock]));
}

function addConditions() {
  jest
    .spyOn(conditionsService, 'getConditions')
    .mockImplementation(() =>
      Promise.resolve([conditionMock('active'), conditionMock('inactive')])
    );
}

describe('Summary', () => {
  beforeEach(() => {
    jest.spyOn(medicalHistoryService, 'fetchPatient').mockImplementation(() =>
      Promise.resolve({
        issues: [],
        personalData: {},
        inputResourceIds: [],
      })
    );

    jest
      .spyOn(medicationsService, 'fetchMedications')
      .mockImplementation(() => Promise.resolve([]));

    jest
      .spyOn(allergiesIntolerancesService, 'getAllergiesIntolerances')
      .mockImplementation(() => Promise.resolve([]));

    jest
      .spyOn(conditionsService, 'getConditions')
      .mockImplementation(() => Promise.resolve([]));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('loading spinner', () => {
    it('is displayed till the api calls are completed', async () => {
      render(<Summary />);
      expect(screen.getByTestId('summary-spinner')).toBeInTheDocument();
      await waitFor(() => {
        expect(
          screen.queryByTestId('summary-notification-bar')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('notification bar', () => {
    describe('while in sharing mode', () => {
      it('is not displayed even when data other than personal data is given', async () => {
        addMedications();

        const initialState = {
          globals: {
            isSharingMode: true,
          },
        };

        render(<Summary />, { initialState });

        // wait until the loading spinner is gone
        await waitForElementToBeRemoved(() =>
          screen.queryByTestId('summary-spinner')
        );

        expect(
          screen.queryByTestId('summary-notification-bar')
        ).not.toBeInTheDocument();
      });
    });

    describe('while not in sharing mode', () => {
      it('is not displayed when no data is given', async () => {
        render(<Summary />);

        // wait until the loading spinner is gone
        await waitForElementToBeRemoved(() =>
          screen.queryByTestId('summary-spinner')
        );

        await waitFor(() => {
          expect(
            screen.queryByTestId('summary-notification-bar')
          ).not.toBeInTheDocument();
        });
      });

      it('is not displayed when only personal data is given', async () => {
        addPersonalData();

        render(<Summary />);

        // wait until the loading spinner is gone
        await waitForElementToBeRemoved(() =>
          screen.queryByTestId('summary-spinner')
        );

        await waitFor(() => {
          expect(
            screen.queryByTestId('summary-notification-bar')
          ).not.toBeInTheDocument();
        });
      });

      it('is displayed when any data other than personal data is given', async () => {
        addMedications();

        render(<Summary />);

        await waitFor(() => {
          expect(
            screen.queryByTestId('summary-notification-bar')
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe('card rendering when no data is given at all', () => {
    describe('while in sharing mode', () => {
      it('does not render any of the cards', async () => {
        render(<Summary />, {
          initialState: { globals: { isSharingMode: true } },
        });

        // wait until the loading spinner is gone
        await waitForElementToBeRemoved(() =>
          screen.queryByTestId('summary-spinner')
        );

        // expect nothing to rendered...
        expect(screen.queryByTestId('personal-data-form')).not.toBeInTheDocument();

        expect(
          screen.queryByText('medical-history-empty-state.svg')
        ).not.toBeInTheDocument();

        expect(
          screen.queryByTestId('medications-summary-card')
        ).not.toBeInTheDocument();

        expect(
          screen.queryByTestId('allergies-and-intolerances-summary-card')
        ).not.toBeInTheDocument();

        expect(
          screen.queryByTestId('conditions-summary-card')
        ).not.toBeInTheDocument();
      });
    });

    describe('while not in sharing mode', () => {
      it('renders the personal data empty state card', async () => {
        render(<Summary />, { initialState: { globals: { isSharingMode: false } } });

        await waitFor(() => {
          expect(
            screen.queryByText('medical-history-empty-state.svg')
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe('card rendering', () => {
    it('renders personal data if available', async () => {
      addPersonalData();

      render(<Summary />);

      await waitFor(() => {
        expect(screen.queryByTestId('personal-data-form')).toBeInTheDocument();
      });
    });

    it('renders medications if available', async () => {
      addMedications();

      render(<Summary />);

      await waitFor(() => {
        expect(screen.queryByTestId('medications-summary-card')).toBeInTheDocument();
      });
    });

    it('renders allergies & intolerances if available', async () => {
      addAllergiesIntolerances();

      render(<Summary />);

      await waitFor(() => {
        expect(
          screen.queryByTestId('allergies-intolerances-summary-card')
        ).toBeInTheDocument();
      });
    });

    it('renders conditions if available', async () => {
      addConditions();

      render(<Summary />);

      await waitFor(() => {
        expect(screen.queryByTestId('conditions-summary-card')).toBeInTheDocument();
      });
    });

    it('does not render the right column if there is no data other than personal and medications', async () => {
      addPersonalData();
      addMedications();

      render(<Summary />);
      await waitForElementToBeRemoved(() => screen.queryByTestId('summary-spinner'));
      expect(screen.queryByTestId('summary-right-column')).not.toBeInTheDocument();
    });

    describe('while not in sharing mode', () => {
      it('renders the personal data empty state card, when personal data is empty but other data is given', async () => {
        addMedications();

        render(<Summary />);

        await waitFor(() => {
          expect(
            screen.queryByTestId('medications-summary-card')
          ).toBeInTheDocument();
          expect(
            screen.queryByText('medical-history-empty-state.svg')
          ).toBeInTheDocument();
        });
      });

      it('renders the more options menu button for every card displayed', async () => {
        addPersonalData();
        addMedications();
        addAllergiesIntolerances();
        addConditions();

        render(<Summary />);

        // wait until the loading spinner is gone
        await waitForElementToBeRemoved(() =>
          screen.queryByTestId('summary-spinner')
        );

        expect(
          screen.queryByTestId('personal-data-more-options-menu-button')
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId('medications-more-options-menu-button')
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId('allergies-intolerances-more-options-menu-button')
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId('conditions-more-options-menu-button')
        ).toBeInTheDocument();
      });
    });

    describe('while in sharing mode', () => {
      it('does not render the personal data empty state card, when personal data is empty but other data is given', async () => {
        addMedications();

        render(<Summary />, {
          initialState: { globals: { isSharingMode: true } },
        });

        await waitFor(() => {
          expect(
            screen.queryByTestId('medications-summary-card')
          ).toBeInTheDocument();
          expect(
            screen.queryByText('medical-history-empty-state.svg')
          ).not.toBeInTheDocument();
        });
      });

      it('does not render the more options menu button for any card displayed', async () => {
        addPersonalData();
        addMedications();
        addAllergiesIntolerances();
        addConditions();

        render(<Summary />, {
          initialState: { globals: { isSharingMode: true } },
        });

        // wait until the loading spinner is gone
        await waitForElementToBeRemoved(() =>
          screen.queryByTestId('summary-spinner')
        );

        expect(
          screen.queryByTestId('personal-data-more-options-menu-button')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('medications-more-options-menu-button')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('allergies-intolerances-more-options-menu-button')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('conditions-more-options-menu-button')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('table of contents', () => {
    describe('while in narrow viewport', () => {
      describe('and not in sharing mode', () => {
        it('does render, even if there is no data given', async () => {
          render(<Summary />, {
            initialState: {
              globals: { viewportSize: ViewportSize.NARROW, isSharingMode: false },
            },
          });

          // wait until the loading spinner is gone
          await waitForElementToBeRemoved(() =>
            screen.queryByTestId('summary-spinner')
          );

          // expect nothing to rendered...
          expect(
            screen.queryByTestId('summary-table-of-content')
          ).toBeInTheDocument();
        });

        it('does render if there is only personal data given', async () => {
          addPersonalData();
          render(<Summary />, {
            initialState: {
              globals: { viewportSize: ViewportSize.NARROW, isSharingMode: false },
            },
          });

          // wait until the loading spinner is gone
          await waitForElementToBeRemoved(() =>
            screen.queryByTestId('summary-spinner')
          );

          expect(
            screen.queryByTestId('summary-table-of-content')
          ).toBeInTheDocument();
        });

        it('renders if there is at least one category other than personal data given', async () => {
          // add only medications
          addMedications();

          render(<Summary />, {
            initialState: {
              globals: { viewportSize: ViewportSize.NARROW, isSharingMode: false },
            },
          });

          // wait until the loading spinner is gone
          await waitForElementToBeRemoved(() =>
            screen.queryByTestId('summary-spinner')
          );

          expect(
            screen.queryByTestId('summary-table-of-content')
          ).toBeInTheDocument();
        });
      });

      describe('and in sharing mode', () => {
        it('does not render if there is no data given', async () => {
          render(<Summary />, {
            initialState: {
              globals: { viewportSize: ViewportSize.NARROW, isSharingMode: true },
            },
          });

          // wait until the loading spinner is gone
          await waitForElementToBeRemoved(() =>
            screen.queryByTestId('summary-spinner')
          );

          // expect nothing to rendered...
          expect(
            screen.queryByTestId('summary-table-of-content')
          ).not.toBeInTheDocument();
        });

        it('does not render if there is only personal data given', async () => {
          addPersonalData();

          render(<Summary />, {
            initialState: {
              globals: { viewportSize: ViewportSize.NARROW, isSharingMode: true },
            },
          });

          // wait until the loading spinner is gone
          await waitForElementToBeRemoved(() =>
            screen.queryByTestId('summary-spinner')
          );

          expect(
            screen.queryByTestId('summary-table-of-content')
          ).not.toBeInTheDocument();
        });

        it('does not render if only medications data is given', async () => {
          addMedications();

          render(<Summary />, {
            initialState: {
              globals: { viewportSize: ViewportSize.NARROW, isSharingMode: true },
            },
          });

          // wait until the loading spinner is gone
          await waitForElementToBeRemoved(() =>
            screen.queryByTestId('summary-spinner')
          );

          expect(
            screen.queryByTestId('summary-table-of-content')
          ).not.toBeInTheDocument();
        });

        it('does not render if only a&i data is given', async () => {
          addAllergiesIntolerances();

          render(<Summary />, {
            initialState: {
              globals: { viewportSize: ViewportSize.NARROW, isSharingMode: true },
            },
          });

          // wait until the loading spinner is gone
          await waitForElementToBeRemoved(() =>
            screen.queryByTestId('summary-spinner')
          );

          expect(
            screen.queryByTestId('summary-table-of-content')
          ).not.toBeInTheDocument();
        });

        it('does not render if only conditions data is given', async () => {
          addConditions();

          render(<Summary />, {
            initialState: {
              globals: { viewportSize: ViewportSize.NARROW, isSharingMode: true },
            },
          });

          // wait until the loading spinner is gone
          await waitForElementToBeRemoved(() =>
            screen.queryByTestId('summary-spinner')
          );

          expect(
            screen.queryByTestId('summary-table-of-content')
          ).not.toBeInTheDocument();
        });

        it('renders if there is personal data and at least one other data category given', async () => {
          addPersonalData();
          addConditions();

          render(<Summary />, {
            initialState: {
              globals: { viewportSize: ViewportSize.NARROW, isSharingMode: true },
            },
          });

          // wait until the loading spinner is gone
          await waitForElementToBeRemoved(() =>
            screen.queryByTestId('summary-spinner')
          );

          expect(
            screen.queryByTestId('summary-table-of-content')
          ).toBeInTheDocument();
        });

        it('renders if there is no personal data but at least two data categories given', async () => {
          addAllergiesIntolerances();
          addConditions();

          render(<Summary />, {
            initialState: {
              globals: { viewportSize: ViewportSize.NARROW, isSharingMode: true },
            },
          });

          // wait until the loading spinner is gone
          await waitForElementToBeRemoved(() =>
            screen.queryByTestId('summary-spinner')
          );

          expect(
            screen.queryByTestId('summary-table-of-content')
          ).toBeInTheDocument();
        });
      });
    });

    describe('while not in narrow viewport', () => {
      describe('and not in sharing mode', () => {
        it('does not render even if all data categories are given', async () => {
          addPersonalData();
          addMedications();
          addAllergiesIntolerances();
          addConditions();

          render(<Summary />, {
            initialState: {
              globals: { viewportSize: ViewportSize.WIDE, isSharingMode: false },
            },
          });

          // wait until the loading spinner is gone
          await waitForElementToBeRemoved(() =>
            screen.queryByTestId('summary-spinner')
          );

          expect(
            screen.queryByTestId('summary-table-of-content')
          ).not.toBeInTheDocument();
        });
      });
      describe('and in sharing mode', () => {
        it('does not render even if all data categories are given', async () => {
          addPersonalData();
          addMedications();
          addAllergiesIntolerances();
          addConditions();

          render(<Summary />, {
            initialState: {
              globals: { viewportSize: ViewportSize.WIDE, isSharingMode: true },
            },
          });

          // wait until the loading spinner is gone
          await waitForElementToBeRemoved(() =>
            screen.queryByTestId('summary-spinner')
          );

          expect(
            screen.queryByTestId('summary-table-of-content')
          ).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('share bar', () => {
    describe('while not in narrow viewport', () => {
      describe('and not in sharing mode', () => {
        it('is rendered without a button, if no summary data is given', async () => {
          render(<Summary />, {
            initialState: {
              globals: { viewportSize: ViewportSize.MEDIUM, isSharingMode: false },
            },
          });

          // wait until the loading spinner is gone
          await waitForElementToBeRemoved(() =>
            screen.queryByTestId('summary-spinner')
          );

          expect(screen.queryByTestId('summary-share-bar')).toBeInTheDocument();
          expect(
            screen.queryByTestId('summary-share-bar-button')
          ).not.toBeInTheDocument();
        });
      });

      describe('and in sharing mode', () => {
        it('does not render at all, even if summary data is given', async () => {
          addPersonalData();

          render(<Summary />, {
            initialState: {
              globals: { viewportSize: ViewportSize.MEDIUM, isSharingMode: true },
            },
          });

          // wait until the loading spinner is gone
          await waitForElementToBeRemoved(() =>
            screen.queryByTestId('summary-spinner')
          );

          expect(screen.queryByTestId('summary-share-bar')).not.toBeInTheDocument();
        });
      });
    });

    describe('while in narrow viewport', () => {
      describe('and not in sharing mode', () => {
        it('is not rendered in its "banner form", even if summary data is given', async () => {
          addPersonalData();

          render(<Summary />, {
            initialState: {
              globals: { viewportSize: ViewportSize.NARROW, isSharingMode: false },
            },
          });

          // wait until the loading spinner is gone
          await waitForElementToBeRemoved(() =>
            screen.queryByTestId('summary-spinner')
          );

          expect(screen.queryByTestId('summary-share-bar')).not.toBeInTheDocument();
        });

        it('is rendered in the "table of contents form" without the share button, if no summary data is given', async () => {
          render(<Summary />, {
            initialState: {
              globals: { viewportSize: ViewportSize.NARROW, isSharingMode: false },
            },
          });

          // wait until the loading spinner is gone
          await waitForElementToBeRemoved(() =>
            screen.queryByTestId('summary-spinner')
          );

          expect(
            screen.queryByTestId('summary-toc-share-header')
          ).toBeInTheDocument();

          expect(
            screen.queryByTestId('summary-toc-share-header-button')
          ).not.toBeInTheDocument();
        });

        it('is rendered in the "table of contents form" with the share button if enough summary data is given', async () => {
          addPersonalData();
          addMedications();

          render(<Summary />, {
            initialState: {
              globals: { viewportSize: ViewportSize.NARROW, isSharingMode: false },
            },
          });

          // wait until the loading spinner is gone
          await waitForElementToBeRemoved(() =>
            screen.queryByTestId('summary-spinner')
          );

          expect(
            screen.queryByTestId('summary-toc-share-header')
          ).toBeInTheDocument();

          expect(
            screen.queryByTestId('summary-toc-share-header-button')
          ).toBeInTheDocument();
        });
      });

      describe('and in sharing mode', () => {
        it('does not render at all, even if enough summary data is given', async () => {
          addPersonalData();
          addMedications();

          render(<Summary />, {
            initialState: {
              globals: { viewportSize: ViewportSize.NARROW, isSharingMode: true },
            },
          });

          // wait until the loading spinner is gone
          await waitForElementToBeRemoved(() =>
            screen.queryByTestId('summary-spinner')
          );

          expect(screen.queryByTestId('summary-share-bar')).not.toBeInTheDocument();

          expect(
            screen.queryByTestId('summary-toc-share-header')
          ).not.toBeInTheDocument();
        });
      });
    });
  });
});
