import {
  createAsyncThunk,
  createSlice,
  EntityId,
  PayloadAction,
} from '@reduxjs/toolkit';
import { featureNames } from '../../config/flags';
import { AppState } from '../../redux';
import * as shareService from '../../services/share';
import { DocumentSharePinResponseData } from '../../services/types';
import {
  actions as waterfallGlobalActions,
  getState as waterfallGlobalState,
} from '../../store';
import { IApplication, RootState } from '../../types';
import { pushTrackingEvent, TRACKING_EVENTS } from '../../utils/analytics';
import isNetworkError from '../../utils/isNetworkError';
import { selectHasHealthData } from '../DocumentsViewer/reduxSlice';
import { selectHasMedicalHistory } from '../MedicalHistory/reduxSlice';
import {
  selectAllMedications,
  selectHasMedications,
} from '../Medication/reduxSlice';
import { selectIsAllergiesIntolerancesEmpty } from '../Summary/AllergiesIntolerances/reduxSlice';
import { selectIsConditionsEmpty } from '../Summary/Conditions/reduxSlice';
import { revokeApplicationAccess } from './handshakeConnectionsSlice';

export enum ShareableFeatures {
  DOCUMENTS = 'documents',
  MEDICATION = 'medication',
  SUMMARY = 'sharing.summary.title',
  ALLERGIES_INTOLERANCES = 'allergiesIntolerances',
  CONDITIONS = 'conditions',
}

export enum ShareSteps {
  SESSION = 'SESSION',
  EMPTY = 'EMPTY',
  PICKER = 'PICKER',
  PIN = 'PIN',
}

export type UpdateSharingDataAction = {
  ids: EntityId[];
  type: ShareableFeatures;
};

interface DocumentSharingState {
  pin: string;
  activeView: ShareSteps;
  sharingHealthDataIds: EntityId[];
  sharingMedicalHistoryIds: EntityId[];
  sharingMedicationStatementIds: EntityId[];
  sharingAllergiesIntolerancesIds: EntityId[];
  sharingConditionsIds: EntityId[];
  sharingHealthDataGroupIds: EntityId[];
  isPinValid: boolean;
  isValidatingPin: boolean;
  isApprovalInProgress: boolean;
  handshakePinResponse: DocumentSharePinResponseData;
}

const intialHandshakePinResponse: DocumentSharePinResponseData = {
  client_id: '',
  public_key: '',
  redirect_uri: '',
  scope: '',
  state: '',
  pin: '',
};

const initialState: DocumentSharingState = {
  pin: '',
  activeView: ShareSteps.SESSION,
  sharingHealthDataIds: [],
  sharingMedicalHistoryIds: [],
  sharingMedicationStatementIds: [],
  sharingAllergiesIntolerancesIds: [],
  sharingConditionsIds: [],
  sharingHealthDataGroupIds: [],
  isPinValid: false,
  isValidatingPin: false,
  isApprovalInProgress: false,
  handshakePinResponse: intialHandshakePinResponse,
};

const validatePin = createAsyncThunk(
  'sharing/validatePin',
  async (pin: string, { dispatch }) => {
    const accessToken = waterfallGlobalState().access_token!;
    const response = await shareService.submitHandshakePin(pin, accessToken);
    dispatch(setPin(pin));
    return response;
  }
);

const approveSharing = createAsyncThunk(
  'sharing/approveSharing',
  async (_, { getState }) => {
    const state = getState() as AppState;
    const {
      handshakePinResponse,
      sharingHealthDataIds,
      sharingMedicalHistoryIds,
      sharingMedicationStatementIds,
      sharingAllergiesIntolerancesIds,
      sharingConditionsIds,
    } = state.sharing;
    const accessToken = waterfallGlobalState().access_token!;

    const shareableMedicationResourceIds =
      selectShareableMedicationResourceIds(state);

    // If the public key is available
    if (handshakePinResponse.public_key) {
      const response = await shareService.approveShareSession({
        pin: state.sharing.pin,
        pinResponseData: handshakePinResponse,
        access_token: accessToken,
        selectedResourceIds: [
          ...sharingHealthDataIds,
          ...sharingMedicalHistoryIds,
          ...sharingMedicationStatementIds,
          ...shareableMedicationResourceIds,
          ...sharingAllergiesIntolerancesIds,
          ...sharingConditionsIds,
        ] as string[],
      });
      return response;
    }
  }
);

const revokeAllHandshakeConnections = createAsyncThunk(
  'sharing/revokeAllHandshakeConnections',
  async (handshakeApplications: IApplication[], { dispatch }) => {
    const results = await Promise.all(
      handshakeApplications.map(application =>
        dispatch(revokeApplicationAccess(application))
      )
    );
    return results;
  }
);

const documentSharingSlice = createSlice({
  name: 'sharing',
  initialState,
  reducers: {
    addToSharingData: (state, action: PayloadAction<UpdateSharingDataAction>) => {
      switch (action.payload.type) {
        case ShareableFeatures.DOCUMENTS:
          const updatedSharingHealthDataIds = [
            ...state.sharingHealthDataIds,
            ...action.payload.ids,
          ];
          state.sharingHealthDataIds = [...new Set(updatedSharingHealthDataIds)];
          break;
        case ShareableFeatures.SUMMARY:
          const updatedSharingMedicalHistoryIds = [
            ...state.sharingMedicalHistoryIds,
            ...action.payload.ids,
          ];
          state.sharingMedicalHistoryIds = [
            ...new Set(updatedSharingMedicalHistoryIds),
          ];
          break;
        case ShareableFeatures.MEDICATION:
          const updatedSharingMedicationStatementIds = [
            ...state.sharingMedicationStatementIds,
            ...action.payload.ids,
          ];
          state.sharingMedicationStatementIds = [
            ...new Set(updatedSharingMedicationStatementIds),
          ];
          break;
        case ShareableFeatures.ALLERGIES_INTOLERANCES:
          const updatedSharingAllergiesIntolerancesIds = [
            ...state.sharingAllergiesIntolerancesIds,
            ...action.payload.ids,
          ];
          state.sharingAllergiesIntolerancesIds = [
            ...new Set(updatedSharingAllergiesIntolerancesIds),
          ];
          break;
        case ShareableFeatures.CONDITIONS:
          const updatedSharingConditionsIds = [
            ...state.sharingConditionsIds,
            ...action.payload.ids,
          ];
          state.sharingConditionsIds = [...new Set(updatedSharingConditionsIds)];
          break;
      }
    },
    removeFromSharingData: (
      state,
      action: PayloadAction<UpdateSharingDataAction>
    ) => {
      switch (action.payload.type) {
        case ShareableFeatures.DOCUMENTS:
          const updatedSharingHealthDataIds = state.sharingHealthDataIds;
          action.payload.ids.forEach(id => {
            const groupItemIdIndex = state.sharingHealthDataIds.findIndex(
              healthDataId => healthDataId === id
            );
            updatedSharingHealthDataIds.splice(groupItemIdIndex, 1);
            state.sharingHealthDataIds = [...new Set(updatedSharingHealthDataIds)];
          });
          break;
        case ShareableFeatures.SUMMARY:
          const updatedSharingMedicalHistoryIds = state.sharingMedicalHistoryIds;
          action.payload.ids.forEach(id => {
            const groupIdIndex = state.sharingMedicalHistoryIds.findIndex(
              medicalHistoryId => medicalHistoryId === id
            );
            updatedSharingMedicalHistoryIds.splice(groupIdIndex, 1);
            state.sharingMedicalHistoryIds = [
              ...new Set(updatedSharingMedicalHistoryIds),
            ];
          });
          break;
        case ShareableFeatures.MEDICATION:
          state.sharingMedicationStatementIds =
            state.sharingMedicationStatementIds.filter(
              id => !action.payload.ids.includes(id)
            );
          break;
        case ShareableFeatures.ALLERGIES_INTOLERANCES:
          state.sharingAllergiesIntolerancesIds =
            state.sharingAllergiesIntolerancesIds.filter(
              id => !action.payload.ids.includes(id)
            );
          break;
        case ShareableFeatures.CONDITIONS:
          state.sharingConditionsIds = state.sharingConditionsIds.filter(
            id => !action.payload.ids.includes(id)
          );
          break;
      }
    },
    addToSharingGroupIds: (state, action: PayloadAction<EntityId[]>) => {
      state.sharingHealthDataGroupIds = [
        ...new Set(state.sharingHealthDataGroupIds.concat(action.payload)),
      ];
    },
    removeFromSharingGroupIds: (state, action: PayloadAction<EntityId[]>) => {
      state.sharingHealthDataGroupIds = state.sharingHealthDataGroupIds.filter(
        groupId => {
          return !action.payload.includes(groupId);
        }
      );
    },
    setActiveView: (state, action: PayloadAction<ShareSteps>) => {
      state.activeView = action.payload;
    },
    setPin: (state, action: PayloadAction<string>) => {
      state.pin = action.payload;
    },
    reset: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(validatePin.fulfilled, (state, action) => {
        state.handshakePinResponse = action.payload;
        state.isPinValid = true;
        state.isValidatingPin = false;
      })
      .addCase(validatePin.pending, state => {
        state.isValidatingPin = true;
      })
      .addCase(validatePin.rejected, state => {
        state.isPinValid = false;
        state.isValidatingPin = false;
      })
      .addCase(approveSharing.fulfilled, state => {
        waterfallGlobalActions.setNotification('SHARE_SUCCESS', 'success');
        pushTrackingEvent(TRACKING_EVENTS.SHARING_SUCCESS);
        state.isApprovalInProgress = false;
        // clean the handshake state to not pollute in subsequent calls
        // get the latest applications in order to populate the revoke
        // get the resources that can be shared if not available. This could be all of the medical data and also documents.
        // In current case of sharing single documents, it could be already available
        // navigate back to session
        state.pin = '';
        state.handshakePinResponse = intialHandshakePinResponse;
        state.sharingHealthDataIds = [];
        state.sharingHealthDataGroupIds = [];
        state.sharingMedicalHistoryIds = [];
        state.sharingMedicationStatementIds = [];
        state.sharingAllergiesIntolerancesIds = [];
        state.sharingConditionsIds = [];
        state.isPinValid = false;
        state.isValidatingPin = false;
        state.isApprovalInProgress = false;
        state.activeView = ShareSteps.SESSION;
      })
      .addCase(approveSharing.pending, state => {
        state.isApprovalInProgress = true;
      })
      .addCase(approveSharing.rejected, (state, action) => {
        state.isApprovalInProgress = false;
        const error = JSON.parse(JSON.stringify(action.error));
        if (isNetworkError(error)) {
          waterfallGlobalActions.setNotification(
            'general_reuse:network_error.message',
            'error'
          );
        } else {
          waterfallGlobalActions.setNotification(error.message, 'error');
        }
      });
  },
});

// selectors

const selectHasShareableData = (state: AppState): boolean => {
  // Use this selector to see if there is any kind of shareable data.
  // In future this could include medical history and medications.
  // For now we see if there are only non empty groups
  const isHavingHealthData = selectHasHealthData(state);
  const isHavingMedicalHistory = selectHasMedicalHistory(state);
  const isHavingMedications = selectHasMedications(state);
  const isHavingAllergiesTolerances = !selectIsAllergiesIntolerancesEmpty(state);
  const isHavingConditions = !selectIsConditionsEmpty(state);

  const isMedicationSharingEnabled = (waterfallGlobalState() as RootState).flags[
    featureNames.MEDICATION
  ];

  const isSummaryDataSharingEnabled = (waterfallGlobalState() as RootState).flags[
    featureNames.SUMMARY
  ];

  return (
    isHavingHealthData ||
    isHavingMedicalHistory ||
    (isMedicationSharingEnabled && isHavingMedications) ||
    (isSummaryDataSharingEnabled && isHavingAllergiesTolerances) ||
    (isSummaryDataSharingEnabled && isHavingConditions)
  );
};

const selectActiveView = (state: AppState) => state.sharing.activeView;

const selectPinValidity = (state: AppState) => state.sharing.isPinValid;

const selectSharingHealthDataIds = (state: AppState) =>
  state.sharing.sharingHealthDataIds;

const selectSharingHealthDataGroupIds = (state: AppState) =>
  state.sharing.sharingHealthDataGroupIds;

const selectSharingMedicalHistoryIds = (state: AppState) =>
  state.sharing.sharingMedicalHistoryIds;

// To make it explicit that the selector returns only medication statement ids
// and not medication resource ids
const selectSharingMedicationStatementIds = (state: AppState) =>
  state.sharing.sharingMedicationStatementIds;

const selectSharingAllergiesIntolerancesIds = (state: AppState) =>
  state.sharing.sharingAllergiesIntolerancesIds;

const selectSharingConditionsIds = (state: AppState) =>
  state.sharing.sharingConditionsIds;

const selectIsApprovalInProgress = (state: AppState) =>
  state.sharing.isApprovalInProgress;

const selectShareableMedicationResourceIds = (state: AppState) => {
  const shareableMedicationStatementIds =
    state.sharing.sharingMedicationStatementIds;
  const allMedications = selectAllMedications(state);
  const shareableMedicationResourceIds = allMedications.reduce<string[]>(
    (accumulator, medication) => {
      if (
        shareableMedicationStatementIds.includes(medication.medicationStatementId)
      ) {
        medication.medicationId && accumulator.push(medication.medicationId);
      }
      return accumulator;
    },
    []
  );
  // Remove duplicated as different Medication Statements resources could
  // link to the same Medication resource
  return [...new Set(shareableMedicationResourceIds)];
};

const selectHasNoShareableDataSelected = (state: AppState) => {
  return (
    !selectSharingMedicalHistoryIds(state).length &&
    !selectSharingAllergiesIntolerancesIds(state).length &&
    !selectSharingConditionsIds(state).length &&
    !selectSharingMedicationStatementIds(state).length &&
    !selectSharingHealthDataIds(state).length
  );
};

const { actions, reducer } = documentSharingSlice;

const {
  addToSharingData,
  setActiveView,
  removeFromSharingData,
  addToSharingGroupIds,
  removeFromSharingGroupIds,
  setPin,
  reset: resetSharingData,
} = actions;

export {
  addToSharingData,
  removeFromSharingData,
  addToSharingGroupIds,
  removeFromSharingGroupIds,
  setActiveView,
  resetSharingData,
};
export { validatePin, approveSharing, revokeAllHandshakeConnections };
export {
  selectHasShareableData,
  selectHasNoShareableDataSelected,
  selectSharingMedicalHistoryIds,
  selectSharingMedicationStatementIds,
  selectSharingAllergiesIntolerancesIds,
  selectSharingConditionsIds,
  selectActiveView,
  selectPinValidity,
  selectSharingHealthDataIds,
  selectIsApprovalInProgress,
  selectSharingHealthDataGroupIds,
};
export default reducer;
