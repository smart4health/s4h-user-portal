import { Components } from '@d4l/web-components-library/dist/loader';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { EmptyState, TitleCaption } from '../../../components';
import { emptyStateButtonClasses } from '../../../components/EmptyState/EmptyState';
import { pushTrackingEvent, TRACKING_EVENTS } from '../../../utils/analytics';
import webComponentWrapper from '../../../utils/webComponentWrapper';
import { showModal } from '../../modals/modalsSlice';
import { ReactComponent as DocumentEmpty } from '../images/documents.svg';

const EmptyDocumentsViewer = () => {
  const { t } = useTranslation(['documents', 'master']);

  const dispatch = useDispatch();

  return (
    <EmptyState
      header={
        <TitleCaption
          title={t('landing_page_empty.title')}
          subtitle={t('landing_page_empty.subtitle')}
        />
      }
      content={<DocumentEmpty />}
      footer={[
        <d4l-button
          // @ts-ignore TS-FIXME
          key="button-upload"
          classes={emptyStateButtonClasses}
          data-test="openDocumentUploadButton"
          text={t('landing_page_upload.button')}
          ref={webComponentWrapper<Components.D4lButton>({
            handleClick: () => {
              pushTrackingEvent(TRACKING_EVENTS.DOCUMENT_UPLOAD_START);
              dispatch(showModal({ type: 'AddGroup', options: {} }));
            },
          })}
        />,
      ]}
    />
  );
};

export default EmptyDocumentsViewer;
