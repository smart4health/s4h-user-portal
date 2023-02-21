import ReactPiwik, { PiwikOptions } from 'react-piwik'; // '@types/react-piwik@latest' is not in the npm registry.
import config from '../config';
import settings, { SettingKeys } from './settings';

let matomo: any = null;

interface TrackingEvents {
  [key: string]: TrackingEvent;
}

type TrackingEvent = (string | number)[];

// The following mappings or names do not necessarily have to make sense.
// We're trying to map our events here to ones previously defined by mobile apps
// VAR_NAME_TERRA: ['Event category Matomo', 'Event action Matomo']
export const TRACKING_EVENTS: TrackingEvents = {
  DOCUMENT_UPLOAD_START: ['Documents - Save', 'Create document tapped'],
  DOCUMENT_UPLOAD_CANCEL: ['Documents - Save', 'Cancel create tapped'],
  DOCUMENT_UPLOAD_SUCCESS: ['Documents - Save', 'Document Save Success'],
  DOCUMENT_UPLOAD_ERROR: ['Documents - Save', 'Document Save Error'],
  DOCUMENT_EDIT_START: ['Documents - Editing', 'Edit document tapped'],
  DOCUMENT_EDIT_CANCEL: ['Documents - Editing', 'Cancel editing tapped'],
  DOCUMENT_EDIT_SUCCESS: ['Documents - Editing', 'Edit document success'],
  DOCUMENT_EDIT_ERROR: ['Documents - Editing', 'Edit document error'],
  DOCUMENT_DOWNLOAD_START: ['Documents - Download', 'Download document tapped'],
  DOCUMENT_DOWNLOAD_CANCEL: ['Documents - Download', 'Cancel download tapped'],
  DOCUMENT_DOWNLOAD_SUCCESS: ['Documents - Download', 'Download document success'],
  DOCUMENT_DOWNLOAD_ERROR: ['Documents - Download', 'Download document error'],
  DOCUMENT_ADD_START: ['Documents - Add', 'Add files tapped'],
  DOCUMENT_ADD_SUCCESS: ['Documents - Add', 'Add files success'],
  DOCUMENT_ADD_ERROR: ['Documents - Add', 'Add files error'],
  MEDICATION_DOWNLOAD_START: ['Medication - Download', 'Medication download tapped'],
  MEDICAL_HISTORY_PERSONAL_DATA_START: [
    'Medical History',
    'Edit personal_data tapped',
  ],
  MEDICAL_HISTORY_PERSONAL_DATA_ERROR: ['Medical History', 'personal_data error'],
  MEDICAL_HISTORY_PERSONAL_DATA_CANCEL: [
    'Medical History',
    'Cancel personal_data tapped',
  ],
  MEDICAL_HISTORY_PERSONAL_DATA_SUCCESS: [
    'Medical History',
    'Save personal_data tapped',
  ],
  MEDICAL_HISTORY_CONDITIONS_START: ['Medical History', 'Edit conditions tapped'],
  MEDICAL_HISTORY_CONDITIONS_ERROR: ['Medical History', 'conditions error'],
  MEDICAL_HISTORY_CONDITIONS_CANCEL: ['Medical History', 'Cancel conditions tapped'],
  MEDICAL_HISTORY_CONDITIONS_SUCCESS: ['Medical History', 'Save conditions tapped'],
  MEDICAL_HISTORY_RISK_FACTORS_START: [
    'Medical History',
    'Edit risk_factors tapped',
  ],
  MEDICAL_HISTORY_RISK_FACTORS_ERROR: ['Medical History', 'risk_factors error'],
  MEDICAL_HISTORY_RISK_FACTORS_CANCEL: [
    'Medical History',
    'Cancel risk_factors tapped',
  ],
  MEDICAL_HISTORY_RISK_FACTORS_SUCCESS: [
    'Medical History',
    'Save risk_factors tapped',
  ],
  MEDICAL_HISTORY_EMERGENCY_CONTACT_START: [
    'Medical History',
    'Edit emergency_contact tapped',
  ],
  MEDICAL_HISTORY_EMERGENCY_CONTACT_ERROR: [
    'Medical History',
    'emergency_contact error',
  ],
  MEDICAL_HISTORY_EMERGENCY_CONTACT_CANCEL: [
    'Medical History',
    'Cancel emergency_contact tapped',
  ],
  MEDICAL_HISTORY_EMERGENCY_CONTACT_SUCCESS: [
    'Medical History',
    'Save emergency_contact tapped',
  ],
  INITIATE_SHARING_START: ['Sharing', 'Start Sharing tapped'],
  INITIATE_SHARING_SUCCESS: ['Sharing', 'Start Sharing success'],
  SHARING_START: ['Sharing', 'Provide access tapped'],
  SHARING_SUCCESS: ['Sharing', 'Sharing success'],
  REVOKE_START: ['Sharing', 'Revoke tapped'],
  REVOKE_SUCCESS: ['Sharing', 'Revoke confirm tapped'],
  REVOKE_CANCEL: ['Sharing', 'Revoke cancel tapped'],
  NEW_SHARING_START: ['Sharing', 'Start new sharing session tapped'],
  OUTAPP_VIEWDATA_START: ['Sharing', 'View shared data tapped'],
  OUTAPP_VIEWDATA_SUCCESS: ['Sharing', 'View shared data success'],
  SHAREE_VIEW_DOWNLOAD_DATA: ['Sharee View', 'Download Data', 'Clicked'],
};

const isProduction: boolean = config.IS_PRODUCTION;
const isStaging: boolean = config.IS_STAGING;
const isLocalhost: boolean =
  config.ANALYTICS_ENABLE_LOCALHOST &&
  config.ANALYTICS_SITE_URL.startsWith('http://localhost:');

export const pushTrackingEvent = (trackingEvent: TrackingEvent) => {
  const isProduction = config.REACT_APP_ENVIRONMENT === 'production';

  if (!matomo || !ReactPiwik.push || !trackingEvent) {
    if (!isProduction) {
      console.log('TrackingEvent debug 🧐', trackingEvent);
    }
    return false;
  }
  ReactPiwik.push(['trackEvent', ...trackingEvent]);
  return true;
};
const initMatomo = () => {
  matomo = new ReactPiwik({
    url: config.ANALYTICS_SITE_URL,
    siteId: isProduction
      ? config.ANALYTICS_SITE_ID_PRODUCTION
      : isStaging
      ? config.ANALYTICS_SITE_ID_STAGING
      : config.ANALYTICS_SITE_ID_LOCALHOST,
    trackErrors: false,
    enableLinkTracking: true,
    jsFilename: 'matomo.js',
    phpFilename: 'matomo.php',
  } as PiwikOptions);

  ReactPiwik.push([
    'setCustomDimension',
    config.ANALYTICS_PRODUCTS_DIMENSION_KEY,
    config.ANALYTICS_PRODUCTS_DIMENSION_VALUE,
  ]);
  ReactPiwik.push([
    'setCustomDimension',
    config.ANALYTICS_PROJECTS_DIMENSION_KEY,
    config.ANALYTICS_PROJECTS_DIMENSION_VALUE,
  ]);
  ReactPiwik.push(['alwaysUseSendBeacon']);
  ReactPiwik.push(['enableCrossDomainLinking']);
  isProduction &&
    ReactPiwik.push(['setDomains', config.ANALYTICS_DOMAINS_PRODUCTION]);
  isStaging && ReactPiwik.push(['setDomains', config.ANALYTICS_DOMAINS_STAGING]);
  ReactPiwik.push(['trackPageView']);
  ReactPiwik.push(['enableHeartBeatTimer']);
};

const connectAnalytics = (browserHistory: any) => {
  if (!settings.acceptsTracking || (!isProduction && !isStaging && !isLocalhost)) {
    matomo && matomo.disconnectFromHistory();
    return false;
  }

  !matomo && initMatomo();
  matomo.connectToHistory(browserHistory);
  return true;
};

const setupAnalytics = (browserHistory: any) => {
  let isTracking = connectAnalytics(browserHistory);

  settings.onChange((key: string) => {
    if (key !== SettingKeys.ACCEPTS_TRACKING) {
      return;
    }

    const { acceptsTracking } = settings;
    if (isTracking !== acceptsTracking) {
      isTracking = connectAnalytics(browserHistory);
    }
  });

  return browserHistory;
};

export default setupAnalytics;
