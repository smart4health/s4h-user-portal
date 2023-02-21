/** The component renders the menu list in support legal pages
 * and in documents and medical history.*/

import classnames from 'classnames';
import React, { createRef, KeyboardEvent, useRef } from 'react';
import { matchPath, NavLink, useLocation } from 'react-router-dom';
import {
  isArrowDown,
  isArrowUp,
  isEnter,
  isSpacebar,
} from '../../utils/keyboardEvents';
import './MenuList.scss';

export type SidebarListItem = {
  title: string;
  path: string;
  disabled?: boolean;
};

interface Props {
  items: SidebarListItem[];
  title: string;
  rightColumnId: string;
}
const TwoColumnSidebarMenuList = (props: Props) => {
  const linkClasses = (item: SidebarListItem) =>
    classnames('TwoColumnSidebarMenuListItem', {
      'TwoColumnSidebarMenuListItem--is-disabled': item.disabled ?? false,
    });
  const location = useLocation();
  const menuListElements = useRef(
    props.items.map(() => createRef<HTMLAnchorElement>())
  );
  const currentlyFocusedItemTabIndex = useRef(0);

  const isActiveRoute = (path: string): boolean => {
    const match = matchPath(location.pathname, {
      path,
      exact: true,
      strict: false,
    });
    return match?.isExact ?? false;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
    const elementsCount = menuListElements.current.length;
    const currentElementIndex = currentlyFocusedItemTabIndex.current;
    const elements = menuListElements.current;
    let newElementIndex = currentElementIndex;
    if (isSpacebar(event) || isEnter(event)) {
      event.currentTarget.click();
    }
    if (isArrowDown(event)) {
      currentElementIndex === elementsCount - 1
        ? (newElementIndex = 0)
        : (newElementIndex = currentElementIndex + 1);
    }
    if (isArrowUp(event)) {
      currentElementIndex === 0
        ? (newElementIndex = elementsCount - 1)
        : (newElementIndex = currentElementIndex - 1);
    }
    const elementToBeFocused = elements[newElementIndex].current;
    elementToBeFocused?.focus();
    currentlyFocusedItemTabIndex.current = newElementIndex;
  };

  return (
    <ul className="TwoColumnSidebarMenuList" role="tablist" aria-label={props.title}>
      {props.items.map((item, index) => (
        <NavLink
          className={linkClasses(item)}
          activeClassName="TwoColumnSidebarMenuListItem--is-active"
          key={item.title}
          role="tab"
          aria-selected={isActiveRoute(item.path)}
          tabIndex={isActiveRoute(item.path) ? 0 : -1}
          aria-controls={props.rightColumnId}
          onKeyDown={handleKeyDown}
          ref={menuListElements.current[index]}
          to={item.path}
        >
          {item.title}
        </NavLink>
      ))}
    </ul>
  );
};

export default TwoColumnSidebarMenuList;
