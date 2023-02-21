import { Button, Menu, MenuItem } from '@material-ui/core';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectActiveAllergiesIntolerancesIds,
  selectAllAllergiesIntolerances,
  selectAllAllergiesIntolerancesIds,
  selectAllergiesIntolerancesCount,
} from '../../../Summary/AllergiesIntolerances/reduxSlice';
import {
  addToSharingData,
  removeFromSharingData,
  selectSharingAllergiesIntolerancesIds,
  ShareableFeatures,
} from '../../reduxSlice';
import AllergiesIntolerancesPickerItem from '../AllergiesIntolerancesPickerItem';

const AllergiesIntolerancesPicker: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const allergiesIntolerancesCount = useSelector(selectAllergiesIntolerancesCount);
  const allergiesIntolerances = useSelector(selectAllAllergiesIntolerances);
  const allAllergiesIntolerancesIds = useSelector(selectAllAllergiesIntolerancesIds);
  const activeAllergiesIntolerancesIds = useSelector(
    selectActiveAllergiesIntolerancesIds
  );
  const selectedAllergiesIntolerancesIds = useSelector(
    selectSharingAllergiesIntolerancesIds
  );

  const [
    isAllergiesIntolerancesSelectorMenuOpen,
    setIsAllergiesIntolerancesSelectorMenuOpen,
  ] = useState(false);

  const toggleAllergiesIntolerancesSelectorMenu = () => {
    setIsAllergiesIntolerancesSelectorMenuOpen(previous => !previous);
  };

  const handleSelectAllClicked = () => {
    setIsAllergiesIntolerancesSelectorMenuOpen(false);
    dispatch(
      addToSharingData({
        type: ShareableFeatures.ALLERGIES_INTOLERANCES,
        ids: allAllergiesIntolerancesIds,
      })
    );
  };

  const handleSelectNoneClicked = () => {
    setIsAllergiesIntolerancesSelectorMenuOpen(false);
    dispatch(
      removeFromSharingData({
        type: ShareableFeatures.ALLERGIES_INTOLERANCES,
        ids: allAllergiesIntolerancesIds,
      })
    );
  };

  const handleSelectActiveClicked = () => {
    setIsAllergiesIntolerancesSelectorMenuOpen(false);
    dispatch(
      removeFromSharingData({
        type: ShareableFeatures.ALLERGIES_INTOLERANCES,
        ids: allAllergiesIntolerancesIds,
      })
    );
    dispatch(
      addToSharingData({
        type: ShareableFeatures.ALLERGIES_INTOLERANCES,
        ids: activeAllergiesIntolerancesIds,
      })
    );
  };

  const allergiesIntolerancesSelectorButtonRef = useRef(null);

  const selectAllLabel = t('sharing.all.button');
  const selectNoneLabel = t('sharing.none.button');
  const selectActiveLabel = t('sharing.active.button');

  return (
    <li
      className="DataPickerView__feature-item"
      data-testid="datapickerview-allergies-intolerances-list"
    >
      <div className="DataPickerView__list-item">
        <h2>
          {t('sharing.allergies_intolerances.title')} (
          {t('sharing.selected.count', {
            count: selectedAllergiesIntolerancesIds.length,
          })}
          )
        </h2>
        {allergiesIntolerancesCount > 1 && (
          <>
            <Button
              id="allergies-intolerances-selector-menu-button"
              className="DataPickerView__selector-menu-button"
              ref={allergiesIntolerancesSelectorButtonRef}
              onClick={toggleAllergiesIntolerancesSelectorMenu}
              endIcon={<d4l-icon-arrow />}
              aria-haspopup="true"
              aria-controls="allergies-intolerances-selector-menu"
              aria-expanded={isAllergiesIntolerancesSelectorMenuOpen || undefined}
            >
              {t('sharing.select.button')}
            </Button>
            <Menu
              id="allergies-intolerances-selector-menu"
              aria-labelledby="allergies-intolerances-selector-menu-button"
              anchorEl={allergiesIntolerancesSelectorButtonRef.current}
              anchorOrigin={{
                horizontal: 'right',
                vertical: 'top',
              }}
              transformOrigin={{
                horizontal: 'right',
                vertical: 'top',
              }}
              getContentAnchorEl={null}
              open={isAllergiesIntolerancesSelectorMenuOpen}
              keepMounted
              onClose={toggleAllergiesIntolerancesSelectorMenu}
            >
              <MenuItem onClick={handleSelectAllClicked}>{selectAllLabel}</MenuItem>
              <MenuItem onClick={handleSelectActiveClicked}>
                {selectActiveLabel}
              </MenuItem>
              <MenuItem onClick={handleSelectNoneClicked}>
                {selectNoneLabel}
              </MenuItem>
            </Menu>
          </>
        )}
      </div>
      <ul className="DataPickerView__feature-item">
        {allergiesIntolerances.map(allergyIntolerance => (
          <AllergiesIntolerancesPickerItem
            allergyIntolerance={allergyIntolerance}
            key={allergyIntolerance.allergyIntoleranceId}
          />
        ))}
      </ul>
    </li>
  );
};

export default AllergiesIntolerancesPicker;
