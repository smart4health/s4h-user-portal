import { Group } from '@d4l/s4h-fhir-xforms';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../../redux';
import { WORKAROUND_GET_AUTHOR } from '../../../../services';
import { ZipData } from '../../../../services/types';
import calculateDownloadSizeInBytes from '../../../../utils/calculateDownloadSizeInBytes';
import formatBytes from '../../../../utils/formatBytes';
import zipAndSaveData from '../../../../utils/zipAndSaveData';
import {
  selectActiveRecord,
  selectDownloadableGroupData,
} from '../../../DocumentsViewer/reduxSlice';
import { hideModal } from '../../modalsSlice';
import ModalWrapper from '../../ModalWrapper';
import ModalButton from '../ModalButton';
import ModalFooter from '../ModalFooter';
import ModalHeader from '../ModalHeader';
import './DownloadGroup.scss';

export interface Props {
  group: Group;
}

const DownloadGroup: React.FC<Props> = ({ group }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isErroring, setIsErroring] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const activeRecord = useSelector(selectActiveRecord);

  const dataToZip = useSelector<AppState, ZipData>(state =>
    selectDownloadableGroupData(state, group)
  );

  const handleDownloadGroup = useCallback(async () => {
    setIsDownloading(true);

    try {
      await zipAndSaveData(dataToZip);
      dispatch(hideModal());
    } catch (error) {
      setIsDownloading(false);
      setIsErroring(true);
    }
  }, [dataToZip, dispatch]);

  const modalTitle =
    group.groupType === 'Document'
      ? t('download_document')
      : t('download_document_group');

  const groupItemsLength = group.items.length;

  const formattedGroupDownloadSize = formatBytes(
    calculateDownloadSizeInBytes(dataToZip)
  );

  return (
    <ModalWrapper>
      <div className="DownloadGroup">
        <ModalHeader title={modalTitle} />
        <section className="DownloadGroup__body">
          {group.groupType === 'Document' && (
            <>
              <div className="DownloadGroup__list-item">
                <div className="DownloadGroup__list-item-title">{t('title')}</div>
                <div className="DownloadGroup__list-item-value">{group.title}</div>
              </div>
              {group.items.map(document => (
                <div className="DownloadGroup__list-item" key={document.id}>
                  <div className="DownloadGroup__list-item-title">
                    {t('category')}
                  </div>
                  <div className="DownloadGroup__list-item-value">
                    {document.category.reduce((acc, item) => {
                      if (item.resolvedText) {
                        // until first undefined item, when acc is ''
                        if (acc === '') {
                          return item.resolvedText;
                        }
                        // other cases when acc is not ''
                        return `${acc} , ${item.resolvedText}`;
                      }
                      return acc;
                    }, '')}
                  </div>
                </div>
              ))}
              {activeRecord &&
                !!WORKAROUND_GET_AUTHOR(activeRecord) &&
                !!group.items[0].specialty && (
                  <div className="DownloadGroup__list-item">
                    <div className="DownloadGroup__list-item-title">
                      {t('author')}
                    </div>
                    <div className="DownloadGroup__list-item-value">
                      {WORKAROUND_GET_AUTHOR(activeRecord)}
                    </div>
                  </div>
                )}
            </>
          )}
          {group.groupType === 'Course' && (
            <>
              <div className="DownloadGroup__list-item">
                <div className="DownloadGroup__list-item-title">{t('type')}</div>
                <div className="DownloadGroup__list-item-value">
                  {t('questionnaire.backpain_treatment.title')}
                </div>
              </div>
              <div className="DownloadGroup__list-item">
                <div className="DownloadGroup__list-item-title">
                  {t('number_of_items')}
                </div>
                <div className="DownloadGroup__list-item-value">
                  {groupItemsLength}
                </div>
              </div>
            </>
          )}
          <div className="DownloadGroup__list-item">
            <div className="DownloadGroup__list-item-title">{t('files_size')}</div>
            <div className="DownloadGroup__list-item-value">
              {formattedGroupDownloadSize}
            </div>
          </div>
          {isErroring && (
            <div className="DownloadGroup__error-message">
              {t('download_document_group_error')}
            </div>
          )}
        </section>
        <ModalFooter isCancelable>
          <ModalButton
            dataTest="doneBtn"
            disabled={isDownloading || isErroring}
            isLoading={isDownloading}
            onClick={handleDownloadGroup}
            text={t('download')}
          />
        </ModalFooter>
      </div>
    </ModalWrapper>
  );
};

export default DownloadGroup;
