import React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../../components';
import { emptyStateButtonClasses } from '../../../components/EmptyState/EmptyState';
import webComponentWrapper from '../../../utils/webComponentWrapper';
import { ReactComponent as EmptyMedicalHistory } from '../images/medical-history-empty-state.svg';
interface Props {
  emptyStateButtonAction: () => void;
  header: React.ReactNode;
  headerClass?: string;
  contentClass?: string;
  footerClass?: string;
  className?: string;
}
const EmptyView = ({
  headerClass = '',
  contentClass = '',
  footerClass = '',
  header,
  className = '',
  emptyStateButtonAction,
}: Props) => {
  const { t } = useTranslation('anamnesis');
  return (
    <EmptyState
      className={className}
      header={header}
      headerClass={headerClass}
      contentClass={contentClass}
      footerClass={footerClass}
      content={<EmptyMedicalHistory />}
      footer={
        <d4l-button
          classes={emptyStateButtonClasses}
          text={t('empty_state.button')}
          // @ts-ignore
          ref={webComponentWrapper({
            handleClick: emptyStateButtonAction,
          })}
        />
      }
    />
  );
};

export default EmptyView;
