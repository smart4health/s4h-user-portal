import { renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '../../mocks/i18n';
import { DOCUMENT_VIEW_DATE_FORMAT, formatDate } from '../../utils/dateHelper';
import useGetFormattedDate from '../useGetFormattedDate';

const wrapper = ({ children }: { children: React.ReactElement }) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
);

describe('useGetFormattedDate', () => {
  it('should return a date formatting function', () => {
    const { result } = renderHook(() => useGetFormattedDate(), { wrapper });
    const { result: translationResult } = renderHook(() => useTranslation(), {
      wrapper,
    });
    const date = new Date();
    expect(result.current(date, DOCUMENT_VIEW_DATE_FORMAT)).toEqual(
      formatDate(
        date,
        DOCUMENT_VIEW_DATE_FORMAT,
        translationResult.current.i18n.language
      )
    );
  });
});
