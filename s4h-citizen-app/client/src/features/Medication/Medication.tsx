import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import TwoColumnCardLayout from '../../components/TwoColumnCardLayout';
import ViewWrapper from '../../components/ViewWrapper';
import { selectIsDeviceDesktop } from '../../redux/globalsSlice';
import EmptyView from './EmptyView';
import './Medication.scss';
import MedicationDetails from './MedicationDetails';
import MedicationList from './MedicationList';
import {
  getMedications,
  selectActiveMedicationId,
  selectActiveMedicationItem,
  selectAllMedications,
  selectIsLoading,
  setActiveMedication,
} from './reduxSlice';

const RIGHT_COLUMN_ID = 'medication-page-tab-panel';

const Medication = () => {
  const isLoading = useSelector(selectIsLoading);
  const medications = useSelector(selectAllMedications);
  const activeMedication = useSelector(selectActiveMedicationItem);
  const activeMedicationId = useSelector(selectActiveMedicationId);
  const isDesktop = useSelector(selectIsDeviceDesktop);
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchMedication = async () => {
      try {
        await dispatch(getMedications(i18n.language));
      } catch (error) {
        console.log(error);
      }
    };

    fetchMedication();
  }, [dispatch, i18n.language]);

  useEffect(() => {
    if (medications.length > 0 && isDesktop && !activeMedicationId) {
      dispatch(setActiveMedication(medications[0].medicationStatementId));
    }
  }, [dispatch, isDesktop, medications, activeMedicationId]);

  const isNoDataExisting = medications?.length === 0;

  return (
    <ViewWrapper className="MedicationViewer">
      {isLoading ? (
        <div>
          <d4l-spinner />
        </div>
      ) : isNoDataExisting ? (
        <EmptyView />
      ) : (
        <TwoColumnCardLayout
          isRightColumnVisibleOnMobile={!!activeMedication}
          leftColumn={
            <MedicationList
              medications={medications}
              rightColumnId={RIGHT_COLUMN_ID}
            />
          }
          rightColumn={
            <MedicationDetails
              medicationItem={activeMedication}
              id={RIGHT_COLUMN_ID}
            />
          }
        />
      )}
    </ViewWrapper>
  );
};

export default Medication;
