import { AllergyIntolerance } from '@d4l/s4h-fhir-xforms';
import { ListItemIcon, MenuItem, SvgIcon } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { batch, useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import ListItem from '../../../components/ListItem';
import Tag, { TagColors } from '../../../components/Tag/Tag';
import config from '../../../config';
import { ReactComponent as DeleteIcon } from '../../../images/Delete.svg';
import { ReactComponent as ShareIcon } from '../../../images/Share.svg';
import { showModal } from '../../modals/modalsSlice';
import {
  addToSharingData,
  setActiveView,
  ShareableFeatures,
  ShareSteps,
} from '../../Sharing/reduxSlice';
import SummaryCard from '../Card';
import ClinicalStatusColorCodes from '../Conditions';
import {
  selectAllAllergiesIntolerances,
  selectAllAllergiesIntolerancesIds,
  selectIsAllergiesIntolerancesEmpty,
} from './reduxSlice';

const CriticalityStatusColorCodes = {
  Low: TagColors.redLightest,
  High: TagColors.redLight,
  'Unable to Assess Risk': TagColors.grayLightest,
};

const VerificationStatusColorCodes = {
  Unconfirmed: TagColors.secondaryLightest,
  Presumed: TagColors.secondaryLightest,
  Confirmed: TagColors.primaryLightest,
  Refuted: TagColors.primaryLightest,
};

const AllergiesIntolerances = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const isAllergiesIntolerancesEmpty = useSelector(
    selectIsAllergiesIntolerancesEmpty
  );
  const allergiesIntolerances = useSelector(selectAllAllergiesIntolerances);
  const allAllergiesIntolerancesIds = useSelector(selectAllAllergiesIntolerancesIds);

  if (isAllergiesIntolerancesEmpty) {
    return null;
  }

  const extractReactions = (
    allergy: AllergyIntolerance
  ): JSX.Element | undefined => {
    // reactions that have a manifestation that have a resolvedText
    const reactions = allergy.reactions?.filter(reaction =>
      reaction.manifestations?.filter(manifestation => manifestation.resolvedText)
    );
    // extract all resolvedTexts
    const allReactionTexts = reactions?.flatMap(reaction =>
      reaction.manifestations.flatMap(manifestation => manifestation.resolvedText)
    );

    return (
      <>
        {allReactionTexts?.map((reaction, index) => {
          return (
            <div key={index} className="ListItem__reaction">
              {reaction}
            </div>
          );
        })}
      </>
    );
  };

  const extractTitle = (allergyIntolerance: AllergyIntolerance) => {
    return allergyIntolerance.code?.resolvedText;
  };

  const buildTags = (allergyIntolerance: AllergyIntolerance) => {
    const criticality = allergyIntolerance.criticalityConcept
      ?.resolvedText as keyof typeof CriticalityStatusColorCodes;
    const clinicalStatus = allergyIntolerance.clinicalStatus
      ?.resolvedText as keyof typeof ClinicalStatusColorCodes;
    const verificationStatus = allergyIntolerance.verificationStatus
      ?.resolvedText as keyof typeof VerificationStatusColorCodes;
    const statusTagColor = verificationStatus
      ? VerificationStatusColorCodes[verificationStatus]
      : ClinicalStatusColorCodes[clinicalStatus];

    return criticality || clinicalStatus ? (
      <>
        {criticality && (
          <Tag
            dataTestId="list-item-ai-criticality-status-tag"
            text={criticality}
            color={CriticalityStatusColorCodes[criticality]}
          />
        )}
        {clinicalStatus && (
          <Tag
            dataTestId="list-item-ai-clinical-status-tag"
            text={`${clinicalStatus}${
              verificationStatus ? ` (${verificationStatus})` : ''
            }`}
            color={statusTagColor}
          />
        )}
      </>
    ) : null;
  };

  const onShareClick = () => {
    batch(() => {
      dispatch(
        addToSharingData({
          type: ShareableFeatures.ALLERGIES_INTOLERANCES,
          ids: allAllergiesIntolerancesIds,
        })
      );

      dispatch(setActiveView(ShareSteps.PIN));
    });

    history.push(config.ROUTES.app_share);
  };

  const onInfoClick = () => {
    history.push(config.ROUTES.support_feature_allergies);
  };

  const onDeleteClick = () => {
    dispatch(showModal({ type: 'DeleteAllergiesIntolerances', options: {} }));
  };

  return (
    <SummaryCard
      title={t('patient_summary.allergies_and_intolerances_card.title')}
      id="allergies-intolerances"
      infoLink={config.ROUTES.support_feature_allergies}
      menuContent={[
        <MenuItem key="allergies-intolerances-info" onClick={onInfoClick}>
          <d4l-icon-questionmark
            class="SummaryCard__info-icon-container"
            classes="SummaryCard__info-icon"
          />
          {t('patient_summary.card_more_options_info.menu_item')}
        </MenuItem>,
        <MenuItem key="allergies-intolerances-share" onClick={onShareClick}>
          <ListItemIcon>
            <SvgIcon>
              <ShareIcon />
            </SvgIcon>
          </ListItemIcon>
          {t('patient_summary.card_more_options_share.menu_item')}
        </MenuItem>,
        <MenuItem
          key="allergies-intolerances-delete"
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
      content={allergiesIntolerances.map(
        (allergyIntolerance: AllergyIntolerance) => {
          return (
            <ListItem
              key={allergyIntolerance.allergyIntoleranceId}
              title={extractTitle(allergyIntolerance)}
              description={extractReactions(allergyIntolerance)}
              tags={buildTags(allergyIntolerance)}
            />
          );
        }
      )}
    />
  );
};

export default AllergiesIntolerances;
