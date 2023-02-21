import React from 'react';
import { fixedFlags } from '../../../config/flags';
import { render, waitFor } from '../../../utils/test-utils';
import { documentsViewerMock } from '../../DocumentsViewer/mocks';
import { medicalHistorySliceMock } from '../../MedicalHistory/mocks';
import {
  initialState,
  allergyBaseMock,
} from '../../Summary/AllergiesIntolerances/mocks';
import { conditionMock, conditionsSliceMock } from '../../Summary/Conditions/mocks';
import {
  medicationMock,
  medicationSliceMock,
} from '../../Summary/Medications/mocks';
import Dashboard from '../Dashboard';

describe('Dashboard', () => {
  it('displays the data ingestion tile', async () => {
    const { getByTestId } = render(<Dashboard />, {
      initialState: {
        allergiesIntolerances: initialState(allergyBaseMock),
        documentsViewer: documentsViewerMock,
        medicalHistory: medicalHistorySliceMock,
        conditions: conditionsSliceMock([conditionMock()]),
        medication: medicationSliceMock([medicationMock({})]),
      },
      extendedWaterfallState: {
        flags: {
          ...fixedFlags,
          medication: false,
          eid: false,
          data_donation: false,
        },
        appInitialized: true,
      },
    });
    await waitFor(() => {
      expect(getByTestId('dataIngestionButton')).toBeInTheDocument();
    });
  });
});
