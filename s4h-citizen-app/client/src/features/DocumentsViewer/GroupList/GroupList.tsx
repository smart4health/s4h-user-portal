import { Group as GroupType } from '@d4l/s4h-fhir-xforms';
import { Components } from '@d4l/web-components-library/dist/loader';
import React, { createRef, KeyboardEvent, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import TwoColumnSidebarHeader from '../../../components/TwoColumnSidebar/Header';
import { selectIsSharingMode } from '../../../redux/globalsSlice';
import { connect } from '../../../store';
import { RootState } from '../../../types';
import { pushTrackingEvent, TRACKING_EVENTS } from '../../../utils/analytics';
import { isArrowDown, isArrowUp } from '../../../utils/keyboardEvents';
import webComponentWrapper from '../../../utils/webComponentWrapper';
import Group from '../Group';
import { selectActiveGroupId, setGroupActive } from '../reduxSlice';
import './GroupList.scss';

type OwnProps = {
  groups: GroupType[];
  onAddButtonClick: () => void;
  rightColumnId: string;
};

type Props = OwnProps & {
  loggedIn: boolean;
};

const GroupList = (props: Props) => {
  const { groups, loggedIn, onAddButtonClick, rightColumnId } = props;

  const { t } = useTranslation();
  const { t: dt } = useTranslation('documents');
  const dispatch = useDispatch();

  const activeGroupId = useSelector(selectActiveGroupId);
  const isSharingMode = useSelector(selectIsSharingMode);

  const groupTabElements = useRef(groups.map(() => createRef<HTMLLIElement>()));
  const currentlyFocusedGroupTabIndex = useRef(0);

  const renderAddDocumentButton = (
    <d4l-button
      text={t('add_document')}
      // @ts-ignore TS-FIXME
      ref={webComponentWrapper<Components.D4lButton>({
        handleClick: () => {
          pushTrackingEvent(TRACKING_EVENTS.DOCUMENT_UPLOAD_START);
          onAddButtonClick();
        },
      })}
      classes="button--uppercase button--large"
      data-test="openDocumentUploadButton"
    />
  );

  const onKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
    const elementsCount = groupTabElements.current.length;
    const currentElementIndex = currentlyFocusedGroupTabIndex.current;
    const elements = groupTabElements.current;

    let newElementIndex = currentElementIndex;

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

    currentlyFocusedGroupTabIndex.current = newElementIndex;
  };

  return (
    <div className="GroupList">
      <TwoColumnSidebarHeader
        title={t('documents')}
        subtitle={dt('sidebar.subtitle')}
        hasActionButton={loggedIn && !isSharingMode}
        actionButton={renderAddDocumentButton}
      />
      <ul className="GroupList__content" role="tablist" aria-label={t('documents')}>
        {groups.map((group, index) => (
          <Group
            group={group}
            onSelect={() => {
              currentlyFocusedGroupTabIndex.current = index;
              dispatch(setGroupActive(group.id));
            }}
            onKeyDown={onKeyDown}
            key={group.id}
            showAsActive={group.id === activeGroupId}
            ref={groupTabElements.current[index]}
            rightColumnId={rightColumnId}
          />
        ))}
      </ul>
    </div>
  );
};

const GroupListConnectedToReactWaterfall = connect(({ loggedIn }: RootState) => ({
  loggedIn,
}))(GroupList);

export default GroupListConnectedToReactWaterfall;
