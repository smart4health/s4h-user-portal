import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Props as ChangeEmailProps } from './components/ChangeEmail/ChangeEmail';
import { Props as DeleteAccountProps } from './components/DeleteAccount/DeleteAccount';
import { Props as DeleteGroupProps } from './components/DeleteGroup/DeleteGroup';
import { Props as DeleteMedicationProps } from './components/DeleteMedication/DeleteMedication';
import { Props as DownloadDataProps } from './components/DownloadData/DownloadData';
import { Props as DownloadGroupProps } from './components/DownloadGroup/DownloadGroup';
import { Props as DownloadMedicationProps } from './components/DownloadMedication/DownloadMedication';
import { Props as EidCountrySelectionProps } from './components/EidCountrySelection/EidCountrySelection';
import { Props as ExternalLinkProps } from './components/Legal/ExternalLink';
import { Props as AddGroupProps } from './components/ManageGroup/AddGroup/AddGroup';
import { Props as EditGroupProps } from './components/ManageGroup/EditGroup/EditGroup';
import { Props as QRReaderProps } from './components/QRScanner/QRScanner';
import { Props as ResourceSharingReviewProps } from './components/ResourceSharingReview/ResourceSharingReview';
import { Props as RevokeSessionProps } from './components/RevokeSession/RevokeSession';
import { Props as RouteLeaveGuardProps } from './components/RouteLeaveGuard/RouteLeaveGuard';
import { Props as ShowProvenanceProps } from './components/ShowProvenance/ShowProvenance';
import { Props as SimpleModalProps } from './components/SimpleModal/SimpleModal';

export type ModalData =
  | {
      type: 'AddGroup';
      options: AddGroupProps;
    }
  | {
      type: 'DeleteGroup';
      options: DeleteGroupProps;
    }
  | {
      type: 'EditGroup';
      options: EditGroupProps;
    }
  | {
      type: 'DownloadGroup';
      options: DownloadGroupProps;
    }
  | {
      type: 'ExternalLink';
      options: ExternalLinkProps;
    }
  | {
      type: 'RevokeSession';
      options: RevokeSessionProps;
    }
  | {
      type: 'QRReader';
      options: QRReaderProps;
    }
  | {
      type: 'ChangeEmail';
      options: ChangeEmailProps;
    }
  | {
      type: 'DeleteAccount';
      options: DeleteAccountProps;
    }
  | {
      type: 'DownloadData';
      options: DownloadDataProps;
    }
  | {
      type: 'RemoveEid';
      options: {};
    }
  | { type: 'DeleteMedication'; options: DeleteMedicationProps }
  | { type: 'DownloadMedication'; options: DownloadMedicationProps }
  | { type: 'EidCountrySelection'; options: EidCountrySelectionProps }
  | { type: 'ShowProvenance'; options: ShowProvenanceProps }
  | { type: 'SimpleModal'; options: SimpleModalProps }
  | { type: 'RouteLeaveGuard'; options: RouteLeaveGuardProps }
  | { type: 'ResourceSharingReview'; options: ResourceSharingReviewProps }
  | { type: 'DeleteMedications'; options: {} }
  | { type: 'DeleteAllergiesIntolerances'; options: {} }
  | { type: 'DeleteConditions'; options: {} };

export type ModalType = ModalData['type'];
export type ModalOptions = ModalData['options'];

interface ModalState {
  type: ModalType | null;
  options: ModalOptions | null;
}

const initialState: ModalState = {
  type: null,
  options: null,
};

const modalsSlice = createSlice({
  name: 'modals',
  initialState,
  reducers: {
    showModal: (state, action: PayloadAction<ModalData>) => {
      state.type = action.payload.type;
      state.options = action.payload.options;
    },
    hideModal: state => {
      state.type = null;
      state.options = null;
    },
  },
});

const { actions, reducer } = modalsSlice;

export const { showModal, hideModal } = actions;

export default reducer;
