import { unwrapResult } from '@reduxjs/toolkit';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import ViewWrapper from '../../components/ViewWrapper';
import { getGroups, selectHasHealthData } from '../DocumentsViewer/reduxSlice';
import { getPatient, selectHasMedicalHistory } from '../MedicalHistory/reduxSlice';
import { getMedications, selectHasMedications } from '../Medication/reduxSlice';
import {
  fetchAllergiesIntolerances,
  selectHasAllergiesIntolerances,
} from '../Summary/AllergiesIntolerances/reduxSlice';
import {
  fetchConditions,
  selectHasConditions,
} from '../Summary/Conditions/reduxSlice';
import DataPickerView from './DataPickerView';
import EmptyView from './EmptyView';
import {
  getApplications,
  selectHandshakeConnections,
  selectHasApplications,
} from './handshakeConnectionsSlice';
import PinView from './PinView';
import {
  resetSharingData,
  selectActiveView,
  selectHasShareableData,
  setActiveView,
  ShareSteps,
} from './reduxSlice';
import SessionsView from './SessionsView';
import './Sharing.scss';

const SharingContainer: React.FC = () => {
  const [isDataFetched, setDataFetched] = useState<boolean>(false);
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const activeSharingView = useSelector(selectActiveView);
  const isHavingApplications = useSelector(selectHasApplications);
  const handshakeConnections = useSelector(selectHandshakeConnections);
  const isHavingHealthData = useSelector(selectHasHealthData);
  const isHavingMedicalHistory = useSelector(selectHasMedicalHistory);
  const isHavingShareableData = useSelector(selectHasShareableData);
  const hasMedications = useSelector(selectHasMedications);
  const hasAllergiesIntolerances = useSelector(selectHasAllergiesIntolerances);
  const hasConditions = useSelector(selectHasConditions);

  useEffect(
    function onUnmount() {
      return () => {
        dispatch(resetSharingData());
      };
    },
    [dispatch]
  );

  useEffect(
    function fetchAllResources() {
      (async function fetchData() {
        try {
          if (!isHavingApplications) {
            unwrapResult(await dispatch(getApplications()));
          }
          if (!isHavingHealthData) {
            unwrapResult(await dispatch(getGroups()));
          }
          if (!isHavingMedicalHistory) {
            unwrapResult(await dispatch(getPatient()));
          }
          if (!hasMedications) {
            unwrapResult(await dispatch(getMedications(i18n.language)));
          }
          if (!hasAllergiesIntolerances) {
            unwrapResult(await dispatch(fetchAllergiesIntolerances()));
          }
          if (!hasConditions) {
            unwrapResult(await dispatch(fetchConditions()));
          }
          setDataFetched(true);
        } catch (error) {
          console.debug('Error fetching data');
        }
      })();
    },
    [
      dispatch,
      isHavingApplications,
      isHavingHealthData,
      isHavingMedicalHistory,
      hasMedications,
      i18n.language,
      hasAllergiesIntolerances,
      hasConditions,
    ]
  );

  useEffect(() => {
    if (isDataFetched) {
      // decide on which state after data is fetched or based on existing data
      // If we see that the activeSharingView is not by ShareSteps.SESSION
      // then we directly navigate there making an assumption everything we need
      // for sharing is already available
      if (activeSharingView !== ShareSteps.SESSION) {
        dispatch(setActiveView(activeSharingView));
      } else {
        if (!handshakeConnections.length && !isHavingShareableData) {
          dispatch(setActiveView(ShareSteps.EMPTY));
        } else if (handshakeConnections.length) {
          dispatch(setActiveView(ShareSteps.SESSION));
        } else {
          dispatch(setActiveView(ShareSteps.PICKER));
        }
      }
    }
  }, [
    activeSharingView,
    dispatch,
    handshakeConnections.length,
    isDataFetched,
    isHavingHealthData,
    isHavingMedicalHistory,
    isHavingShareableData,
  ]);

  return (
    <ViewWrapper className="ViewWrapper--background-gray ViewWrapper--footer-gray ViewWrapper--body-and-footer-scroll">
      <div className="Sharing">
        {isDataFetched ? (
          activeSharingView === ShareSteps.EMPTY ? (
            <EmptyView />
          ) : activeSharingView === ShareSteps.PICKER ? (
            <DataPickerView />
          ) : activeSharingView === ShareSteps.SESSION ? (
            <SessionsView />
          ) : activeSharingView === ShareSteps.PIN ? (
            <PinView />
          ) : null
        ) : (
          <d4l-spinner />
        )}
      </div>
    </ViewWrapper>
  );
};

export default SharingContainer;
