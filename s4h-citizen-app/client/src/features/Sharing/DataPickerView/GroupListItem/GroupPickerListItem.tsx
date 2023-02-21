import { Group } from '@d4l/s4h-fhir-xforms';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import groupTitle from '../../../../utils/groupTitle';
import webComponentWrapper from '../../../../utils/webComponentWrapper';
import { selectHealthDataInputResourceIdsForGroup } from '../../../DocumentsViewer/reduxSlice';
import {
  addToSharingData,
  addToSharingGroupIds,
  removeFromSharingData,
  removeFromSharingGroupIds,
  selectSharingHealthDataIds,
  ShareableFeatures,
} from '../../reduxSlice';
import './GroupPickerListItem.scss';

interface Props {
  group: Group;
}

const GroupPickerListItem: React.FC<Props> = ({ group }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const selectedHealthDataIds = useSelector(selectSharingHealthDataIds);
  const resourceIds = useSelector(state =>
    selectHealthDataInputResourceIdsForGroup(state, group.id)
  );

  const handleGroupSelect = useCallback(
    (resourceIds: string[]) => {
      if (resourceIds.every(id => selectedHealthDataIds.includes(id))) {
        dispatch(
          removeFromSharingData({
            type: ShareableFeatures.DOCUMENTS,
            ids: resourceIds,
          })
        );
        dispatch(removeFromSharingGroupIds([group.id]));
      } else {
        dispatch(
          addToSharingData({ type: ShareableFeatures.DOCUMENTS, ids: resourceIds })
        );
        dispatch(addToSharingGroupIds([group.id]));
      }
    },
    [selectedHealthDataIds, dispatch, group.id]
  );

  let listItemLabel =
    group.groupType === 'Document'
      ? groupTitle(group)
      : groupTitle(group) +
        ` (${t('document.item.count', { count: group.items.length })})`;

  return (
    <li className="GroupPickerListItem">
      <d4l-checkbox
        classes="GroupPickerListItem__checkbox"
        checkbox-id={`d4l-checkbox-${group.id}`}
        checked={resourceIds.every((id: string) =>
          selectedHealthDataIds.includes(id)
        )}
        label={listItemLabel}
        reversed={true}
        data-test="DocumentSelectionCheck"
        // @ts-ignore */
        ref={webComponentWrapper({
          handleChange: () => handleGroupSelect(resourceIds),
        })}
      />
    </li>
  );
};

export default GroupPickerListItem;
