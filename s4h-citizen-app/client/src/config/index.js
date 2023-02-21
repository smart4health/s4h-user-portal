// the web app should fail early, instead of setting meaningful defaults
function required(environment, name) {
  if (!environment[name]) {
    throw new Error(`property or argument '${name}' is undefined`);
  }
  return environment[name];
}

const env = { ...process.env, ...window.ENV_DATA };
const config = {
  IS_STAGING: env.REACT_APP_ENVIRONMENT === 'staging',
  IS_PRODUCTION: env.REACT_APP_ENVIRONMENT === 'production',
  IS_DEV: env.REACT_APP_ENVIRONMENT === 'development',
  REACT_APP_ENVIRONMENT: required(env, 'REACT_APP_ENVIRONMENT'),
  REACT_APP_GC_HOST: required(env, 'REACT_APP_GC_HOST'),
  REACT_APP_AUTH_SERVICE_USERS_URL: required(
    env,
    'REACT_APP_AUTH_SERVICE_USERS_URL'
  ),
  REACT_APP_OAUTH_CLIENT_ID: required(env, 'REACT_APP_OAUTH_CLIENT_ID'),
  REACT_APP_OAUTH_REDIRECT_URI: required(env, 'REACT_APP_OAUTH_REDIRECT_URI'),
  FEATURE_FLAGS_HOST: required(env, 'REACT_APP_FEATURE_FLAGS_HOST'),
  USER_DATA_HOST: required(env, 'REACT_APP_USER_DATA_HOST'),
  TCTOKEN_URL: required(env, 'REACT_APP_TCTOKEN_URL'),
  TCTOKEN_URL_EIDAS: required(env, 'REACT_APP_TCTOKEN_URL_EIDAS'),

  REACT_APP_TOKEN_URL: '/auth/token',
  REACT_APP_VEGA_APPROVE_ENDPOINT: '/authz/api/v1/handshake/approve',
  REACT_APP_PROXY_VEGA_BASE_ENDPOINT: '/oauth',

  ANALYTICS_ENABLE_LOCALHOST:
    env.REACT_APP_MATOMO_ENABLE_LOCALHOST === 'true' || false,
  ANALYTICS_SITE_URL: env.REACT_APP_MATOMO_HOST || 'matomo.data4life.care',
  ANALYTICS_SITE_ID_LOCALHOST: env.REACT_APP_MATOMO_SITE_ID_LOCALHOST,
  get ANALYTICS_SITE_ID_PRODUCTION() {
    return 20;
  },
  get ANALYTICS_SITE_ID_STAGING() {
    return 19;
  },
  get ANALYTICS_DOMAINS_PRODUCTION() {
    return ['*.app.smart4health.eu', '*.auth.smart4health.eu'];
  },
  get ANALYTICS_DOMAINS_STAGING() {
    return ['*.app-staging.smart4health.eu', '*.auth-staging.smart4health.eu'];
  },
  ANALYTICS_PRODUCTS_DIMENSION_KEY: '<MATOMO_PRODUCTS_DIMENSION_ID>',
  ANALYTICS_PROJECTS_DIMENSION_KEY: '<MATOMO_PROJECTS_DIMENSION_ID>',
  get ANALYTICS_PRODUCTS_DIMENSION_VALUE() {
    return '<PRODUCTS_DIMENSION_VALUE>';
  },
  ANALYTICS_PROJECTS_DIMENSION_VALUE: 0,
  SENTRY_DSN: '<SENTRY_DSN>',
  ROUTES: {
    home: '/',
    app_home: '/d4l',
    dashboard: '/d4l/dashboard',
    medication: '/d4l/medication',
    documents: '/d4l/documents',
    app_share: '/d4l/share',
    profile: '/d4l/profile',
    profile_data: '/d4l/profile/your-data',
    profile_acc: '/d4l/profile/account-settings',
    support: '/support',
    support_user_account: '/support/user-account',
    support_trust_privacy: '/support/privacy',
    support_feature_eid: '/support/eid',
    support_feature_sharing: '/support/sharing',
    support_feature_medications: '/support/medications',
    support_feature_conditions: '/support/conditions',
    support_feature_allergies: '/support/allergies',
    support_contact: '/support/contact',
    support_data_ingestion: '/support/data-ingestion',
    legal: '/legal',
    legal_data: '/legal/data',
    legal_terms: '/legal/terms',
    legal_consent: '/legal/consent',
    legal_features: '/legal/features',
    legal_licensing: '/legal/licensing',
    legal_imprint: '/legal/imprint',
    legal_eol: '/legal/eol',
    share: '/share',
    shared_data: '/shared-data',
    shared_documents: '/shared-data/documents',
    shared_summary: '/shared-data/summary',
    shared_medication: '/shared-data/medication',
    summary: '/d4l/summary',
  },
  APP_STATE: {
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error',
  },
  SESSION_STATE: {
    LOADING: 'loading',
    INITIALIZED: 'initialized',
  },
};

export default config;
