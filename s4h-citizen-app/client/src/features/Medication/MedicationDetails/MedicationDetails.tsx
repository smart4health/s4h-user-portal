import { MedicationStatement } from '@d4l/s4h-fhir-xforms';
import { addMinutes, isValid } from 'date-fns';
import React from 'react';
import { useTranslation } from 'react-i18next';
import TwoColumnContent from '../../../components/TwoColumnContent';
import {
  formatDate,
  getMedicationDateFormattingByLanguage,
} from '../../../utils/dateHelper';
import MedicationDosage from '../MedicationDosage';
import MedicationHeader from '../MedicationHeader';
import MedicationInfoItem from '../MedicationInfoItem';
import MedicationInfoSection from '../MedicationInfoSection';
import './MedicationDetails.scss';

interface Props {
  medicationItem?: MedicationStatement;
  id: string;
}

export const getIngredientsList = (medication: MedicationStatement) => {
  return medication.ingredients
    ?.map(ingredient =>
      ingredient.ingredient.resolvedText
        ? `${ingredient.ingredient.resolvedText}${
            ingredient.strength ? ` (${ingredient.strength})` : ''
          }`
        : undefined
    )
    .filter(item => item !== undefined)
    .join('; ');
};

const MedicationDetails = ({ medicationItem, id }: Props) => {
  const { i18n, t } = useTranslation();
  if (!medicationItem) {
    return null;
  }

  const { min, max } = medicationItem.period;
  const fromDate = addMinutes(new Date(min), new Date(min).getTimezoneOffset());
  const untilDate = addMinutes(new Date(max), new Date(max).getTimezoneOffset());

  const title = medicationItem.code.resolvedText;
  const form = medicationItem.form?.resolvedText;
  const titleEmptyMessage = t('medication.description.infotext');

  const formattedFromDate = isValid(fromDate)
    ? formatDate(
        fromDate,
        getMedicationDateFormattingByLanguage(i18n.language),
        i18n.language
      )
    : undefined;
  const formattedUntilDate = isValid(untilDate)
    ? formatDate(
        untilDate,
        getMedicationDateFormattingByLanguage(i18n.language),
        i18n.language
      )
    : undefined;

  const isConsumedOnSingleDay =
    formattedFromDate &&
    formattedUntilDate &&
    formattedFromDate === formattedUntilDate;

  const determineDateOfIntakeItems = () => {
    const intakeItems = [];
    if (isConsumedOnSingleDay) {
      intakeItems.push({
        title: 'medication.on_date.title',
        content: formattedFromDate,
        dataTestId: 'medication-date-of-intake-on-label',
      });
      // If the specific condition is met, we dont display
      // from and until
      return intakeItems;
    }
    if (formattedFromDate) {
      intakeItems.push({
        title: 'medication.from_date.title',
        content: formattedFromDate,
        dataTestId: 'medication-date-of-intake-from-label',
      });
    }
    if (formattedUntilDate) {
      intakeItems.push({
        title: 'medication.until_date.title',
        content: formattedUntilDate,
        dataTestId: 'medication-date-of-intake-until-label',
      });
    }
    return intakeItems;
  };

  const ingredientsList = getIngredientsList(medicationItem);

  const dateOfIntakeItems = determineDateOfIntakeItems();

  const isHavingMedicalInfo = title || form || ingredientsList;

  return (
    <TwoColumnContent
      id={id}
      ariaLabel={title || titleEmptyMessage}
      className="TwoColumnContent--background-color-neutral"
      header={
        <MedicationHeader
          title={title || titleEmptyMessage}
          medicationItem={medicationItem}
        />
      }
      body={
        <div className="MedicationDetails__content">
          <d4l-card classes="MedicationDetails__card">
            <div slot="card-content">
              {isHavingMedicalInfo && (
                <MedicationInfoSection headline="medication.content_section.headline">
                  {title && (
                    <MedicationInfoItem
                      items={[
                        {
                          title: 'medication.description.title',
                          content: title,
                          dataTestId: 'medication-description',
                        },
                      ]}
                    />
                  )}
                  {ingredientsList && (
                    <MedicationInfoItem
                      items={[
                        {
                          title: 'medication.ingredients.title',
                          content: ingredientsList,
                          dataTestId: 'medication-ingredients',
                        },
                      ]}
                    />
                  )}
                  {form && (
                    <MedicationInfoItem
                      items={[
                        {
                          title: 'medication.form.title',
                          content: form,
                          dataTestId: 'medication-form',
                        },
                      ]}
                    />
                  )}
                </MedicationInfoSection>
              )}
              {dateOfIntakeItems.length > 0 && (
                <MedicationInfoSection headline="medication.date_of_intake.headline">
                  <MedicationInfoItem items={dateOfIntakeItems} />
                </MedicationInfoSection>
              )}
              {medicationItem.dosages.length > 0 && (
                <MedicationInfoSection headline="medication.dosage_section.headline">
                  <div className="MedicationInfoSection__subtitle">
                    {t('medication.dosage_section.subtitle')}
                  </div>
                  <MedicationDosage dosages={medicationItem.dosages} />
                </MedicationInfoSection>
              )}
              <d4l-notification-bar
                text={t('medication.medication_info.text')}
                classes="MedicationDetails__notification-bar"
              />
            </div>
          </d4l-card>
        </div>
      }
    />
  );
};

export default MedicationDetails;
