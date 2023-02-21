import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  currentPageNumber: number;
  pageCount: number;
}

const PDFPageCounter: React.FunctionComponent<Props> = ({
  currentPageNumber,
  pageCount,
}) => {
  const { t } = useTranslation();

  return (
    <div className="GroupItemPDFView__pages-counter">
      {t('page')} {currentPageNumber}/{pageCount}
    </div>
  );
};

export default PDFPageCounter;
