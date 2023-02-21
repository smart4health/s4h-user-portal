import { MedicationStatement } from '@d4l/s4h-fhir-xforms';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import webComponentWrapper from '../../../../utils/webComponentWrapper';
import {
  addToSharingData,
  removeFromSharingData,
  selectSharingMedicationStatementIds,
  ShareableFeatures,
} from '../../reduxSlice';
import './MedicationPickerItem.scss';

interface Props {
  medication: MedicationStatement;
}

const MedicationPickerItem: React.FC<Props> = ({ medication }) => {
  const dispatch = useDispatch();
  const currentlySelectedMedicationIds = useSelector(
    selectSharingMedicationStatementIds
  );
  const { t } = useTranslation();

  const handleMedicationSelect = useCallback(() => {
    if (currentlySelectedMedicationIds.includes(medication.medicationStatementId)) {
      dispatch(
        removeFromSharingData({
          type: ShareableFeatures.MEDICATION,
          ids: [medication.medicationStatementId],
        })
      );
    } else {
      dispatch(
        addToSharingData({
          type: ShareableFeatures.MEDICATION,
          ids: [medication.medicationStatementId],
        })
      );
    }
  }, [currentlySelectedMedicationIds, medication.medicationStatementId, dispatch]);

  return (
    <li className="MedicationPickerItem">
      <d4l-checkbox
        classes="MedicationPickerItem__checkbox"
        checkbox-id={`d4l-checkbox-${medication.medicationStatementId}`}
        checked={currentlySelectedMedicationIds.includes(
          medication.medicationStatementId
        )}
        label={medication.code.resolvedText || t('medication.description.infotext')}
        reversed={true}
        data-test="MedicationSelectionCheck"
        // @ts-ignore */
        ref={webComponentWrapper({
          handleChange: () => handleMedicationSelect(),
        })}
      />
    </li>
  );
};

export default MedicationPickerItem;
