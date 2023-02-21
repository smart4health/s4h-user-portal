import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { NAMESPACES } from '../i18n';

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: NAMESPACES,
  defaultNS: 'master',
  debug: false,
  resources: {
    en: { master: {} },
    de: { master: {} },
    pt: { master: {} },
    fr: { master: {} },
    it: { master: {} },
    nl: { master: {} },
  },
  react: {
    useSuspense: true,
  },
});

export default i18n;
