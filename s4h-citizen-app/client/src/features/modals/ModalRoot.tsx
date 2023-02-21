import React from 'react';
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../redux';
import ChangeEmail from './components/ChangeEmail';
import DeleteAccount from './components/DeleteAccount';
import DeleteAllergiesIntolerances from './components/DeleteAllergiesIntolerances';
import DeleteConditions from './components/DeleteConditions';
import DeleteGroup from './components/DeleteGroup';
import DeleteMedication from './components/DeleteMedication';
import DeleteMedications from './components/DeleteMedications';
import DownloadData from './components/DownloadData';
import DownloadGroup from './components/DownloadGroup/DownloadGroup';
import DownloadMedication from './components/DownloadMedication';
import EidCountrySelection from './components/EidCountrySelection';
import ExternalLink from './components/Legal/ExternalLink';
import AddGroup from './components/ManageGroup/AddGroup';
import EditGroup from './components/ManageGroup/EditGroup';
import QRReader from './components/QRScanner';
import RemoveEid from './components/RemoveEid';
import ResourceSharingReview from './components/ResourceSharingReview';
import RevokeSession from './components/RevokeSession';
import RouteLeaveGuard from './components/RouteLeaveGuard';
import ShowProvenance from './components/ShowProvenance';
import SimpleModal from './components/SimpleModal';
import './ModalRoot.scss';
import { hideModal, ModalType } from './modalsSlice';

const MODAL_MAP: Record<ModalType, React.FC<any>> = {
  AddGroup,
  EditGroup,
  DeleteGroup,
  DownloadGroup,
  ExternalLink,
  RevokeSession,
  QRReader,
  ChangeEmail,
  DeleteAccount,
  DownloadData,
  RemoveEid,
  DeleteMedication,
  DownloadMedication,
  EidCountrySelection,
  ShowProvenance,
  SimpleModal,
  RouteLeaveGuard,
  ResourceSharingReview,
  DeleteMedications,
  DeleteAllergiesIntolerances,
  DeleteConditions,
};

interface Props {}

const ModalRoot: React.FC<Props> = () => {
  const { type: modalType, options: modalOptions } = useSelector(
    (state: AppState) => state.modals
  );
  const ModalComponent = modalType === null ? undefined : MODAL_MAP[modalType];
  const dispatch = useDispatch();
  Modal.setAppElement('#root');
  return (
    <Modal
      parentSelector={() => document.querySelector('#modal-root') as HTMLDivElement}
      portalClassName="Modal"
      className="ModalRoot"
      overlayClassName="ModalOverlay"
      isOpen={ModalComponent !== undefined}
      ariaHideApp={false}
      onRequestClose={() => dispatch(hideModal())}
    >
      {ModalComponent && (
        <article>
          <ModalComponent {...modalOptions} />
        </article>
      )}
    </Modal>
  );
};

export default ModalRoot;
