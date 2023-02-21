import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, Switch, useHistory } from 'react-router-dom';
import { ConditionalRedirectRoute } from '../../components';
import config from '../../config';
import { HealthDataViewer } from '../../containers';
import Summary from '../../features/Summary';
import {
  fetchDataOnAppInit,
  selectHasSummaryData,
  setSharingMode,
  setupSDK,
} from '../../redux/globalsSlice';
import { actions } from '../../store';
import { pushTrackingEvent, TRACKING_EVENTS } from '../../utils/analytics';
import { selectHasHealthData } from '../DocumentsViewer/reduxSlice';
import Medication from '../Medication';
import { selectHasMedications } from '../Medication/reduxSlice';
import { selectExternalSharingState } from './reduxSlice';
import './SharedDataView.scss';

const SharedDataView = () => {
  const dispatch = useDispatch();
  const [isRedirecting, setRedirecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isHavingHealthData = useSelector(selectHasHealthData);
  const isHavingMedications = useSelector(selectHasMedications);
  const isHavingSummaryData = useSelector(selectHasSummaryData);
  const sharedData = useSelector(selectExternalSharingState);
  const isSDKSetup = useSelector(state => state.globals.isSDKSetup);
  const history = useHistory();

  useEffect(
    function onMount() {
      pushTrackingEvent(TRACKING_EVENTS.OUTAPP_VIEWDATA_SUCCESS);
      (async () => {
        const { privateKey, accessToken } = sharedData;
        if (privateKey && accessToken) {
          dispatch(setSharingMode(true));
          actions.setAccessToken(accessToken);
          await actions.populateFlags();
          await dispatch(setupSDK({ privateKey, accessToken }));
          await dispatch(fetchDataOnAppInit());
        } else {
          setRedirecting(true);
        }
        setIsLoading(false);
      })();
    },
    [dispatch, sharedData]
  );

  useEffect(
    function decideRedirection() {
      if (!isLoading && isSDKSetup) {
        if (isHavingSummaryData) {
          return history.replace(config.ROUTES.shared_summary);
        } else if (isHavingHealthData) {
          return history.replace(config.ROUTES.shared_documents);
        } else if (isHavingMedications) {
          return history.replace(config.ROUTES.shared_medication);
        }
      }
    },
    [
      history,
      isHavingHealthData,
      isHavingSummaryData,
      isHavingMedications,
      isLoading,
      isSDKSetup,
    ]
  );
  return (
    <>
      {isLoading || !isSDKSetup ? (
        <div className="SharedDataView__loader-wrapper">
          <d4l-spinner />
        </div>
      ) : (
        <Switch>
          <ConditionalRedirectRoute
            exact
            path={config.ROUTES.shared_documents}
            component={HealthDataViewer}
            condition={isSDKSetup}
            redirectPath={config.ROUTES.share}
          />
          <ConditionalRedirectRoute
            path={config.ROUTES.shared_summary}
            component={Summary}
            condition={isSDKSetup}
            redirectPath={config.ROUTES.share}
          />
          <ConditionalRedirectRoute
            exact
            path={config.ROUTES.shared_medication}
            component={Medication}
            condition={isSDKSetup}
            redirectPath={config.ROUTES.share}
          />
        </Switch>
      )}
      {isRedirecting && <Redirect to={config.ROUTES.share} />}
    </>
  );
};

export default SharedDataView;
