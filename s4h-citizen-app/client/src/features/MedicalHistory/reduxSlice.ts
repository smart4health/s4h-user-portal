import { PersonalData } from '@d4l/s4h-fhir-xforms';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AppState } from '../../redux';
import { fetchPatient, savePatient } from '../../services/medicalHistory';
import isEmpty from '../../utils/isEmpty';
interface MedicalHistoryState {
  isEditing: boolean;
  personalData: PersonalData;
  personalDataIds: string[];
}

const initialState: MedicalHistoryState = {
  isEditing: false,
  personalData: {
    firstName: undefined,
    lastName: undefined,
    gender: undefined,
    dateOfBirth: undefined,
    height: undefined,
    weight: undefined,
    bloodGroup: undefined,
    bloodRhesus: undefined,
    occupation: undefined,
  },
  personalDataIds: [],
};

export const getPatient = createAsyncThunk('medicalHistory/getPatient', async () => {
  const response = await fetchPatient();
  return response;
});

export const storePatient = createAsyncThunk(
  'medicalHistory/savePatient',
  savePatient
);

export const selectHasMedicalHistory = (state: AppState): boolean => {
  // TODO: Expand on this selector when more items are added to medical history
  return !isEmpty(state.medicalHistory.personalData);
};

export const selectHasPersonalData = (state: AppState): boolean => {
  return !isEmpty(state.medicalHistory.personalData);
};

export const selectPersonalData = (state: AppState): PersonalData =>
  state.medicalHistory.personalData;

export const selectPersonalDataIds = (state: AppState): string[] =>
  state.medicalHistory.personalDataIds;

export const selectMedicalHistoryIds = (state: AppState): string[] => [
  ...state.medicalHistory.personalDataIds,
];

export const selectIsPatientEmpty = (state: AppState): boolean => {
  const personalData: PersonalData = state.medicalHistory.personalData;
  return Object.values(personalData).every(item => item === undefined);
};

export const selectIsEditingMedicalHistory = (state: AppState): boolean =>
  state.medicalHistory.isEditing;

const medicalHistorySlice = createSlice({
  name: 'medicalHistory',
  initialState,
  reducers: {
    editingForm: (state, action) => {
      state.isEditing = action.payload;
    },
  },
  extraReducers: builder =>
    builder
      .addCase(getPatient.fulfilled, (state, action) => {
        if (action.payload.personalData) {
          state.personalData = action.payload.personalData;
        }
        if (action.payload.inputResourceIds) {
          state.personalDataIds = [...action.payload.inputResourceIds];
        }
      })
      .addCase(getPatient.rejected, (_, action) => {
        console.log(action.error.message);
      })
      .addCase(storePatient.fulfilled, (state, action) => {
        if (action.payload.personalData) {
          state.personalData = action.payload.personalData;
        }
        if (action.payload.inputResourceIds) {
          state.personalDataIds = [...action.payload.inputResourceIds];
        }
      })
      .addCase(storePatient.rejected, (_, action) => {
        console.log(action.error.message);
      }),
});

const { reducer, actions } = medicalHistorySlice;

export const { editingForm } = actions;

export default reducer;
