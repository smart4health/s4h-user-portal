import { Problem } from '@d4l/s4h-fhir-xforms';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useExtractConditionDescription from '../../../../hooks/useExtractConditionDescription';
import webComponentWrapper from '../../../../utils/webComponentWrapper';
import {
  addToSharingData,
  removeFromSharingData,
  selectSharingConditionsIds,
  ShareableFeatures,
} from '../../reduxSlice';
import './ConditionsPickerItem.scss';

interface Props {
  condition: Problem;
}

const ConditionsPickerItem: React.FC<Props> = ({ condition }) => {
  const dispatch = useDispatch();

  const extractDescription = useExtractConditionDescription();

  const currentlySelectedConditionsIds = useSelector(selectSharingConditionsIds);

  const handleConditionSelect = useCallback(() => {
    if (currentlySelectedConditionsIds.includes(condition.problemId)) {
      dispatch(
        removeFromSharingData({
          type: ShareableFeatures.CONDITIONS,
          ids: [condition.problemId],
        })
      );
    } else {
      dispatch(
        addToSharingData({
          type: ShareableFeatures.CONDITIONS,
          ids: [condition.problemId],
        })
      );
    }
  }, [currentlySelectedConditionsIds, condition.problemId, dispatch]);

  const labelText = extractDescription(condition);

  return (
    <li className="ConditionsPickerItem">
      <d4l-checkbox
        classes="ConditionsPickerItem__checkbox"
        checkbox-id={`d4l-checkbox-${condition.problemId}`}
        checked={currentlySelectedConditionsIds.includes(condition.problemId)}
        label={labelText}
        reversed={true}
        // @ts-ignore */
        ref={webComponentWrapper({
          handleChange: () => handleConditionSelect(),
        })}
      />
    </li>
  );
};

export default ConditionsPickerItem;
