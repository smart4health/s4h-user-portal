import D4LSDK from '@d4l/js-sdk';
import { Language } from '@d4l/web-components-library/dist/types/components/LanguageSwitcher/language-switcher';
import {
  de as germanLocale,
  enGB as englishLocale,
  fr as frenchLocale,
  it as italianLocale,
  nl as dutchLocale,
  pt as portugueseLocale,
} from 'date-fns/locale';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import TRANSLATIONS_DE from './translations/de.s4h.json';
import TRANSLATIONS_EN from './translations/en.s4h.json';
import TRANSLATIONS_FR from './translations/fr.s4h.json';
import TRANSLATIONS_IT from './translations/it.s4h.json';
import TRANSLATIONS_NL from './translations/nl.s4h.json';
import TRANSLATIONS_PT from './translations/pt.s4h.json';
import settings from './utils/settings';

export enum LanguageCode {
  en = 'en',
  de = 'de',
  pt = 'pt',
  nl = 'nl',
  fr = 'fr',
  it = 'it',
}

export const localeMap = {
  [LanguageCode.en]: englishLocale,
  [LanguageCode.de]: germanLocale,
  [LanguageCode.pt]: portugueseLocale,
  [LanguageCode.nl]: dutchLocale,
  [LanguageCode.fr]: frenchLocale,
  [LanguageCode.it]: italianLocale,
};

export const LANGUAGES: Language[] = [
  { code: LanguageCode.en, label: 'English' },
  { code: LanguageCode.de, label: 'Deutsch' },
  { code: LanguageCode.pt, label: 'Português (beta)' },
  { code: LanguageCode.nl, label: 'Nederlands (beta)' },
  { code: LanguageCode.fr, label: 'Français (beta)' },
  { code: LanguageCode.it, label: 'Italiano (beta)' },
].sort((l1, l2) => {
  if (l1.label < l2.label) return -1;
  if (l1.label > l2.label) return 1;
  return 0;
});

export const NAMESPACES = [
  'master',
  'medicalHistory',
  'legal',
  'notifications',
  'scopes',
  'specialtiesAndCategories',
  'support',
];

export const TreatmentCourseTitles: Record<string, string> = {
  BACK_PAIN_TREATMENT: 'questionnaire.backpain_treatment.title',
  BACK_PAIN_PREVENTION: 'questionnaire.backpain_prevention.title',
};

export const GroupItemTitles: Record<string, string> = {
  Pre: 'Pre-session',
  Post: 'Post-session',
};

const languageDetector = new LanguageDetector();
languageDetector.addDetector({
  name: 'custom',
  lookup(options) {
    const { lookupQuerystring } = options;
    const queryMatch = document.location.href.match(
      new RegExp(`[?&]${lookupQuerystring}=([a-z]{2})`)
    );
    return (
      (queryMatch || []).pop() ||
      settings.language ||
      (navigator.language || '').split('-').shift()
    );
  },
  cacheUserLanguage(lng: LanguageCode) {
    settings.language = lng;
    // @ts-ignore
    const { setCurrentUserLanguage } = D4LSDK;
    typeof setCurrentUserLanguage === 'function' && setCurrentUserLanguage(lng);
  },
});

const detection = {
  order: ['custom'],
  caches: ['custom'],
};
i18n.use(languageDetector).init({
  resources: {
    [LanguageCode.en]: TRANSLATIONS_EN,
    [LanguageCode.de]: TRANSLATIONS_DE,
    [LanguageCode.pt]: TRANSLATIONS_PT,
    [LanguageCode.fr]: TRANSLATIONS_FR,
    [LanguageCode.it]: TRANSLATIONS_IT,
    [LanguageCode.nl]: TRANSLATIONS_NL,
  },
  detection,
  ns: NAMESPACES,
  fallbackLng: LanguageCode.en,
  debug: false,
  load: 'languageOnly',
  defaultNS: NAMESPACES[0],
  returnEmptyString: false,
  interpolation: {
    escapeValue: false,
    formatSeparator: ',',
  },
  react: {
    useSuspense: true,
    transKeepBasicHtmlNodesFor: [
      'br',
      'span',
      'i',
      'strong',
      'h3',
      'h4',
      'div',
      'em',
      'p',
      'li',
      'ul',
      'ol',
      'b',
    ],
  },
});

export default i18n;
