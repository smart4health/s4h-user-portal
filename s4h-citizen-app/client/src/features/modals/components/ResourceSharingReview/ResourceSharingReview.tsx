import { SimpleDocumentGroup } from '@d4l/s4h-fhir-xforms';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import useExtractConditionDescription from '../../../../hooks/useExtractConditionDescription';
import groupTitle from '../../../../utils/groupTitle';
import { selectAllGroups } from '../../../DocumentsViewer/reduxSlice';
import { selectAllMedications } from '../../../Medication/reduxSlice';
import {
  selectSharingAllergiesIntolerancesIds,
  selectSharingConditionsIds,
  selectSharingHealthDataGroupIds,
  selectSharingMedicalHistoryIds,
  selectSharingMedicationStatementIds,
  setActiveView,
  ShareSteps,
} from '../../../Sharing/reduxSlice';
import { selectAllAllergiesIntolerances } from '../../../Summary/AllergiesIntolerances/reduxSlice';
import { selectAllConditions } from '../../../Summary/Conditions/reduxSlice';
import { hideModal } from '../../modalsSlice';
import ModalWrapper from '../../ModalWrapper';
import ModalButton from '../ModalButton';
import ModalFooter from '../ModalFooter';
import ModalHeader from '../ModalHeader';
import './ResourceSharingReview.scss';

export interface Props {}

const ResourceSharingReview = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const extractConditionDescription = useExtractConditionDescription();
  const selectedHealthDataGroupIds = useSelector(selectSharingHealthDataGroupIds);
  const selectedMedicalHistoryIds = useSelector(selectSharingMedicalHistoryIds);
  const selectedMedicationStatementIds = useSelector(
    selectSharingMedicationStatementIds
  );
  const selectedAllergiesIntolerancesIds = useSelector(
    selectSharingAllergiesIntolerancesIds
  );
  const selectedConditionsIds = useSelector(selectSharingConditionsIds);

  const sharingHealthDataGroups = useSelector(selectAllGroups).filter(group =>
    selectedHealthDataGroupIds.includes(group.id)
  ) as SimpleDocumentGroup[];
  const sharingMedications = useSelector(selectAllMedications).filter(medication =>
    selectedMedicationStatementIds.includes(medication.medicationStatementId)
  );
  const sharingHealthDataTitles = sharingHealthDataGroups
    .map(group => {
      return group.groupType === 'Document'
        ? groupTitle(group)
        : groupTitle(group) +
            ` (${t('document.item.count', { count: group.items.length })})`;
    })
    .join(', ');

  const sharingAllergiesIntolerances = useSelector(
    selectAllAllergiesIntolerances
  ).filter(allergyIntolerance =>
    selectedAllergiesIntolerancesIds.includes(
      allergyIntolerance.allergyIntoleranceId
    )
  );

  const sharingConditions = useSelector(selectAllConditions).filter(condition =>
    selectedConditionsIds.includes(condition.problemId)
  );

  const sharingMedicationTitles = sharingMedications
    .map(medication => {
      return medication.code.resolvedText || t('medication.description.infotext');
    })
    .join(', ');

  const sharingAllergiesIntolerancesTitles = sharingAllergiesIntolerances
    .map(allergyIntolerance => {
      return allergyIntolerance.code?.resolvedText;
    })
    .join(', ');

  const sharingConditionsTitles = sharingConditions
    .map(condition => {
      return extractConditionDescription(condition);
    })
    .join(', ');

  const handleModalClose = () => {
    dispatch(hideModal());
  };

  const handleReEdit = () => {
    dispatch(hideModal());
    dispatch(setActiveView(ShareSteps.PICKER));
  };

  return (
    <ModalWrapper>
      <div className="ResourceSharingReview">
        <ModalHeader title={t('sharing.review_modal.title')} isSmallHeading />
        <div className="ResourceSharingReview__content">
          {!!selectedMedicalHistoryIds.length && (
            <div className="ResourceSharingReview__sharing-data">
              <div className="ResourceSharingReview__sharing-data-title">
                {t('anamnesis:personal_data')}
              </div>
            </div>
          )}
          {!!selectedAllergiesIntolerancesIds.length && (
            <div className="ResourceSharingReview__sharing-data">
              <div className="ResourceSharingReview__sharing-data-title">
                {t('sharing.review_modal_allergies_and_intolerances.title')}
              </div>
              <div className="ResourceSharingReview__sharing-data-names">
                {sharingAllergiesIntolerancesTitles}
              </div>
            </div>
          )}
          {!!selectedConditionsIds.length && (
            <div className="ResourceSharingReview__sharing-data">
              <div className="ResourceSharingReview__sharing-data-title">
                {t('sharing.review_modal_conditions.title')}
              </div>
              <div className="ResourceSharingReview__sharing-data-names">
                {sharingConditionsTitles}
              </div>
            </div>
          )}
          {!!selectedMedicationStatementIds.length && (
            <div className="ResourceSharingReview__sharing-data">
              <div className="ResourceSharingReview__sharing-data-title">
                {t('sharing.review_modal_medications.title')}
              </div>
              <div className="ResourceSharingReview__sharing-data-names">
                {sharingMedicationTitles}
              </div>
            </div>
          )}
          {!!selectedHealthDataGroupIds.length && (
            <div className="ResourceSharingReview__sharing-data">
              <div className="ResourceSharingReview__sharing-data-title">
                {t('sharing.review_modal_documents.title')}
              </div>
              <div className="ResourceSharingReview__sharing-data-names">
                {sharingHealthDataTitles}
              </div>
            </div>
          )}
        </div>
        <ModalFooter isFullWidthButton>
          <ModalButton
            dataTest="doneBtn"
            onClick={handleModalClose}
            text={t('sharing.review_modal_close.button')}
            className="button--block"
          />
          <ModalButton
            dataTest="doneBtn"
            onClick={handleReEdit}
            text={t('sharing.review_modal_edit.button')}
            className="button--secondary button--block"
          />
        </ModalFooter>
      </div>
    </ModalWrapper>
  );
};

export default ResourceSharingReview;
