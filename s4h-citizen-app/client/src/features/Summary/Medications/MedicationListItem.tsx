import { MedicationStatement } from '@d4l/s4h-fhir-xforms';
import { addMinutes, isValid } from 'date-fns';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import config from '../../../config';
import useGetFormattedDate from '../../../hooks/useGetFormattedDate';
import { selectIsSharingMode } from '../../../redux/globalsSlice';
import { getMedicationDateFormattingByLanguage } from '../../../utils/dateHelper';
import { getIngredientsList } from '../../Medication/MedicationDetails/MedicationDetails';
import { determineDateLabel } from '../../Medication/MedicationSidebarItem/MedicationSidebarItem';
import { setActiveMedication } from '../../Medication/reduxSlice';

interface Props {
  medication: MedicationStatement;
}

const MedicationListItem = ({ medication }: Props) => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const history = useHistory();
  const { min, max } = medication.period;
  const fromDate = addMinutes(new Date(min), new Date(min).getTimezoneOffset());
  const untilDate = addMinutes(new Date(max), new Date(max).getTimezoneOffset());
  const getFormattedDate = useGetFormattedDate();
  const isSharingMode = useSelector(selectIsSharingMode);

  const formattedFromDate = isValid(fromDate)
    ? getFormattedDate(
        fromDate,
        getMedicationDateFormattingByLanguage(i18n.language)
      )
    : undefined;

  const formattedUntilDate = isValid(untilDate)
    ? getFormattedDate(
        untilDate,
        getMedicationDateFormattingByLanguage(i18n.language)
      )
    : undefined;

  const ingredientsList = getIngredientsList(medication);

  const dateLabel = determineDateLabel(formattedFromDate, formattedUntilDate, true);
  return (
    <div className="MedicationListItem" data-testid="MedicationListItem">
      <div className="MedicationListItem__title">
        {medication.code.resolvedText || t('medication.description.infotext')}
      </div>
      <div className="MedicationListItem__ingredients">{ingredientsList}</div>
      <div className="MedicationListItem__date">{dateLabel}</div>
      <button
        className="MedicationListItem__details"
        onClick={() => {
          dispatch(setActiveMedication(medication.medicationStatementId));
          history.push(
            isSharingMode
              ? config.ROUTES.shared_medication
              : config.ROUTES.medication
          );
        }}
        data-testid="medication-details-button"
      >
        {t('patient_summary.medications_card.link')}
      </button>
    </div>
  );
};

export default MedicationListItem;
