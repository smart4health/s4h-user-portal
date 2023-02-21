import { MedicationStatement } from '@d4l/s4h-fhir-xforms';
import classNames from 'classnames';
import {
  addDays,
  addMinutes,
  isAfter,
  isBefore,
  isSameDay,
  isValid,
  setHours,
  setMinutes,
  setSeconds,
  subDays,
} from 'date-fns';
import i18next from 'i18next';
import React, { forwardRef, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Tag from '../../../components/Tag';
import {
  formatDate,
  getMedicationDateFormattingByLanguage,
} from '../../../utils/dateHelper';
import { isEnter, isSpacebar } from '../../../utils/keyboardEvents';
import './MedicationSidebarItem.scss';

type Props = {
  medication: MedicationStatement;
  onSelect: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLLIElement>) => void;
  showAsActive: boolean;
  rightColumnId: string;
};

export const WAITING_PERIOD = 7;

export const isWithinDateRange = (
  date: Date,
  earliestDate: Date,
  latestDate: Date
) => {
  return isAfter(date, earliestDate) && isBefore(date, latestDate);
};

export const determineIsCurrent = (
  waitingPeriod: number,
  from: Date,
  to: Date
): boolean => {
  const todayEarlyTime = setSeconds(setMinutes(setHours(new Date(), 0), 0), 0);
  const todayLateTime = setSeconds(setMinutes(setHours(new Date(), 23), 59), 59);
  const earliestDate = subDays(todayEarlyTime, waitingPeriod);
  const latestDate = addDays(todayLateTime, waitingPeriod);

  if (isValid(from) && isValid(to)) {
    return (
      isWithinDateRange(from, earliestDate, latestDate) ||
      isWithinDateRange(to, earliestDate, latestDate) ||
      (isBefore(from, earliestDate) && isAfter(to, latestDate))
    );
  }

  if (isValid(from)) {
    return isBefore(from, latestDate) || isSameDay(from, latestDate);
  }

  if (isValid(to)) {
    const after = isAfter(to, earliestDate);
    const equal = isSameDay(to, earliestDate);
    return after || equal;
  }

  return true;
};

export const determineDateLabel = (
  fromDate: string | undefined,
  untilDate: string | undefined,
  asTag?: boolean
) => {
  if (fromDate && untilDate) {
    const onDateLabel = `${i18next.t('medication.on_date.title')} ${fromDate}`;
    const fromDateLabel = `${i18next.t('medication.from_date.title')} ${fromDate}`;
    const untilDateLabel = `${i18next
      .t('medication.until_date.title')
      .toLowerCase()} ${untilDate}`;

    if (fromDate === untilDate) {
      return asTag ? <Tag text={onDateLabel} /> : onDateLabel;
    }

    return asTag ? (
      <>
        <Tag text={fromDateLabel} />
        <Tag text={untilDateLabel} />
      </>
    ) : (
      <>
        {fromDateLabel} {untilDateLabel}
      </>
    );
  }

  if (fromDate) {
    const label = `${i18next.t('medication.from_date.title')} ${fromDate}`;
    return asTag ? <Tag text={label} /> : label;
  }

  if (untilDate) {
    const label = `${i18next.t('medication.until_date.title')} ${untilDate}`;
    return asTag ? <Tag text={label} /> : label;
  }

  return '';
};

export const MedicationSidebarItem = forwardRef<HTMLLIElement, Props>(
  ({ medication, onSelect, onKeyDown, showAsActive, rightColumnId }, ref) => {
    const { t, i18n } = useTranslation();

    const { min, max } = medication.period;
    const fromDate = addMinutes(new Date(min), new Date(min).getTimezoneOffset());
    const untilDate = addMinutes(new Date(max), new Date(max).getTimezoneOffset());

    const isCurrent = determineIsCurrent(WAITING_PERIOD, fromDate, untilDate);

    const formattedFromDate = isValid(fromDate)
      ? formatDate(
          fromDate,
          getMedicationDateFormattingByLanguage(i18n.language),
          i18n.language
        )
      : undefined;

    const formattedUntilDate = isValid(untilDate)
      ? formatDate(
          untilDate,
          getMedicationDateFormattingByLanguage(i18n.language),
          i18n.language
        )
      : undefined;

    const dateLabel = determineDateLabel(formattedFromDate, formattedUntilDate);

    const medicationActiveClass = classNames('MedicationSidebarItem', {
      'MedicationSidebarItem--active': showAsActive,
    });

    return (
      <li
        className={medicationActiveClass}
        onKeyUp={event => {
          if (isSpacebar(event) || isEnter(event)) {
            onSelect();
          }
        }}
        onKeyDown={onKeyDown}
        onClick={onSelect}
        data-test="documentRoot"
        ref={ref}
        role="tab"
        aria-controls={rightColumnId}
        aria-selected={showAsActive}
        // Roving tab index technique: With tabindex 0 for the currently selected element
        // and tabindex -1 for all the others we achieve that the user only can tab to
        // the selected element. tabindex -1 is a browser hack to make something unfocusable
        // by the user while still keeping the ability to programmatically focus it. Once
        // the currently selected element switches it becomes the focusable one with tabindex 0
        // and all the others become unfocusable (hence "roving").
        tabIndex={showAsActive ? 0 : -1}
      >
        <div className="MedicationSidebarItem__title-wrapper">
          <h6 className="MedicationSidebarItem__title">
            {medication.code.resolvedText || t('medication.description.infotext')}
          </h6>
          {isCurrent && (
            <span
              data-test="currentIndicator"
              className="MedicationSidebarItem__current-label"
            >
              {t('medication.sidebarItem.infotext')}
            </span>
          )}
        </div>
        <div className="MedicationSidebarItem__content">
          <span className="MedicationSidebarItem__creationDate">{dateLabel}</span>
        </div>
      </li>
    );
  }
);

export default MedicationSidebarItem;
