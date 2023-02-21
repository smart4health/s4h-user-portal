import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  selectHasSummaryData,
  selectIsSharingMode,
} from '../../../redux/globalsSlice';
import webComponentWrapper from '../../../utils/webComponentWrapper';
import './TableOfContents.scss';

interface Item {
  id: string;
  title: string;
}
interface Props {
  items: Item[];
  onShareSummaryClick: () => void;
}

const TableOfContents = ({ items, onShareSummaryClick }: Props) => {
  const { t } = useTranslation();
  const hasSummaryData = useSelector(selectHasSummaryData);
  const isSharingMode = useSelector(selectIsSharingMode);

  return (
    <d4l-card classes="TableOfContents card--no-padding">
      {!isSharingMode && (
        <div slot="card-header" data-testid="summary-toc-share-header">
          <header className="TableOfContents__header">
            <h1 className="TableOfContents__title">
              {t('patient_summary.share_bar.title')}
            </h1>
            {hasSummaryData && (
              <d4l-button
                classes="button--large button--uppercase"
                text={t('patient_summary.share_bar.button')}
                data-testid="summary-toc-share-header-button"
                // @ts-ignore
                ref={webComponentWrapper({
                  handleClick: onShareSummaryClick,
                })}
              />
            )}
          </header>
        </div>
      )}
      <div slot="card-content">
        {items.map(tocItem => {
          return (
            <a
              key={tocItem.id}
              href={`#${tocItem.id}`}
              className="TableOfContents__link"
            >
              <div className="TableOfContents__item">
                <div className="TableOfContents__item-title">{t(tocItem.title)}</div>
                <div className="TableOfContents__item-icon">
                  <d4l-icon-arrow-forward-ios />
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </d4l-card>
  );
};

export default TableOfContents;
