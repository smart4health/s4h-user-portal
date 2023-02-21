/**
 * Date formatting internal library. Reason for this is to have
 * a stable API if we decide to change the date handling implementation
 * in the future.
 */

import dateFnsFormat from 'date-fns/format';
import dateFnsParse from 'date-fns/parse';
import isValid from 'date-fns/isValid';
import isAfter from 'date-fns/isAfter';
import { localeMap, LanguageCode } from '../i18n';

/**
 * Agreed to use only one format to show the dates in Terra
 * until localized date formatting and date handling in general is
 * decided.
 */
export const FHIR_DATE_FORMAT = 'yyyy-MM-dd';
export const DOCUMENT_VIEW_DATE_FORMAT = 'dd/MM/yyyy';
export const DE_DISPLAY_DATE_FORMAT = 'dd.MM.yyyy';
export const MMMM_DD_YYYY_LONG_DATE_FORMAT = 'MMMM dd, yyyy';
export const DD_MMMM_YYY_LONG_DATE_FORMAT = 'dd. MMMM yyyy';
export const DE_DISPLAY_DATE_TIME_FORMAT = 'dd.MM.yyyy, HH:MM';

export const formatDate = (date: Date, format: string, locale: string) => {
  return dateFnsFormat(date, format, {
    locale: localeMap[locale as LanguageCode] ?? undefined,
  });
};

export const getMedicationDateFormattingByLanguage = (language: string): string => {
  if (
    [
      LanguageCode.de,
      LanguageCode.fr,
      LanguageCode.pt,
      LanguageCode.it,
      LanguageCode.nl,
    ].includes(language as LanguageCode)
  ) {
    return DD_MMMM_YYY_LONG_DATE_FORMAT;
  }
  return MMMM_DD_YYYY_LONG_DATE_FORMAT;
};

export const parseDate = (date: string, format: string, locale: string) => {
  const parsed = dateFnsParse(date, format, new Date());
  if (isValid(parsed) && formatDate(parsed, format, locale) === date) {
    if (isAfter(parsed, new Date())) {
      const today = dateFnsFormat(new Date(), DE_DISPLAY_DATE_FORMAT);
      return dateFnsParse(today, format, new Date());
    }
    return parsed;
  }
  return undefined;
};
