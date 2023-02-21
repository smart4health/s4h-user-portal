import { MedicationStatement } from '@d4l/s4h-fhir-xforms';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import MenuItem from '@material-ui/core/MenuItem';
import SvgIcon from '@material-ui/core/SvgIcon';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { BackButton } from '../../../components';
import IconButton from '../../../components/IconButton';
import ModalMenu from '../../../components/ModalMenu';
import config from '../../../config';
import { ReactComponent as DeleteIcon } from '../../../images/Delete.svg';
import { ReactComponent as ShareIcon } from '../../../images/Share.svg';
import {
  selectIsSharingMode,
  selectViewportSize,
  ViewportSize,
} from '../../../redux/globalsSlice';
import { pushTrackingEvent, TRACKING_EVENTS } from '../../../utils/analytics';
import { ReactComponent as FileDownload } from '../../DocumentsViewer/images/FileDownload.svg';
import { showModal } from '../../modals/modalsSlice';
import {
  addToSharingData,
  setActiveView,
  ShareableFeatures,
  ShareSteps,
} from '../../Sharing/reduxSlice';
import { setActiveMedication } from '../reduxSlice';
import './MedicationHeader.scss';

interface Props {
  title: string;
  medicationItem: MedicationStatement;
}

const MedicationHeader = ({ title, medicationItem }: Props) => {
  const { t } = useTranslation();
  const viewportSize = useSelector(selectViewportSize);
  const isSharingMode = useSelector(selectIsSharingMode);
  const dispatch = useDispatch();
  const history = useHistory();
  const [isModalMenuOpen, setIsModalMenuOpen] = useState(false);

  const handleShareButtonClick = () => {
    dispatch(
      addToSharingData({
        type: ShareableFeatures.MEDICATION,
        ids: [medicationItem.medicationStatementId],
      })
    );
    dispatch(setActiveView(ShareSteps.PIN));
    history.push(config.ROUTES.app_share);
  };

  const renderShareIconButton = () => {
    return (
      <IconButton
        label="share"
        onClick={() => {
          handleShareButtonClick();
        }}
        dataTest="shareBtn"
      >
        <ShareIcon />
      </IconButton>
    );
  };

  const renderShareButton = () => {
    const shareLabel = t('share');

    if (isSharingMode) {
      return null;
    }

    return (
      <MenuItem
        aria-label={shareLabel}
        title={shareLabel}
        className="Menu__ListItem"
        dense
        data-test="shareMenuItem"
        onClick={() => {
          setIsModalMenuOpen(false);
          handleShareButtonClick();
        }}
      >
        <ListItemIcon>
          <SvgIcon>
            <ShareIcon />
          </SvgIcon>
        </ListItemIcon>
        {shareLabel}
      </MenuItem>
    );
  };

  const handleDeleteButtonClick = () => {
    setIsModalMenuOpen(false);
    dispatch(
      showModal({
        type: 'DeleteMedication',
        options: { medicationId: medicationItem.medicationStatementId },
      })
    );
  };

  const renderDeleteButton = () => {
    if (isSharingMode) {
      return null;
    }

    const deleteLabel = t('delete');
    return (
      <MenuItem
        aria-label={deleteLabel}
        title={deleteLabel}
        className="Menu__ListItem Menu__ListItem--deleteDocument"
        dense
        data-test="deleteBtn"
        onClick={() => handleDeleteButtonClick()}
      >
        <ListItemIcon>
          <SvgIcon>
            <DeleteIcon />
          </SvgIcon>
        </ListItemIcon>
        {deleteLabel}
      </MenuItem>
    );
  };

  const renderDownloadListItem = () => {
    const downloadLabel = t('download');

    return (
      <MenuItem
        aria-label={downloadLabel}
        title={downloadLabel}
        className="Menu__ListItem"
        dense
        data-test="downloadBtn"
        onClick={() => {
          setIsModalMenuOpen(false);
          dispatch(
            showModal({
              type: 'DownloadMedication',
              options: { medication: medicationItem },
            })
          );
          pushTrackingEvent(TRACKING_EVENTS.MEDICATION_DOWNLOAD_START);
        }}
      >
        <ListItemIcon>
          <SvgIcon>
            <FileDownload />
          </SvgIcon>
        </ListItemIcon>
        {downloadLabel}
      </MenuItem>
    );
  };

  return (
    <div className="MedicationHeader">
      <div className="MedicationHeader__title">
        {viewportSize !== ViewportSize.WIDE && (
          <BackButton onClick={() => dispatch(setActiveMedication(undefined))} />
        )}
        <h3>{title}</h3>
      </div>
      <div className="MedicationHeader__actions">
        <>
          {!isSharingMode && renderShareIconButton()}
          <ModalMenu
            isOpen={isModalMenuOpen}
            onOpen={() => setIsModalMenuOpen(true)}
            onClose={() => setIsModalMenuOpen(false)}
          >
            {renderShareButton()}
            {renderDownloadListItem()}
            {renderDeleteButton()}
          </ModalMenu>
        </>
      </div>
    </div>
  );
};

export default MedicationHeader;
