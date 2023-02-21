/**
 * Contains all the Container Components of the application.
 * These are Components that hold or manipulate state that is passed down
 * to child components.
 */

import LandingPageContainer from './LandingPage';
import HealthDataViewer from '../features/DocumentsViewer';
import MedicationContainer from '../features/Medication';
import SharingContainer from '../features/Sharing';
import {
  PinView as ExternalPinView,
  SharedDataView as ExternalSharedDataView,
} from '../features/ExternalSharing';
import MainLayoutContainer from './MainLayout';

export {
  HealthDataViewer,
  MedicationContainer,
  SharingContainer,
  LandingPageContainer,
  MainLayoutContainer,
  ExternalPinView,
  ExternalSharedDataView,
};
