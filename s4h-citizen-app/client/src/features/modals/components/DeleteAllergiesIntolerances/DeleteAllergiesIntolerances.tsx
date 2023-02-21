import { AllergyIntolerance } from '@d4l/s4h-fhir-xforms';
import { EntityId } from '@reduxjs/toolkit';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import isSetEqual from '../../../../utils/isSetEqual';
import webComponentWrapper from '../../../../utils/webComponentWrapper';
import {
  deleteAllergiesIntolerances,
  selectAllAllergiesIntolerances,
  selectAllAllergiesIntolerancesIds,
} from '../../../Summary/AllergiesIntolerances/reduxSlice';
import { hideModal } from '../../modalsSlice';
import ModalWrapper from '../../ModalWrapper';
import ModalButton from '../ModalButton';
import ModalFooter from '../ModalFooter';
import ModalHeader from '../ModalHeader';
import './DeleteAllergiesIntolerances.scss';

const DeleteAllergiesIntolerances = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [idsToBeDeleted, setIdsToBeDeleted] = useState<Set<EntityId>>(new Set());

  const allergiesIntolerances = useSelector(selectAllAllergiesIntolerances);

  const allergiesIntolerancesIds = useSelector(selectAllAllergiesIntolerancesIds);

  const areAllIdsSelected = isSetEqual(
    idsToBeDeleted,
    new Set(allergiesIntolerancesIds)
  );

  const handleConfirm = async () => {
    setIsLoading(true);
    await dispatch(deleteAllergiesIntolerances(Array.from(idsToBeDeleted)));
    dispatch(hideModal());
  };

  const onSelectAllClick = () => {
    areAllIdsSelected
      ? setIdsToBeDeleted(new Set())
      : setIdsToBeDeleted(new Set(allergiesIntolerancesIds));
  };

  const onSelectAllergyIntoleranceClick = (allergyIntoleranceId: string) => {
    idsToBeDeleted.has(allergyIntoleranceId)
      ? idsToBeDeleted.delete(allergyIntoleranceId)
      : idsToBeDeleted.add(allergyIntoleranceId);

    setIdsToBeDeleted(new Set(idsToBeDeleted));
  };

  const extractTitle = (allergyIntolerance: AllergyIntolerance) => {
    return allergyIntolerance.code?.resolvedText;
  };

  return (
    <ModalWrapper className="ModalWrapper">
      <>
        <ModalHeader
          title={t(
            'patient_summary.delete_allergies_intolerances_selection_modal.title'
          )}
        />
        <section className="DeleteAllergiesIntolerances">
          {t(
            'patient_summary.delete_allergies_intolerances_selection_modal.subtitle'
          )}
          <d4l-checkbox
            classes="DeleteAllergiesIntolerances__select-all-checkbox"
            checkbox-id={`d4l-checkbox-allergies-intolerances-select-all`}
            checked={areAllIdsSelected}
            label={t(
              'patient_summary.delete_allergies_intolerances_selection_modal.checkbox'
            )}
            // @ts-ignore */
            ref={webComponentWrapper({
              handleChange: onSelectAllClick,
            })}
          />

          <d4l-divider />

          {allergiesIntolerances.map(allergyIntolerance => {
            return (
              <span key={`d4l-checkbox-${allergyIntolerance.allergyIntoleranceId}`}>
                <d4l-checkbox
                  classes="DeleteAllergiesIntolerances__item-checkbox"
                  checkbox-id={`d4l-checkbox-${allergyIntolerance.allergyIntoleranceId}`}
                  checked={idsToBeDeleted.has(
                    allergyIntolerance.allergyIntoleranceId
                  )}
                  label={extractTitle(allergyIntolerance)}
                  // @ts-ignore */
                  ref={webComponentWrapper({
                    handleChange: () =>
                      onSelectAllergyIntoleranceClick(
                        allergyIntolerance.allergyIntoleranceId
                      ),
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

export default DeleteAllergiesIntolerances;
