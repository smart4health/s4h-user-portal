import { Dosage } from '@d4l/s4h-fhir-xforms';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import config from '../../../config';
import MedicationInfoItem from '../MedicationInfoItem';
import DosageTable from './DosageTable';
import './MedicationDosage.scss';

interface Props {
  dosages: Dosage[];
}

class DosageItem {
  title: string;
  value: string;

  constructor(title: string, value: string) {
    this.title = title;
    this.value = value;
  }
}

const MedicationDosage = ({ dosages }: Props) => {
  const { t } = useTranslation();
  const tableInformation = dosages.map(dosage => ({
    route: dosage.route?.resolvedText,
    comment: dosage.text,
    basic: [
      new DosageItem(
        'medication.number_of_doses.title',
        dosage.doseAndRate?.[0]?.doseQuantity?.value?.toString() ?? ''
      ),
      new DosageItem(
        'medication.medication_unit.title',
        dosage.doseAndRate?.[0]?.doseQuantity?.unit.resolvedText ?? ''
      ),
    ],
    detailed: [
      new DosageItem(
        'medication.number_of_times.title',
        dosage.timing?.repeat?.frequency?.toString() ?? ''
      ),
      new DosageItem(
        'medication.interval.title',
        dosage.timing?.repeat?.period?.toString() ?? ''
      ),
      new DosageItem(
        'medication.time_unit.title',
        dosage.timing?.repeat?.periodUnit?.resolvedText ?? ''
      ),
      new DosageItem(
        'medication.when.title',
        dosage.timing?.repeat?.when?.map(when => when.resolvedText).join(', ') ?? ''
      ),
    ],
  }));

  return (
    <>
      {tableInformation.length > 0 && (
        <div className="MedicationDosage">
          <Link
            className="MedicationDosage__link"
            to={`${config.ROUTES.support_feature_medications}#medication-schedule`}
            target="_blank"
          >
            <span>{t('medication.dosage_section.infoText')}</span>
          </Link>
          {tableInformation.map((infoItem, index) => (
            <div
              className="MedicationDosage__content"
              key={`${infoItem.route}-${index}`}
            >
              <DosageTable
                basicInformation={infoItem.basic.filter(item => item.value)}
                detailedInformation={infoItem.detailed.filter(item => item.value)}
                key={index}
              />
              {infoItem.route && (
                <MedicationInfoItem
                  items={[
                    {
                      title: 'medication.dosage_section_route.title',
                      content: infoItem.route,
                      dataTestId: 'medication-route',
                    },
                  ]}
                />
              )}
              {infoItem.comment && (
                <MedicationInfoItem
                  items={[
                    {
                      title: 'medication.dosage_section_comment.title',
                      content: infoItem.comment,
                      dataTestId: 'medication-comment',
                    },
                  ]}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default MedicationDosage;
