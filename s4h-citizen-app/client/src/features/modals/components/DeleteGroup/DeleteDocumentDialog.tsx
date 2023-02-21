import React from 'react';
import { useTranslation } from 'react-i18next';

const DeleteDocumentDialog: React.FC = () => {
  const { t } = useTranslation();

  return <>{t('delete_document_confirmation')}</>;
};

export default DeleteDocumentDialog;
