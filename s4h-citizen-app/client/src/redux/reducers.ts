import { combineReducers } from '@reduxjs/toolkit';
import documentsViewerReducer from '../features/DocumentsViewer/reduxSlice';
import externalSharingReducer from '../features/ExternalSharing/reduxSlice';
import medicalHistoryReducer from '../features/MedicalHistory/reduxSlice';
import medicationReducer from '../features/Medication/reduxSlice';
import modalsReducer from '../features/modals/modalsSlice';
import profileReducer from '../features/Profile/reduxSlice';
import handshakeConnectionsReducer from '../features/Sharing/handshakeConnectionsSlice';
import sharingReducer from '../features/Sharing/reduxSlice';
import allergiesIntolerancesReducer from '../features/Summary/AllergiesIntolerances/reduxSlice';
import conditionsReducer from '../features/Summary/Conditions/reduxSlice';
import globalsReducer from './globalsSlice';
import provenanceReducer from './provenanceSlice';

export default combineReducers({
  documentsViewer: documentsViewerReducer,
  medication: medicationReducer,
  sharing: sharingReducer,
  externalSharing: externalSharingReducer,
  modals: modalsReducer,
  globals: globalsReducer,
  handshakeConnections: handshakeConnectionsReducer,
  medicalHistory: medicalHistoryReducer,
  profile: profileReducer,
  conditions: conditionsReducer,
  allergiesIntolerances: allergiesIntolerancesReducer,
  provenance: provenanceReducer,
});
