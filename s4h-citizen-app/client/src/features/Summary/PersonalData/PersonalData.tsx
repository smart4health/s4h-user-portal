import { PersonalData as PersonalDataType } from '@d4l/s4h-fhir-xforms';
import { ListItemIcon, MenuItem, SvgIcon } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { batch, useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { RouteLeavingGuard, TitleCaption } from '../../../components';
import config from '../../../config';
import { ReactComponent as EditIcon } from '../../../images/Edit.svg';
import { ReactComponent as ShareIcon } from '../../../images/Share.svg';
import { selectIsSharingMode } from '../../../redux/globalsSlice';
import { pushTrackingEvent, TRACKING_EVENTS } from '../../../utils/analytics';
import webComponentWrapper from '../../../utils/webComponentWrapper';
import EmptyView from '../../MedicalHistory/EmptyView';
import { PersonalDataCardForm } from '../../MedicalHistory/forms/PersonalData';
import {
  formToPersonalData,
  FormValues,
  personalDataToFormState,
} from '../../MedicalHistory/forms/PersonalData/utils';
import {
  editingForm,
  selectIsEditingMedicalHistory,
  selectIsPatientEmpty,
  selectPersonalData,
  selectPersonalDataIds,
  storePatient,
} from '../../MedicalHistory/reduxSlice';
import {
  addToSharingData,
  setActiveView,
  ShareableFeatures,
  ShareSteps,
} from '../../Sharing/reduxSlice';
import SummaryCard from '../Card';
import './PersonalData.scss';

const PersonalData = () => {
  const isEditingMedicalHistory = useSelector(selectIsEditingMedicalHistory);
  const isPatientEmpty = useSelector(selectIsPatientEmpty);
  const isSharingMode = useSelector(selectIsSharingMode);

  const { t } = useTranslation();
  const { t: nst } = useTranslation('anamnesis');
  const dispatch = useDispatch();
  const history = useHistory();

  const [isSaving, setIsSaving] = useState(false);

  const personalData: PersonalDataType = useSelector(selectPersonalData);
  const allPersonalDataIds = useSelector(selectPersonalDataIds);

  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    defaultValues: personalDataToFormState(personalData),
  });

  useEffect(() => {
    return () => {
      dispatch(editingForm(false));
    };
  }, [dispatch]);

  useEffect(() => {
    reset(personalDataToFormState(personalData));
  }, [personalData, reset]);

  const handleEdit = () => {
    pushTrackingEvent(TRACKING_EVENTS['MEDICAL_HISTORY_PERSONAL_DATA_START']);
    dispatch(editingForm(true));
  };

  const handleShareButtonClick = () => {
    batch(() => {
      dispatch(
        addToSharingData({
          type: ShareableFeatures.SUMMARY,
          ids: allPersonalDataIds,
        })
      );
      dispatch(setActiveView(ShareSteps.PIN));
    });
    history.push(config.ROUTES.app_share);
  };

  const onSubmit: SubmitHandler<FormValues> = async data => {
    try {
      setIsSaving(true);
      await dispatch(storePatient(formToPersonalData(data)));
      pushTrackingEvent(TRACKING_EVENTS['MEDICAL_HISTORY_PERSONAL_DATA_SUCCESS']);
      dispatch(editingForm(false));
    } catch (error) {
      pushTrackingEvent(TRACKING_EVENTS['MEDICAL_HISTORY_PERSONAL_DATA_ERROR']);
    } finally {
      setIsSaving(false);
    }
  };

  const footer = isEditingMedicalHistory && (
    <>
      <d4l-button
        classes="button--block button--uppercase button--secondary button--large"
        text={t('cancel')}
        // @ts-ignore
        ref={webComponentWrapper({
          handleClick: () => dispatch(editingForm(false)),
        })}
        data-test="medical-history-cancel-button"
      />
      <d4l-button
        classes="button--block button--uppercase button--large"
        text={t('anamnesis:save_button')}
        is-loading={isSaving}
        type="submit"
        data-test="medical-history-save-button"
      />
    </>
  );

  if (isSharingMode) {
    if (isPatientEmpty) {
      return null;
    }

    return (
      <div className="PersonalData" data-testid="personal-data">
        <SummaryCard
          title={nst('personal_data')}
          id="personal-data"
          content={
            <div className="PersonalData__card-content">
              <PersonalDataCardForm readOnly={true} control={control} />
            </div>
          }
        />
      </div>
    );
  }

  return (
    <form
      className="PersonalData"
      onSubmit={handleSubmit(onSubmit)}
      name="personal-data"
      data-testid="personal-data"
    >
      <SummaryCard
        title={nst('personal_data')}
        id="personal-data"
        menuContent={[
          <MenuItem key="personal-data-edit" onClick={handleEdit}>
            <ListItemIcon>
              <SvgIcon>
                <EditIcon />
              </SvgIcon>
            </ListItemIcon>
            {t('anamnesis:edit_button')}
          </MenuItem>,
          <MenuItem key="personal-data-share" onClick={handleShareButtonClick}>
            <ListItemIcon>
              <SvgIcon>
                <ShareIcon />
              </SvgIcon>
            </ListItemIcon>
            {t('patient_summary.card_more_options_share.menu_item')}
          </MenuItem>,
        ]}
        content={
          <div className="PersonalData__card-content">
            {isPatientEmpty && !isEditingMedicalHistory ? (
              <EmptyView
                emptyStateButtonAction={() => {
                  dispatch(editingForm(true));
                }}
                className="PersonalData__empty-view"
                header={
                  <TitleCaption
                    subtitle={t('anamnesis:empty_state.subtitle_card')}
                  />
                }
                headerClass="PersonalData__empty-state-header"
                contentClass="PersonalData__empty-state-content"
                footerClass="PersonalData__empty-state-footer"
              />
            ) : (
              <PersonalDataCardForm
                readOnly={!isEditingMedicalHistory}
                control={control}
              />
            )}
          </div>
        }
        footer={
          ((isEditingMedicalHistory && isPatientEmpty) || !isPatientEmpty) && footer
        }
      />
      <RouteLeavingGuard isShowingPrompt={formState.isDirty} />
    </form>
  );
};

export default PersonalData;
