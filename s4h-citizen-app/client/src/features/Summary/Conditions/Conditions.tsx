import { Problem } from '@d4l/s4h-fhir-xforms';
import { ListItemIcon, MenuItem, SvgIcon } from '@material-ui/core';
import { addMinutes, isValid } from 'date-fns';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { batch, useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import ListItem from '../../../components/ListItem';
import Tag, { TagColors } from '../../../components/Tag/Tag';
import config from '../../../config';
import useExtractConditionDescription from '../../../hooks/useExtractConditionDescription';
import useGetFormattedDate from '../../../hooks/useGetFormattedDate';
import { ReactComponent as DeleteIcon } from '../../../images/Delete.svg';
import { ReactComponent as ShareIcon } from '../../../images/Share.svg';
import { getMedicationDateFormattingByLanguage } from '../../../utils/dateHelper';
import { showModal } from '../../modals/modalsSlice';
import {
  addToSharingData,
  setActiveView,
  ShareableFeatures,
  ShareSteps,
} from '../../Sharing/reduxSlice';
import SummaryCard from '../Card';
import {
  selectAllConditionIds,
  selectAllConditions,
  selectIsConditionsEmpty,
} from './reduxSlice';

export const ClinicalStatusColorCodes = {
  Active: TagColors.secondaryLightest,
  Recurrence: TagColors.secondaryLightest,
  Relapse: TagColors.secondaryLightest,
  Inactive: TagColors.primaryLightest,
  Remission: TagColors.primaryLightest,
  Resolved: TagColors.primaryLightest,
};

const Conditions = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const extractDescription = useExtractConditionDescription();
  const isConditionsEmpty = useSelector(selectIsConditionsEmpty);
  const conditions = useSelector(selectAllConditions);
  const allConditionIds = useSelector(selectAllConditionIds);
  const getFormattedDate = useGetFormattedDate();

  if (isConditionsEmpty) {
    return null;
  }

  const buildTags = (condition: Problem) => {
    const clinicalStatus = condition.clinicalStatus
      .resolvedText as keyof typeof ClinicalStatusColorCodes;
    const verificationStatus = condition.verificationStatus?.resolvedText;

    const recordedDate =
      isValid(condition.period.min) && new Date(condition.period.min);
    return clinicalStatus || recordedDate ? (
      <>
        {clinicalStatus && (
          <Tag
            dataTestId="list-item-clinical-status-tag"
            color={ClinicalStatusColorCodes[clinicalStatus]}
            text={`${clinicalStatus}${
              verificationStatus ? `(${verificationStatus})` : ''
            }`}
          />
        )}
        {recordedDate && (
          <Tag
            dataTestId="list-item-recorded-date-tag"
            text={getFormattedDate(
              addMinutes(recordedDate, recordedDate.getTimezoneOffset()),
              getMedicationDateFormattingByLanguage(i18n.language)
            )}
          />
        )}
      </>
    ) : null;
  };

  const onShareClick = () => {
    batch(() => {
      dispatch(
        addToSharingData({
          type: ShareableFeatures.CONDITIONS,
          ids: allConditionIds,
        })
      );

      dispatch(setActiveView(ShareSteps.PIN));
    });

    history.push(config.ROUTES.app_share);
  };

  const onInfoClick = () => {
    history.push(config.ROUTES.support_feature_conditions);
  };

  const onDeleteClick = () => {
    dispatch(showModal({ type: 'DeleteConditions', options: {} }));
  };

  return (
    <SummaryCard
      title={t('patient_summary.conditions_card.title')}
      id="conditions"
      infoLink={config.ROUTES.support_feature_conditions}
      menuContent={[
        <MenuItem key="conditions-info" onClick={onInfoClick}>
          <d4l-icon-questionmark
            class="SummaryCard__info-icon-container"
            classes="SummaryCard__info-icon"
          />
          {t('patient_summary.card_more_options_info.menu_item')}
        </MenuItem>,
        <MenuItem key="conditions-share" onClick={onShareClick}>
          <ListItemIcon>
            <SvgIcon>
              <ShareIcon />
            </SvgIcon>
          </ListItemIcon>
          {t('patient_summary.card_more_options_share.menu_item')}
        </MenuItem>,
        <MenuItem
          key="conditions-delete"
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
      content={conditions.map(condition => (
        <ListItem
          key={condition.problemId}
          title={extractDescription(condition)}
          tags={buildTags(condition)}
        />
      ))}
    />
  );
};

export default Conditions;
