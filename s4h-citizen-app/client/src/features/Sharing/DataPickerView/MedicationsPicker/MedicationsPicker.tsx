import { Button, Menu, MenuItem } from '@material-ui/core';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectAllMedicationIds,
  selectAllMedications,
  selectCurrentMedicationsIds,
  selectTotalMedications,
} from '../../../Medication/reduxSlice';
import {
  addToSharingData,
  removeFromSharingData,
  selectSharingMedicationStatementIds,
  ShareableFeatures,
} from '../../reduxSlice';
import MedicationPickerItem from '../MedicationPickerItem';

const MedicationsPicker: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const medicationsCount = useSelector(selectTotalMedications);
  const medications = useSelector(selectAllMedications);
  const allMedicationIds = useSelector(selectAllMedicationIds);
  const currentMedicationIds = useSelector(selectCurrentMedicationsIds);
  const selectedMedicationStatementIds = useSelector(
    selectSharingMedicationStatementIds
  );

  const [isMedicationsSelectorMenuOpen, setIsMedicationsSelectorMenuOpen] =
    useState(false);

  const toggleMedicationsSelectorMenu = () => {
    setIsMedicationsSelectorMenuOpen(previous => !previous);
  };

  const handleSelectAllClicked = () => {
    setIsMedicationsSelectorMenuOpen(false);
    dispatch(
      addToSharingData({
        type: ShareableFeatures.MEDICATION,
        ids: allMedicationIds,
      })
    );
  };

  const handleSelectNoneClicked = () => {
    setIsMedicationsSelectorMenuOpen(false);
    dispatch(
      removeFromSharingData({
        type: ShareableFeatures.MEDICATION,
        ids: allMedicationIds,
      })
    );
  };

  const handleSelectCurrentClicked = () => {
    setIsMedicationsSelectorMenuOpen(false);
    dispatch(
      removeFromSharingData({
        type: ShareableFeatures.MEDICATION,
        ids: allMedicationIds,
      })
    );
    dispatch(
      addToSharingData({
        type: ShareableFeatures.MEDICATION,
        ids: currentMedicationIds,
      })
    );
  };

  const medicationsSelectorButtonRef = useRef(null);

  const selectAllLabel = t('sharing.all.button');
  const selectNoneLabel = t('sharing.none.button');
  const selectActiveLabel = t('sharing.current.button');

  return (
    <li
      className="DataPickerView__feature-item"
      data-testid="datapickerview-medications-list"
    >
      <div className="DataPickerView__list-item">
        <h2>
          {t('sharing.medications.title')} (
          {t('sharing.selected.count', {
            count: selectedMedicationStatementIds.length,
          })}
          )
        </h2>
        {medicationsCount > 1 && (
          <>
            <Button
              id="medications-selector-menu-button"
              className="DataPickerView__selector-menu-button"
              ref={medicationsSelectorButtonRef}
              onClick={toggleMedicationsSelectorMenu}
              endIcon={<d4l-icon-arrow />}
              aria-haspopup="true"
              aria-controls="medications-selector-menu"
              aria-expanded={isMedicationsSelectorMenuOpen || undefined}
            >
              {t('sharing.select.button')}
            </Button>
            <Menu
              id="medications-selector-menu"
              aria-labelledby="medications-selector-menu-button"
              anchorEl={medicationsSelectorButtonRef.current}
              anchorOrigin={{
                horizontal: 'right',
                vertical: 'top',
              }}
              transformOrigin={{
                horizontal: 'right',
                vertical: 'top',
              }}
              getContentAnchorEl={null}
              open={isMedicationsSelectorMenuOpen}
              keepMounted
              onClose={toggleMedicationsSelectorMenu}
            >
              <MenuItem onClick={handleSelectAllClicked}>{selectAllLabel}</MenuItem>
              <MenuItem onClick={handleSelectCurrentClicked}>
                {selectActiveLabel}
              </MenuItem>
              <MenuItem onClick={handleSelectNoneClicked}>
                {selectNoneLabel}
              </MenuItem>
            </Menu>
          </>
        )}
      </div>
      <ul className="DataPickerView__feature-item">
        {medications.map(medication => (
          <MedicationPickerItem
            medication={medication}
            key={medication.medicationId}
          />
        ))}
      </ul>
    </li>
  );
};

export default MedicationsPicker;
