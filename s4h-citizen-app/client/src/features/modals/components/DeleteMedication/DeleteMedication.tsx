import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteMedicationResource,
  selectAllMedications,
} from '../../../Medication/reduxSlice';
import { hideModal } from '../../modalsSlice';
import ModalWrapper from '../../ModalWrapper';
import ModalButton from '../ModalButton';
import ModalFooter from '../ModalFooter';
import ModalHeader from '../ModalHeader';

export interface Props {
  medicationId: string;
}

const DeleteMedication = ({ medicationId }: Props) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const medications = useSelector(selectAllMedications);
  const { t } = useTranslation();

  const handleConfirm = async () => {
    setIsLoading(true);
    await dispatch(
      deleteMedicationResource({
        medicationId: medicationId,
        medications,
      })
    );
    dispatch(hideModal());
  };

  return (
    <ModalWrapper className="ModalWrapper">
      <>
        <ModalHeader title={t('delete_medication_confirm.headline')} />
        <section className="DeleteGroup__content">
          {t('delete_medication_confirm.content')}
        </section>
        <ModalFooter isCancelable>
          <ModalButton
            dataTest="doneBtn"
            disabled={isLoading}
            isLoading={isLoading}
            onClick={handleConfirm}
            text={t('delete_medication_confirm.button')}
          />
        </ModalFooter>
      </>
    </ModalWrapper>
  );
};

export default DeleteMedication;
