import { ListItemIcon, MenuItem, SvgIcon } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { batch, useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import config from '../../../config';
import { ReactComponent as DeleteIcon } from '../../../images/Delete.svg';
import { ReactComponent as ShareIcon } from '../../../images/Share.svg';
import {
  selectCurrentMedications,
  selectCurrentMedicationsIds,
  selectIsCurrentMedicationsEmpty,
} from '../../Medication/reduxSlice';
import { showModal } from '../../modals/modalsSlice';
import {
  addToSharingData,
  setActiveView,
  ShareableFeatures,
  ShareSteps,
} from '../../Sharing/reduxSlice';
import SummaryCard from '../Card';
import MedicationListItem from './MedicationListItem';
import './Medications.scss';

const Medications = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const currentMedications = useSelector(selectCurrentMedications);
  const currentMedicationsIds = useSelector(selectCurrentMedicationsIds);
  const isCurrentMedicationsEmpty = useSelector(selectIsCurrentMedicationsEmpty);

  if (isCurrentMedicationsEmpty) {
    return null;
  }

  const onShareClick = () => {
    batch(() => {
      dispatch(
        addToSharingData({
          type: ShareableFeatures.MEDICATION,
          ids: currentMedicationsIds,
        })
      );

      dispatch(setActiveView(ShareSteps.PIN));
    });

    history.push(config.ROUTES.app_share);
  };

  const onDeleteClick = () => {
    dispatch(showModal({ type: 'DeleteMedications', options: {} }));
  };

  const onInfoClick = () => {
    history.push(config.ROUTES.support_feature_medications);
  };

  return (
    <SummaryCard
      title={t('patient_summary.medications_card.title')}
      id="medications"
      infoLink={config.ROUTES.support_feature_medications}
      menuContent={[
        <MenuItem key="medications-info" onClick={onInfoClick}>
          <d4l-icon-questionmark
            class="SummaryCard__info-icon-container"
            classes="SummaryCard__info-icon"
          />
          {t('patient_summary.card_more_options_info.menu_item')}
        </MenuItem>,
        <MenuItem key="medications-share" onClick={onShareClick}>
          <ListItemIcon>
            <SvgIcon>
              <ShareIcon />
            </SvgIcon>
          </ListItemIcon>
          {t('patient_summary.card_more_options_share.menu_item')}
        </MenuItem>,
        <MenuItem
          key="medications-delete"
          onClick={onDeleteClick}
          className="SummaryCard__menu-item--alarm"
        >
          <ListItemIcon>
            <SvgIcon>
              <DeleteIcon />
            </SvgIcon>
          </ListItemIcon>
          {t('delete')}
        </MenuItem>,
      ]}
      content={currentMedications.map(medication => (
        <MedicationListItem
          key={medication.medicationStatementId}
          medication={medication}
        />
      ))}
    />
  );
};

export default Medications;
