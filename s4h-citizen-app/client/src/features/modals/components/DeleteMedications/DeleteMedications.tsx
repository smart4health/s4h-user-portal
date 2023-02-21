import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import isSetEqual from '../../../../utils/isSetEqual';
import webComponentWrapper from '../../../../utils/webComponentWrapper';
import {
  deleteMedicationResources,
  selectAllMedications,
  selectCurrentMedications,
  selectCurrentMedicationsIds,
} from '../../../Medication/reduxSlice';
import { hideModal } from '../../modalsSlice';
import ModalWrapper from '../../ModalWrapper';
import ModalButton from '../ModalButton';
import ModalFooter from '../ModalFooter';
import ModalHeader from '../ModalHeader';
import './DeleteMedications.scss';

const DeleteMedications = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [idsToBeDeleted, setIdsToBeDeleted] = useState<Set<string>>(new Set());

  // The "Delete Medications" modal only deals with current medications.
  // The selectors `selectCurrentMedications...` actually select medication statements, despite their names.
  const medicationStatements = useSelector(selectCurrentMedications);
  const medicationStatementIds = useSelector(selectCurrentMedicationsIds);

  const medications = useSelector(selectAllMedications);

  const areAllIdsSelected = isSetEqual(
    idsToBeDeleted,
    new Set(medicationStatementIds)
  );

  const handleConfirm = async () => {
    setIsLoading(true);
    await dispatch(
      deleteMedicationResources({
        medicationStatementIds: Array.from(idsToBeDeleted),
        allMedicationStatements: medications,
      })
    );
    dispatch(hideModal());
  };

  const onSelectAllClick = () => {
    areAllIdsSelected
      ? setIdsToBeDeleted(new Set())
      : setIdsToBeDeleted(new Set(medicationStatementIds));
  };

  const onSelectMedicationStatementClick = (medicationStatementId: string) => {
    idsToBeDeleted.has(medicationStatementId)
      ? idsToBeDeleted.delete(medicationStatementId)
      : idsToBeDeleted.add(medicationStatementId);

    setIdsToBeDeleted(new Set(idsToBeDeleted));
  };

  return (
    <ModalWrapper className="ModalWrapper">
      <>
        <ModalHeader
          title={t('patient_summary.delete_medications_selection_modal.title')}
        />
        <section className="DeleteMedications">
          {t('patient_summary.delete_medications_selection_modal.subtitle')}
          <d4l-checkbox
            classes="DeleteMedications__select-all-checkbox"
            checkbox-id={`d4l-checkbox-medications-select-all`}
            checked={areAllIdsSelected}
            label={t('patient_summary.delete_medications_selection_modal.checkbox')}
            // @ts-ignore */
            ref={webComponentWrapper({
              handleChange: onSelectAllClick,
            })}
          />

          <d4l-divider />

          {medicationStatements.map(medication => {
            return (
              <d4l-checkbox
                classes="DeleteMedications__item-checkbox"
                checkbox-id={`d4l-checkbox-${medication.medicationStatementId}`}
                checked={idsToBeDeleted.has(medication.medicationStatementId)}
                label={
                  medication.code.resolvedText ||
                  t('medication.description.infotext')
                }
                // @ts-ignore */
                ref={webComponentWrapper({
                  handleChange: () =>
                    onSelectMedicationStatementClick(
                      medication.medicationStatementId
                    ),
                })}
              />
            );
          })}
        </section>
        <ModalFooter isCancelable>
          <ModalButton
            dataTest="doneBtn"
            disabled={isLoading || idsToBeDeleted.size === 0}
            isLoading={isLoading}
            onClick={handleConfirm}
            text={`${t('delete')} (${idsToBeDeleted.size})`}
          />
        </ModalFooter>
      </>
    </ModalWrapper>
  );
};

export default DeleteMedications;
