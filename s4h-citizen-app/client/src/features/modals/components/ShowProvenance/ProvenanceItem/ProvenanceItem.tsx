import { Provenance } from '@d4l/s4h-fhir-xforms';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  formatDate,
  getMedicationDateFormattingByLanguage,
} from '../../../../../utils/dateHelper';
import './ProvenanceItem.scss';

interface Props {
  data: Provenance;
}

const ProvenanceItem: React.FC<Props> = ({ data }) => {
  const { t, i18n } = useTranslation();

  const who = data.agents
    .map(agent => (agent.resolvedWho ? agent.resolvedWho : undefined))
    .filter(item => item !== undefined)
    .join(', ');
  const getSignature = () => {
    if (data.signature === 1) {
      return t('provenance.single_signature_record.infotext');
    } else {
      return t('provenance.multiple_signature_record.infotext', {
        amount: data.signature,
      });
    }
  };

  return (
    <div className="ProvenanceItem">
      {data.recorded && (
        <>
          <h6>{t('provenance.date_recorded.title')}</h6>
          <div>
            {formatDate(
              new Date(data.recorded),
              getMedicationDateFormattingByLanguage(i18n.language),
              i18n.language
            )}
          </div>
        </>
      )}
      {data.activity?.resolvedText && (
        <>
          <h6>{t('provenance.activity.title')}</h6>
          <div>{data.activity?.resolvedText}</div>
        </>
      )}
      {who && (
        <>
          <h6>{t('provenance.who.title')}</h6>
          <div>{who}</div>
        </>
      )}
      <h6>{t('provenance.signature.title')}</h6>
      {data.signature ? (
        <div>{getSignature()}</div>
      ) : (
        <div>{t('provenance.no_signature.infotext')}</div>
      )}
    </div>
  );
};

export default ProvenanceItem;
