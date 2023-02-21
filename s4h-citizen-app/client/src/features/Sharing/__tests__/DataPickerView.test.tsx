import React from 'react';
import { cleanup, render, waitFor, within } from '../../../utils/test-utils';
import { documentsViewerMock } from '../../DocumentsViewer/mocks';
import { medicalHistorySliceMock } from '../../MedicalHistory/mocks';
import {
  allergyBaseMock,
  initialState as createAllergiesIntolerancesMockState,
} from '../../Summary/AllergiesIntolerances/mocks';
import { conditionMock, conditionsSliceMock } from '../../Summary/Conditions/mocks';
import DataPickerView from '../DataPickerView';
import { sharingHealthDataIdsMock, sharingMock } from '../mocks';
import { ShareableFeatures } from '../reduxSlice';

afterEach(cleanup);

describe('DataPickerView', () => {
  describe('Rendering', () => {
    it('displays the available health data groups', async () => {
      const { getByTestId, queryByText } = render(<DataPickerView />, {
        initialState: {
          documentsViewer: documentsViewerMock,
        },
      });
      expect(getByTestId('datapickerview-healthdata-list')).toBeInTheDocument();
      expect(
        getByTestId('datapickerview-healthdata-list').getElementsByTagName('li')
      ).toHaveLength(2);

      await waitFor(() => {
        expect(queryByText(ShareableFeatures.SUMMARY)).not.toBeInTheDocument();
      });
    });
    it('displays the available medical history', async () => {
      const { getByTestId, queryByText } = render(<DataPickerView />, {
        initialState: {
          medicalHistory: medicalHistorySliceMock,
        },
      });
      expect(getByTestId('datapickerview-medical-history-list')).toBeInTheDocument();
      await waitFor(() => {
        expect(queryByText(ShareableFeatures.DOCUMENTS)).not.toBeInTheDocument();
      });
    });

    it('displays the conditions items', () => {
      const { getByTestId } = render(<DataPickerView />, {
        initialState: {
          conditions: conditionsSliceMock([conditionMock()]),
        },
      });
      expect(getByTestId('datapickerview-conditions-list')).toBeInTheDocument();
    });

    it('displays the allergies and intolerances items', () => {
      const { getByTestId } = render(<DataPickerView />, {
        initialState: {
          allergiesIntolerances:
            createAllergiesIntolerancesMockState(allergyBaseMock),
        },
      });
      expect(
        getByTestId('datapickerview-allergies-intolerances-list')
      ).toBeInTheDocument();
    });

    it('displays the option to select all the groups when there are more than 1 group available', async () => {
      const { getByTestId } = render(<DataPickerView />, {
        initialState: {
          documentsViewer: documentsViewerMock,
        },
      });
      expect(
        within(getByTestId('datapickerview-healthdata-list')).getByTestId(
          'datapickerview-select-all-groups'
        )
      ).toBeInTheDocument();
      expect(getByTestId('datapickerview-select-all-groups')).toBeInTheDocument();
    });
    it('selects the group with corresponding store value', async () => {
      const { getByTestId } = render(<DataPickerView />, {
        initialState: {
          documentsViewer: documentsViewerMock,
          sharing: sharingMock,
        },
      });
      const healthDataCheckboxes = getByTestId(
        'datapickerview-healthdata-list'
      ).getElementsByTagName('d4l-checkbox');
      const checkedCheckbox = Array.from(healthDataCheckboxes).find(checkbox => {
        return checkbox
          .getAttribute('checkbox-id')
          ?.includes(sharingHealthDataIdsMock[0]);
      });
      await waitFor(() => {
        expect(checkedCheckbox?.getAttribute('checked')).toEqual('true');
      });
    });
    it('has the continue button not enabled initially as no items are preselected by default', () => {
      const { getByTestId } = render(<DataPickerView />, {
        initialState: {
          documentsViewer: documentsViewerMock,
        },
      });
      // The button disabled state cannot be directly checked due to the limitation of web components
      // @ts-ignore
      expect(getByTestId('datapickerview-continue-button')?.disabled).toEqual(true);
    });

    it('has the continue button enabled when at least some data is selected to be shared', () => {
      const { getByTestId } = render(<DataPickerView />, {
        initialState: {
          documentsViewer: documentsViewerMock,
          sharing: sharingMock,
        },
      });
      // @ts-ignore
      expect(getByTestId('datapickerview-continue-button')?.disabled).toEqual(false);
    });
  });
});
