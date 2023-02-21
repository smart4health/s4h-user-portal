import { Group as GroupType } from '@d4l/s4h-fhir-xforms';
import classNames from 'classnames';
import React, { forwardRef, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import useGetFormattedDate from '../../../hooks/useGetFormattedDate';
import { DOCUMENT_VIEW_DATE_FORMAT } from '../../../utils/dateHelper';
import groupTitle from '../../../utils/groupTitle';
import { isEnter, isSpacebar } from '../../../utils/keyboardEvents';
import {
  selectIsGroupRecentlyAdded,
  selectIsGroupRecentlyEdited,
} from '../reduxSlice';
import './Group.scss';

type Props = {
  group: GroupType;
  onSelect: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLLIElement>) => void;
  showAsActive: boolean;
  rightColumnId: string;
};

export const Group = forwardRef<HTMLLIElement, Props>((props, ref) => {
  const { group, onSelect, onKeyDown, showAsActive, rightColumnId } = props;
  const { t } = useTranslation();
  const getFormattedDate = useGetFormattedDate();
  const isNew = useSelector(state => selectIsGroupRecentlyAdded(state, group.id));
  const isEdited = useSelector(state =>
    selectIsGroupRecentlyEdited(state, group.id)
  );

  if (!group) {
    return null;
  }

  const groupActiveClass = classNames('Group', {
    'Group--active': showAsActive,
  });

  const count = group.items.length;
  const title = groupTitle(group);

  return (
    <li
      className={groupActiveClass}
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
      aria-selected={showAsActive}
      aria-controls={rightColumnId}
      // Roving tab index technique: With tabindex 0 for the currently selected element
      // and tabindex -1 for all the others we achieve that the user only can tab to
      // the selected element. tabindex -1 is a browser hack to make something unfocusable
      // by the user while still keeping the ability to programmatically focus it. Once
      // the currently selected element switches it becomes the focusable one with tabindex 0
      // and all the others become unfocusable (hence "roving").
      tabIndex={showAsActive ? 0 : -1}
    >
      <h6 className="Group__title">
        {title}
        {isNew && <span data-test="newIndicator">{t('new')}</span>}
        {isEdited && <span data-test="editIndicator">{t('updated')}</span>}
      </h6>
      <div className="Group__content">
        <span>
          {group.groupType === 'Document' &&
            t('document.shareable_record.count', { count })}
          {group.groupType === 'Course' && t('document.item.count', { count })}
        </span>
        <span className="Group__creation-date">
          {getFormattedDate(
            new Date(group.date as string),
            DOCUMENT_VIEW_DATE_FORMAT
          )}
        </span>
      </div>
    </li>
  );
});

export default Group;
