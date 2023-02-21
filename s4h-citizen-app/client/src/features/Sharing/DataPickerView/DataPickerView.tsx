import { EntityId } from '@reduxjs/toolkit';
import React from 'react';
// @ts-ignore There is no typing for react-feature-toggles so we are telling TS that it's ok
import { FeatureToggle } from 'react-feature-toggles';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import ViewHeader from '../../../components/ViewHeader';
import { featureNames } from '../../../config/flags';
import isArrayEqual from '../../../utils/isArrayEqual';
import webComponentWrapper from '../../../utils/webComponentWrapper';
import {
  selectAllGroups,
  selectAllHealthDataInputResourceIds,
  selectHasHealthData,
} from '../../DocumentsViewer/reduxSlice';
import {
  selectHasMedicalHistory,
  selectHasPersonalData,
  selectMedicalHistoryIds,
} from '../../MedicalHistory/reduxSlice';
import {
  selectAllMedicationIds,
  selectHasMedications,
} from '../../Medication/reduxSlice';
import {
  selectAllAllergiesIntolerancesIds,
  selectHasAllergiesIntolerances,
} from '../../Summary/AllergiesIntolerances/reduxSlice';
import {
  selectAllConditionIds,
  selectHasConditions,
} from '../../Summary/Conditions/reduxSlice';
import {
  addToSharingData,
  addToSharingGroupIds,
  removeFromSharingData,
  removeFromSharingGroupIds,
  selectHasNoShareableDataSelected,
  selectSharingAllergiesIntolerancesIds,
  selectSharingConditionsIds,
  selectSharingHealthDataGroupIds,
  selectSharingHealthDataIds,
  selectSharingMedicalHistoryIds,
  selectSharingMedicationStatementIds,
  setActiveView,
  ShareableFeatures,
  ShareSteps,
} from '../reduxSlice';
import AllergiesIntolerancesPicker from './AllergiesIntolerancesPicker';
import ConditionsPicker from './ConditionsPicker';
import './DataPickerView.scss';
import GroupPickerListItem from './GroupListItem';
import MedicationsPicker from './MedicationsPicker';

const DataPickerView: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const hasNoShareableDataSelected = useSelector(selectHasNoShareableDataSelected);

  // Flags for conditional rendering
  const isHavingHealthData = useSelector(selectHasHealthData);
  const allHealthDataInputResourceIds = useSelector(
    selectAllHealthDataInputResourceIds
  );
  const isHavingMedicalHistory = useSelector(selectHasMedicalHistory);
  const isHavingPersonalData = useSelector(selectHasPersonalData);
  const isHavingMedications = useSelector(selectHasMedications);
  const isHavingAllergiesIntolerances = useSelector(selectHasAllergiesIntolerances);
  const isHavingConditions = useSelector(selectHasConditions);

  // IDs for handling addition and removal of shareable items
  const medicalHistoryIds = useSelector(selectMedicalHistoryIds);
  const groups = useSelector(selectAllGroups);
  const selectedHealthDataIds = useSelector(selectSharingHealthDataIds);
  const selectedHealthDataGroupIds = useSelector(selectSharingHealthDataGroupIds);
  const selectedMedicalHistoryIds = useSelector(selectSharingMedicalHistoryIds);

  const allMedicationIds = useSelector(selectAllMedicationIds);
  const selectedMedicationIds = useSelector(selectSharingMedicationStatementIds);
  const allAllergiesIntolerancesIds = useSelector(selectAllAllergiesIntolerancesIds);
  const selectedAllergiesIntolerancesIds = useSelector(
    selectSharingAllergiesIntolerancesIds
  );

  const allConditionsIds = useSelector(selectAllConditionIds);
  const selectedConditionsIds = useSelector(selectSharingConditionsIds);

  const selectedItemsTotalCount =
    (selectedMedicalHistoryIds.length > 0 ? 1 : 0) +
    selectedHealthDataGroupIds.length +
    selectedConditionsIds.length +
    selectedMedicationIds.length +
    selectedAllergiesIntolerancesIds.length;

  const isAllHealthDataSelected = isArrayEqual(
    selectedHealthDataIds,
    allHealthDataInputResourceIds
  );

  const isPersonalDataSelected = isArrayEqual(
    selectedMedicalHistoryIds,
    medicalHistoryIds
  );

  const isAllMedicationSelected = isArrayEqual(
    selectedMedicationIds,
    allMedicationIds
  );

  const isAllAllergiesIntolerancesSelected = isArrayEqual(
    selectedAllergiesIntolerancesIds,
    allAllergiesIntolerancesIds
  );

  const isAllConditionsSelected = isArrayEqual(
    selectedConditionsIds,
    allConditionsIds
  );

  const isAllShareableDataSelected =
    isPersonalDataSelected &&
    isAllMedicationSelected &&
    isAllAllergiesIntolerancesSelected &&
    isAllConditionsSelected &&
    isAllHealthDataSelected;

  const updateSharingGroupIds = (removeFromSharing: boolean) => {
    if (removeFromSharing) {
      dispatch(removeFromSharingGroupIds(groups.map(group => group.id)));
    } else {
      dispatch(addToSharingGroupIds(groups.map(group => group.id)));
    }
  };

  const updateSharingIds = ({
    removeFromSharing,
    featureName,
    ids,
  }: {
    removeFromSharing?: boolean;
    featureName: ShareableFeatures;
    ids: EntityId[];
  }) => {
    if (removeFromSharing) {
      dispatch(
        removeFromSharingData({
          type: featureName,
          ids,
        })
      );
    } else {
      dispatch(addToSharingData({ type: featureName, ids }));
    }
  };

  const handleFeatureSelect = (featureName: ShareableFeatures) => {
    switch (featureName) {
      case ShareableFeatures.DOCUMENTS: {
        updateSharingIds({
          removeFromSharing: isAllHealthDataSelected,
          featureName,
          ids: allHealthDataInputResourceIds,
        });
        updateSharingGroupIds(isAllHealthDataSelected);
        break;
      }
      case ShareableFeatures.SUMMARY: {
        updateSharingIds({
          removeFromSharing: isPersonalDataSelected,
          featureName,
          ids: medicalHistoryIds,
        });
        break;
      }
      case ShareableFeatures.MEDICATION: {
        updateSharingIds({
          removeFromSharing: isAllMedicationSelected,
          featureName,
          ids: allMedicationIds,
        });
        break;
      }
      case ShareableFeatures.ALLERGIES_INTOLERANCES: {
        updateSharingIds({
          removeFromSharing: isAllAllergiesIntolerancesSelected,
          featureName,
          ids: allAllergiesIntolerancesIds,
        });
        break;
      }
      case ShareableFeatures.CONDITIONS: {
        updateSharingIds({
          removeFromSharing: isAllConditionsSelected,
          featureName,
          ids: allConditionsIds,
        });
        break;
      }
    }
  };

  const selectAll = () => {
    updateSharingIds({
      featureName: ShareableFeatures.SUMMARY,
      ids: medicalHistoryIds,
    });

    updateSharingIds({
      featureName: ShareableFeatures.MEDICATION,
      ids: allMedicationIds,
    });

    updateSharingIds({
      featureName: ShareableFeatures.ALLERGIES_INTOLERANCES,
      ids: allAllergiesIntolerancesIds,
    });

    updateSharingIds({
      featureName: ShareableFeatures.CONDITIONS,
      ids: allConditionsIds,
    });

    updateSharingIds({
      featureName: ShareableFeatures.DOCUMENTS,
      ids: allHealthDataInputResourceIds,
    });
    updateSharingGroupIds(isAllHealthDataSelected);
  };

  const deselectAll = () =>
    Object.values(ShareableFeatures).map(handleFeatureSelect);

  return (
    <div className="DataPickerView">
      <d4l-card classes="Sharing__card">
        <div slot="card-header">
          <ViewHeader title={t('sharing.group_list.title')} />
        </div>

        <div slot="card-content" className="DataPickerView__card-content">
          <p className="DataPickerView__card-description">
            {t('new_sharing_session_description')}
          </p>
          <div className="DataPickerView__select-all-button-container">
            <d4l-button
              classes="button--tertiary button--uppercase DataPickerView__selection-toggle-button DataPickerView__select-all-button"
              data-testid="datapickerview-select-all"
              text={
                isAllShareableDataSelected
                  ? t('sharing.unselect_all.button')
                  : t('sharing.select_all.button')
              }
              // @ts-ignore
              ref={webComponentWrapper({
                handleClick: isAllShareableDataSelected ? deselectAll : selectAll,
              })}
            ></d4l-button>
          </div>
          <d4l-divider />
          <ul className="DataPickerView__feature-items">
            {isHavingMedicalHistory && (
              <li
                className="DataPickerView__feature DataPickerView__feature-item"
                data-testid="datapickerview-medical-history-list"
              >
                {isHavingPersonalData && (
                  <d4l-checkbox
                    classes="GroupPickerListItem__checkbox DataPickerView__list-item"
                    checkbox-id="d4l-checkbox-personal-data-sharing"
                    checked={selectedMedicalHistoryIds.length > 0}
                    label={t('anamnesis:personal_data')}
                    reversed={true}
                    data-test="DocumentSelectionCheck"
                    // @ts-ignore */
                    ref={webComponentWrapper({
                      handleChange: () =>
                        handleFeatureSelect(ShareableFeatures.SUMMARY),
                    })}
                  />
                )}
              </li>
            )}
            <FeatureToggle featureName={featureNames.SUMMARY}>
              {isHavingAllergiesIntolerances && <AllergiesIntolerancesPicker />}
            </FeatureToggle>
            <FeatureToggle featureName={featureNames.SUMMARY}>
              {isHavingConditions && <ConditionsPicker />}
            </FeatureToggle>
            <FeatureToggle featureName={featureNames.MEDICATION}>
              {isHavingMedications && <MedicationsPicker />}
            </FeatureToggle>
            {isHavingHealthData && (
              <li
                className="DataPickerView__feature-item"
                data-testid="datapickerview-healthdata-list"
              >
                <div className="DataPickerView__list-item">
                  <h2>
                    {t(ShareableFeatures.DOCUMENTS)} (
                    {t('sharing.selected.count', {
                      count: selectedHealthDataGroupIds.length,
                    })}
                    )
                  </h2>
                  {groups.length > 1 && (
                    <d4l-button
                      classes="button--tertiary button--uppercase DataPickerView__selection-toggle-button"
                      data-testid="datapickerview-select-all-groups"
                      text={
                        isArrayEqual(
                          selectedHealthDataIds,
                          allHealthDataInputResourceIds
                        )
                          ? t('sharing.unselect_all.button')
                          : t('sharing.select_all.button')
                      }
                      // @ts-ignore
                      ref={webComponentWrapper({
                        handleClick: () =>
                          handleFeatureSelect(ShareableFeatures.DOCUMENTS),
                      })}
                    />
                  )}
                </div>
                <ul className="DataPickerView__feature-item">
                  {groups.map(group => (
                    <GroupPickerListItem group={group} key={group.id} />
                  ))}
                </ul>
              </li>
            )}
          </ul>
          <d4l-button
            classes="button--block button--uppercase"
            data-testid="datapickerview-continue-button"
            data-test="ContinueBtn"
            text={`${t('start_sharing')} (${t('sharing.selected.count', {
              count: selectedItemsTotalCount,
            })})`}
            // @ts-ignore
            ref={webComponentWrapper({
              disabled: hasNoShareableDataSelected,
              handleClick: () => dispatch(setActiveView(ShareSteps.PIN)),
            })}
          />
        </div>
      </d4l-card>
    </div>
  );
};

export default DataPickerView;
