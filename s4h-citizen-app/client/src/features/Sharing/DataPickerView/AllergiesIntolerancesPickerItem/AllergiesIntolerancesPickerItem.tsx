import { AllergyIntolerance } from '@d4l/s4h-fhir-xforms';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import webComponentWrapper from '../../../../utils/webComponentWrapper';
import {
  addToSharingData,
  removeFromSharingData,
  selectSharingAllergiesIntolerancesIds,
  ShareableFeatures,
} from '../../reduxSlice';
import './AllergiesIntolerancesPickerItem.scss';

interface Props {
  allergyIntolerance: AllergyIntolerance;
}

const AllergiesIntolerancesPickerItem: React.FC<Props> = ({
  allergyIntolerance,
}) => {
  const dispatch = useDispatch();

  const currentlySelectedAllergiesTolerancesIds = useSelector(
    selectSharingAllergiesIntolerancesIds
  );

  const handleAllergyIntoleranceSelect = useCallback(() => {
    if (
      currentlySelectedAllergiesTolerancesIds.includes(
        allergyIntolerance.allergyIntoleranceId
      )
    ) {
      dispatch(
        removeFromSharingData({
          type: ShareableFeatures.ALLERGIES_INTOLERANCES,
          ids: [allergyIntolerance.allergyIntoleranceId],
        })
      );
    } else {
      dispatch(
        addToSharingData({
          type: ShareableFeatures.ALLERGIES_INTOLERANCES,
          ids: [allergyIntolerance.allergyIntoleranceId],
        })
      );
    }
  }, [
    currentlySelectedAllergiesTolerancesIds,
    allergyIntolerance.allergyIntoleranceId,
    dispatch,
  ]);

  return (
    <li className="AllergiesIntolerancesPickerItem">
      <d4l-checkbox
        classes="AllergiesIntolerancesPickerItem__checkbox"
        checkbox-id={`d4l-checkbox-${allergyIntolerance.allergyIntoleranceId}`}
        checked={currentlySelectedAllergiesTolerancesIds.includes(
          allergyIntolerance.allergyIntoleranceId
        )}
        label={allergyIntolerance.code?.resolvedText}
        reversed={true}
        // @ts-ignore */
        ref={webComponentWrapper({
          handleChange: () => handleAllergyIntoleranceSelect(),
        })}
      />
    </li>
  );
};

export default AllergiesIntolerancesPickerItem;
