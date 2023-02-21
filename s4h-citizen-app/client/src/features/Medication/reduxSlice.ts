import D4LSDK from '@d4l/js-sdk';
import { MedicationStatement } from '@d4l/s4h-fhir-xforms';
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';
import { addMinutes, isValid } from 'date-fns';
import { AppState } from '../../redux';
import {
  deleteMedication,
  deleteMedications,
  DeleteMedicationsResult,
  fetchMedications,
  fetchResource,
} from '../../services/medications';
import { FileZipItem, JSONZipItem, ZipData } from '../../services/types';
import { actions as waterfallGlobalActions } from '../../store';
import {
  formatDate,
  getMedicationDateFormattingByLanguage,
} from '../../utils/dateHelper';
import {
  determineIsCurrent,
  WAITING_PERIOD,
} from './MedicationSidebarItem/MedicationSidebarItem';

const adapters = {
  medications: createEntityAdapter<MedicationStatement>({
    selectId: medication => medication.medicationStatementId,
  }),
};

export interface MedicationState {
  isLoading: boolean;
  medications: EntityState<MedicationStatement>;
  activeMedicationId?: string;
  downloadableResources: D4LSDK.Record[];
}

const initialState: MedicationState = {
  isLoading: true,
  medications: adapters.medications.getInitialState(),
  activeMedicationId: undefined,
  downloadableResources: [],
};

export const getMedications = createAsyncThunk(
  'medication/getMedications',
  async (language: string) => {
    const response = await fetchMedications(language);
    return response;
  }
);

export const deleteMedicationResource = createAsyncThunk(
  'medication/deleteMedication',
  async ({
    medicationId,
    medications,
  }: {
    medicationId: string;
    medications: MedicationStatement[];
  }) => await deleteMedication(medicationId, medications)
);

export const deleteMedicationResources = createAsyncThunk(
  'medication/deleteMedications',
  async ({
    medicationStatementIds,
    allMedicationStatements,
  }: {
    medicationStatementIds: string[];
    allMedicationStatements: MedicationStatement[];
  }) => await deleteMedications(medicationStatementIds, allMedicationStatements)
);

export const getResource = createAsyncThunk(
  'medication/getResource',
  async (medicationId: string) => {
    const response = await fetchResource(medicationId);
    return response;
  }
);

const medicationSlice = createSlice({
  name: 'medication',
  initialState,
  reducers: {
    cleanupDownloadableMedication: state => {
      state.downloadableResources = [];
    },
    setActiveMedication: (state, action: PayloadAction<string | undefined>) => {
      state.activeMedicationId = action.payload;
    },
  },
  extraReducers: builder =>
    builder
      .addCase(getMedications.pending, state => {
        state.isLoading = true;
      })
      .addCase(
        getMedications.fulfilled,
        (state, action: PayloadAction<MedicationStatement[]>) => {
          adapters.medications.setAll(state.medications, action.payload);
          state.isLoading = false;
        }
      )
      .addCase(getMedications.rejected, state => {
        state.isLoading = false;
      })
      .addCase(getResource.fulfilled, (state, action) => {
        state.downloadableResources = [
          ...state.downloadableResources,
          action.payload,
        ];
      })
      .addCase(getResource.rejected, state => {
        state.downloadableResources = [];
      })
      .addCase(
        deleteMedicationResource.fulfilled,
        (state, action: PayloadAction<string>) => {
          const deletedMedicationId = action.payload;
          adapters.medications.removeOne(state.medications, deletedMedicationId);
          state.activeMedicationId = undefined;
        }
      )
      .addCase(deleteMedicationResource.rejected, (_, action) => {
        console.log(action.error.message);
        waterfallGlobalActions.setNotification(action.error.message, 'error');
      })
      .addCase(
        deleteMedicationResources.fulfilled,
        (state, action: PayloadAction<DeleteMedicationsResult>) => {
          const { deletedMedicationStatementIds, hasErrored } = action.payload;
          adapters.medications.removeMany(
            state.medications,
            deletedMedicationStatementIds
          );

          if (hasErrored) {
            waterfallGlobalActions.setNotification(
              'delete_medications_error.message',
              'error'
            );
          }
        }
      ),
});

export const {
  selectById: selectMedicationById,
  selectIds: selectMedicationIds,
  selectEntities: selectMedicationEntities,
  selectAll: selectAllMedications,
  selectTotal: selectTotalMedications,
} = adapters.medications.getSelectors(
  (state: AppState) => state.medication.medications
);

export const selectIsLoading = (state: AppState): boolean =>
  state.medication.isLoading;

export const selectActiveMedicationId = (state: AppState): string | undefined =>
  state.medication.activeMedicationId;

export const selectActiveMedicationItem = (
  state: AppState
): MedicationStatement | undefined => {
  if (state.medication.activeMedicationId) {
    return selectMedicationById(state, state.medication.activeMedicationId);
  }
  return undefined;
};

// In a Medication UI model, id representes the MedicationStatement resource Id and
// medicationId represents the Medication resource id.
// Here we return only the MedicationStatement id
export const selectAllMedicationIds = (state: AppState): string[] => {
  const medications = selectAllMedications(state);
  const medicationResourceIds: string[] = medications.map(medication => {
    return medication.medicationStatementId;
  });

  return medicationResourceIds;
};

export const selectHasMedications = (state: AppState): boolean => {
  const medicationsCount = selectTotalMedications(state);
  return !!medicationsCount;
};

export const selectIsMedicationsEmpty = (state: AppState): boolean => {
  const medicationsCount = selectTotalMedications(state);
  return medicationsCount === 0;
};

export const selectCurrentMedications = (state: AppState): MedicationStatement[] => {
  const medications = selectAllMedications(state);
  return medications.filter(medication => {
    const { min, max } = medication.period;
    const fromDate = addMinutes(new Date(min), new Date(min).getTimezoneOffset());
    const untilDate = addMinutes(new Date(max), new Date(max).getTimezoneOffset());

    const isCurrent = determineIsCurrent(WAITING_PERIOD, fromDate, untilDate);

    return isCurrent;
  });
};

export const selectCurrentMedicationsIds = (state: AppState) =>
  selectCurrentMedications(state).map(
    medication => medication.medicationStatementId
  );

export const selectDownloadableMedication = (
  state: AppState,
  medication: MedicationStatement,
  language: string = 'en'
): ZipData => {
  const itemsByFilename: {
    [filename: string]: FileZipItem | JSONZipItem;
  } = {};

  const downloadableResources = selectDownloadableMedicationResources(state);

  const medicationName = medication?.code.resolvedText || 'medication';

  itemsByFilename[medicationName] = {
    type: 'JSON',
    filename: `${medicationName}.json`,
    data: downloadableResources.map(resource => resource.fhirResource),
  };

  const { min, max } = medication.period;
  const fromDate = addMinutes(new Date(min), new Date(min).getTimezoneOffset());
  const untilDate = addMinutes(new Date(max), new Date(max).getTimezoneOffset());

  const formattedFromDate = isValid(fromDate)
    ? formatDate(fromDate, getMedicationDateFormattingByLanguage(language), language)
    : undefined;

  const formattedUntilDate = isValid(untilDate)
    ? formatDate(
        untilDate,
        getMedicationDateFormattingByLanguage(language),
        language
      )
    : undefined;

  const dateString = formattedFromDate ?? formattedUntilDate;

  return {
    filename: `${medicationName} ${dateString}`.trim(),
    items: downloadableResources.length > 0 ? Object.values(itemsByFilename) : [],
  };
};

export const selectIsCurrentMedicationsEmpty = (state: AppState): boolean => {
  const currentMedications = selectCurrentMedications(state);
  return currentMedications.length === 0;
};

export const selectHasCurrentMedications = (state: AppState): boolean =>
  !selectIsCurrentMedicationsEmpty(state);

export const selectDownloadableMedicationResources = (
  state: AppState
): D4LSDK.Record[] => {
  return state.medication.downloadableResources;
};

const { actions } = medicationSlice;

export const { setActiveMedication, cleanupDownloadableMedication } = actions;

export default medicationSlice.reducer;
