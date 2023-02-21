import { EntityId } from '@reduxjs/toolkit';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useExtractConditionDescription } from '../../../../hooks';
import isSetEqual from '../../../../utils/isSetEqual';
import webComponentWrapper from '../../../../utils/webComponentWrapper';
import {
  deleteConditions,
  selectAllConditionIds,
  selectAllConditions,
} from '../../../Summary/Conditions/reduxSlice';
import { hideModal } from '../../modalsSlice';
import ModalWrapper from '../../ModalWrapper';
import ModalButton from '../ModalButton';
import ModalFooter from '../ModalFooter';
import ModalHeader from '../ModalHeader';
import './DeleteConditions.scss';

const DeleteConditions = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const extractDescription = useExtractConditionDescription();

  const [isLoading, setIsLoading] = useState(false);
  const [idsToBeDeleted, setIdsToBeDeleted] = useState<Set<EntityId>>(new Set());

  const conditions = useSelector(selectAllConditions);

  const conditionIds = useSelector(selectAllConditionIds);

  const areAllIdsSelected = isSetEqual(idsToBeDeleted, new Set(conditionIds));

  const handleConfirm = async () => {
    setIsLoading(true);
    await dispatch(deleteConditions(Array.from(idsToBeDeleted)));
    dispatch(hideModal());
  };

  const onSelectAllClick = () => {
    areAllIdsSelected
      ? setIdsToBeDeleted(new Set())
      : setIdsToBeDeleted(new Set(conditionIds));
  };

  const onSelectConditionClick = (conditionId: string) => {
    idsToBeDeleted.has(conditionId)
      ? idsToBeDeleted.delete(conditionId)
      : idsToBeDeleted.add(conditionId);

    setIdsToBeDeleted(new Set(idsToBeDeleted));
  };

  return (
    <ModalWrapper className="ModalWrapper">
      <>
        <ModalHeader
          title={t('patient_summary.delete_conditions_selection_modal.title')}
        />
        <section className="DeleteConditions">
          {t('patient_summary.delete_conditions_selection_modal.subtitle')}
          <d4l-checkbox
            classes="DeleteConditions__select-all-checkbox"
            checkbox-id={`d4l-checkbox-conditions-select-all`}
            checked={areAllIdsSelected}
            label={t('patient_summary.delete_conditions_selection_modal.checkbox')}
            // @ts-ignore */
            ref={webComponentWrapper({
              handleChange: onSelectAllClick,
            })}
          />

          <d4l-divider />

          {conditions.map(condition => {
            return (
              <span key={`d4l-checkbox-${condition.problemId}`}>
                <d4l-checkbox
                  classes="DeleteConditions__item-checkbox"
                  checkbox-id={`d4l-checkbox-${condition.problemId}`}
                  checked={idsToBeDeleted.has(condition.problemId)}
                  label={extractDescription(condition)}
                  // @ts-ignore */
                  ref={webComponentWrapper({
                    handleChange: () => onSelectConditionClick(condition.problemId),
                  })}
                />
              </span>
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

export default DeleteConditions;
