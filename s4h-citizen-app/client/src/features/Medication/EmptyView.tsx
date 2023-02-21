import React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState, TitleCaption } from '../../components';
import { ReactComponent as EmptyMedicationIcon } from './images/medication-reminder-empty-state.svg';

const EmptyView = () => {
  const { t } = useTranslation();
  return (
    <EmptyState
      header={
        <TitleCaption
          title={t('medication.headline.title')}
          subtitle={t('medication.emptyState.infoText')}
        />
      }
      content={<EmptyMedicationIcon />}
    />
  );
};

export default EmptyView;
