import { FileGroupItem, Group, GroupItem } from '@d4l/s4h-fhir-xforms';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import GroupItemThumbnail from '../GroupItemThumbnail';
import { setGroupItemActive } from '../reduxSlice';
import './GroupItemThumbnailSlider.scss';

interface OwnProps {
  group: Group;
  groupItem?: GroupItem;
}

export interface GroupItemThumbnailProps<T> {
  groupItem: T;
  isActive: boolean;
  onSelect: () => void;
}

const mapDispatchToProps = {
  setGroupItemActive,
};

const connector = connect(undefined, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = OwnProps & PropsFromRedux;

const GroupItemThumbnailSlider = (props: Props) => {
  const { group, groupItem: activeGroupItem, setGroupItemActive } = props;

  function makeGroupItemThumbnail(groupItem: GroupItem | FileGroupItem) {
    if (groupItem.type === 'File') {
      const activeGroupItemId =
        activeGroupItem?.type === 'File'
          ? activeGroupItem.fileId
          : activeGroupItem?.id;
      return (
        <GroupItemThumbnail
          key={groupItem.id}
          groupItem={groupItem}
          isActive={groupItem.fileId === activeGroupItemId}
          onSelect={() => {
            setGroupItemActive(groupItem);
            document.querySelector('.QuestionnaireView')?.scrollTo(0, 0);
            document
              .querySelector('.TwoColumnCardLayout__right-column')
              ?.scrollIntoView();
          }}
          isButton
        />
      );
    } else if (groupItem.type === 'Questionnaire') {
      return (
        <GroupItemThumbnail
          key={groupItem.id}
          groupItem={groupItem}
          isActive={groupItem.id === activeGroupItem?.id}
          onSelect={() => {
            setGroupItemActive(groupItem);
            document.querySelector('.QuestionnaireView')?.scrollTo(0, 0);
            document
              .querySelector('.TwoColumnCardLayout__right-column')
              ?.scrollIntoView();
          }}
          isButton
        />
      );
    }
  }

  const groupItemThumbnails =
    group.groupType === 'Course'
      ? group.items.map(makeGroupItemThumbnail)
      : group.items.map(makeGroupItemThumbnail);

  return (
    <div className="GroupItemThumbnailSlider">
      <div className="GroupItemThumbnailSlider__wrapper">{groupItemThumbnails}</div>
    </div>
  );
};

export default connector(GroupItemThumbnailSlider);
