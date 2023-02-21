import { LinearProgress } from '@material-ui/core';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { downloadAllAttachments, zipDocuments } from '../../../../services';
import { fetchSDKResources } from '../../../../services/D4L';
import { actions } from '../../../../store';
import { hideModal } from '../../modalsSlice';
import ModalWrapper from '../../ModalWrapper';
import ModalButton from '../ModalButton';
import ModalFooter from '../ModalFooter';
import ModalHeader from '../ModalHeader';

export interface Props {
  title: string;
}

const DownloadData = ({ title }: Props) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [isDownloadInProgress, setIsDownloadInProgress] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadProgressLabel, setDownloadProgressLabel] = useState('');

  const downloadAllData = useCallback(async () => {
    try {
      setIsDownloadInProgress(true);
      setDownloadProgressLabel(t('downloading'));

      const allResources = await fetchSDKResources({ offset: 0, limit: 1000 });
      if (allResources?.records) {
        const downloadAttachmentsGenerator = downloadAllAttachments(
          allResources.records
        );
        let doneDownloadingAttachments = false;
        const allRecordsPromises = [];

        while (!doneDownloadingAttachments) {
          const gen = downloadAttachmentsGenerator.next();
          doneDownloadingAttachments = gen.done!;

          // Value is not present in the last yield since that's
          // the end of the function
          if (gen.value) {
            allRecordsPromises.push(gen.value);
            gen.value.then((document: { percentDone: number }) => {
              // Set state of the document download process
              setDownloadProgress(document.percentDone);
            });
          }
        }

        const allRecords = await Promise.all(allRecordsPromises);

        setDownloadProgressLabel(t('zipping'));

        let doneZipping = false;
        const zippingGenerator = zipDocuments(allRecords);
        while (!doneZipping) {
          const gen = zippingGenerator.next();
          // @ts-ignore
          doneZipping = gen.done;

          if (!doneZipping) {
            setDownloadProgress(gen.value);
          }
        }
        setIsDownloadInProgress(false);
        setDownloadProgress(Math.floor(Math.random() * 6) + 1);
        dispatch(hideModal());
      }
    } catch (err) {
      actions.setNotification('notifications:error', 'error');
      setIsDownloadInProgress(false);
    }
  }, [dispatch, t]);
  return (
    <ModalWrapper>
      <>
        <ModalHeader title={title} />
        <section>
          <p>{t('take_a_while')}</p>
          {isDownloadInProgress && (
            <>
              <p>{`${downloadProgressLabel} ${downloadProgress}%`}</p>
              <LinearProgress
                variant="determinate"
                value={downloadProgress}
                data-test="progress"
              />
            </>
          )}
        </section>
        <ModalFooter isCancelable>
          <ModalButton
            dataTest="confirmDownloadBtn"
            disabled={isDownloadInProgress}
            isLoading={isDownloadInProgress}
            onClick={downloadAllData}
            text={t('download')}
          />
        </ModalFooter>
      </>
    </ModalWrapper>
  );
};

export default DownloadData;
