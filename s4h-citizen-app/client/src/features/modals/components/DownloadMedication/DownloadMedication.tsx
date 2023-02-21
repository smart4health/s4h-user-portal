import { MedicationStatement } from '@d4l/s4h-fhir-xforms';
import { unwrapResult } from '@reduxjs/toolkit';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../../redux';
import { ZipData } from '../../../../services/types';
import calculateDownloadSizeInBytes from '../../../../utils/calculateDownloadSizeInBytes';
import formatBytes from '../../../../utils/formatBytes';
import zipAndSaveData from '../../../../utils/zipAndSaveData';
import {
  cleanupDownloadableMedication,
  getResource,
  selectDownloadableMedication,
} from '../../../Medication/reduxSlice';
import { hideModal } from '../../modalsSlice';
import ModalWrapper from '../../ModalWrapper';
import ModalButton from '../ModalButton';
import ModalFooter from '../ModalFooter';
import ModalHeader from '../ModalHeader';
import './DownloadMedication.scss';

export interface Props {
  medication: MedicationStatement;
}

const DownloadMedication: React.FC<Props> = ({ medication }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isErroring, setIsErroring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    setIsErroring(false);
    const fetchResource = async () => {
      try {
        setIsLoading(true);
        const fetchResourcePromises = [];
        fetchResourcePromises.push(
          dispatch(getResource(medication.medicationStatementId))
        );
        if (medication.medicationId) {
          fetchResourcePromises.push(dispatch(getResource(medication.medicationId)));
        }
        const results = await Promise.all(fetchResourcePromises);
        results.forEach(result => {
          unwrapResult(result);
        });
      } catch (e) {
        console.log(e);
        setIsErroring(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResource();

    return () => {
      dispatch(cleanupDownloadableMedication());
    };
  }, [dispatch, medication]);

  const dataToZip = useSelector<AppState, ZipData>(state =>
    selectDownloadableMedication(state, medication)
  );

  const handleDownloadMedication = useCallback(async () => {
    setIsDownloading(true);
    setIsErroring(false);

    try {
      await zipAndSaveData(dataToZip);
      dispatch(hideModal());
    } catch (error) {
      setIsDownloading(false);
      setIsErroring(true);
    }
  }, [dataToZip, dispatch]);

  const titleEmptyMessage = t('medication.description.infotext');
  const modalTitle = medication?.code.resolvedText || titleEmptyMessage;

  const formattedDownloadSize = formatBytes(calculateDownloadSizeInBytes(dataToZip));

  return (
    <ModalWrapper>
      <div className="DownloadMedication">
        <ModalHeader title={modalTitle} />
        {isLoading ? (
          <div
            className="DownloadMedication__loader"
            data-testid="download-medication-spinner"
          >
            <d4l-spinner />
          </div>
        ) : (
          <section>
            <div className="DownloadMedication__list-item">
              <div className="DownloadMedication__list-item-title">{t('title')}</div>
              <div className="DownloadMedication__list-item-value">{modalTitle}</div>
            </div>

            <div className="DownloadMedication__list-item">
              <div className="DownloadMedication__list-item-title">
                {t('files_size')}
              </div>
              <div className="DownloadMedication__list-item-value">
                {formattedDownloadSize}
              </div>
            </div>
            {isErroring && (
              <div className="DownloadMedication__error-message">
                {t('medication.download.error_message')}
              </div>
            )}
          </section>
        )}
        <ModalFooter isCancelable>
          <ModalButton
            dataTest="doneBtn"
            disabled={isDownloading || isErroring}
            isLoading={isLoading || isDownloading}
            onClick={handleDownloadMedication}
            text={t('download')}
          />
        </ModalFooter>
      </div>
    </ModalWrapper>
  );
};

export default DownloadMedication;
