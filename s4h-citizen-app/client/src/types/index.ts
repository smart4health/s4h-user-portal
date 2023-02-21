import { Flags } from '../config/flags';

declare global {
  interface Window {
    ENV_DATA: {
      REACT_APP_AUTH_SERVICE_USERS_URL: string;
      REACT_APP_ENVIRONMENT: 'development' | 'staging' | 'production';
      REACT_APP_FEATURE_FLAGS_HOST: string;
      REACT_APP_GC_HOST: string;
      REACT_APP_OAUTH_CLIENT_ID: string;
      REACT_APP_OAUTH_REDIRECT_URI: string;
      REACT_APP_TCTOKEN_URL: string;
      REACT_APP_TCTOKEN_URL_EIDAS: string;
    };
  }
}

export type Actions = {
  // global actions
  loginSuccess: Function;
  reactivateSessionOrRedirect: Function;
  finishLogin: Function;
  setAccessToken: Function;
  doLogout: Function;
  onCookieChoiceMade: Function;
  onSessionExpired: Function;
  redirectToLanding: Function;
  setNotification: Function;
  dismissNotification: Function;
  populateFlags: Function;
  setAppInitialized: Function;
  setupD4LSDK: Function;
  setLoadingOfSDK: Function;
  verifyEmail: Function;
  // test actions
  setTestState: Function;
  setRedirectURL: Function;
  setAppState: Function;
  setDocumentsAppState: Function;
};

export type Notification = {
  translationKey: string;
  notifPrefix: string;
  type: string;
  show: boolean;
};

export type UserData = {
  email: string;
  created: string;
  verified: boolean;
};

export type Store = {
  actions: Actions;
  Provider: Function;
  connect: Function;
  subscribe: Function;
  getState: () => RootState;
};

export type DocumentAuthor = {
  id: string;
  firstName: string;
  lastName: string;
  prefix: string;
  suffix: string;
  street: string;
  city: string;
  postalCode: string;
  telephone: string;
  website: string;
  specialty: string;
};

export type DocumentAttachment = {
  file: string | File;
  id?: string | number;
  title: string;
  contentType: string;
  creation: Date | string;
  uploading?: boolean;
};

export type Document = {
  id: string;
  type: Object;
  title: string;
  customCreationDate: Date;
  updatedDate: Date;
  author: DocumentAuthor;
  attachments: DocumentAttachment[];
  additionalIds: Object;
  annotations: string[];
  name?: string;
  partner: string;
  flagNew: boolean;
  flagEdit: boolean;
};

// response from the SDK
export type FetchDocumentsSDKResponse = {
  totalCount: number;
  records: Document[];
};

// response from the SDK
export type FetchDocumentsServiceResponse = {
  recordCount: number;
  records: Document[];
};

type Category = {
  label: string;
  value: string;
};

type Specialty = {
  label: string;
  value: string;
};

export type DocumentFormValues = {
  documentTitle: string;
  date: Date;
  category: Category;
  files: File[];
  prefix: string;
  firstName: string;
  lastName: string;
  suffix: string;
  specialty: Specialty;
  city: string;
  street: string;
  postalCode: string;
  telephone: string;
  website: string;
};

export type ResponsePinDataType = {
  client_id: string;
  public_key: string;
  redirect_uri: string;
  scope: string;
  state: string;
  pin: string;
};

export type Client = {
  id: string;
  app_name: string;
  user_visibility: string;
  integrations: {
    oauth_client_id: string;
  }[];
};

export type Application = {
  activated: string;
  revoked: boolean;
  app_id: string;
  id: string;
  app_name: string;
  client_id: string;
  company_name: string;
  company_url: string;
  scope: string;
  slug: string;
  grantee_public_key: string;
};

export type IApplication = Application & {
  permission_id: string;
  // Exists only for old code. New code in applicationSlice doesnt store it
  documentsStored?: number;
};
export type Resource = {
  id: string;
  records: { id: string; name: string }[];
  featureName: string;
};

export type Platform = 'web' | 'android' | 'ios';

export type Browser = 'chrome' | 'internet explorer' | 'firefox' | 'safari' | 'edge';

export type UserAgent = {
  platform: Platform;
  browser: Browser;
};

export type RootState = {
  loggedIn: boolean;
  redirectToLanding: boolean;
  registrationEmail: string;
  access_token: string | null;
  userId: string | null;
  appInitialized: boolean;
  clients: Client[];
  appState: Object;
  notification: Notification;
  userData: UserData;
  SDKLoading: boolean;
  SDKConnected: boolean;
  redirectURL: string | null;
  flags: Flags;
  sessionState: string;
};

export type UsefulEventTarget = EventTarget & {
  dataset: {
    to: string;
  };
  label: string;
  name: string;
  value: string;
  type: string;
  checked: boolean;
  className: string;
  tagName: string;
};

export type AuthorisationData = {
  client_id: string;
  redirect_uri: string;
  response_type: string;
  scope: string;
  public_key: string;
  state: string;
  lng: string;
  product_id: string;
  project_id: number;
  accepts_cookies?: boolean;
  accepts_tracking?: boolean;
};
