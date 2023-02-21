import { Button, Menu, MenuItem } from '@material-ui/core';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectActiveConditionsIds,
  selectAllConditionIds,
  selectAllConditions,
  selectConditionsCount,
} from '../../../Summary/Conditions/reduxSlice';
import {
  addToSharingData,
  removeFromSharingData,
  selectSharingConditionsIds,
  ShareableFeatures,
} from '../../reduxSlice';
import ConditionsPickerItem from '../ConditionsPickerItem';

const ConditionsPicker: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const conditionsCount = useSelector(selectConditionsCount);
  const conditions = useSelector(selectAllConditions);
  const allConditionIds = useSelector(selectAllConditionIds);
  const activeConditionIds = useSelector(selectActiveConditionsIds);
  const selectedConditionIds = useSelector(selectSharingConditionsIds);

  const [isConditionsSelectorMenuOpen, setIsConditionsSelectorMenuOpen] =
    useState(false);

  const toggleConditionsSelectorMenu = () => {
    setIsConditionsSelectorMenuOpen(previous => !previous);
  };

  const handleSelectAllClicked = () => {
    setIsConditionsSelectorMenuOpen(false);
    dispatch(
      addToSharingData({
        type: ShareableFeatures.CONDITIONS,
        ids: allConditionIds,
      })
    );
  };

  const handleSelectNoneClicked = () => {
    setIsConditionsSelectorMenuOpen(false);
    dispatch(
      removeFromSharingData({
        type: ShareableFeatures.CONDITIONS,
        ids: allConditionIds,
      })
    );
  };

  const handleSelectActiveClicked = () => {
    setIsConditionsSelectorMenuOpen(false);
    dispatch(
      removeFromSharingData({
        type: ShareableFeatures.CONDITIONS,
        ids: allConditionIds,
      })
    );
    dispatch(
      addToSharingData({
        type: ShareableFeatures.CONDITIONS,
        ids: activeConditionIds,
      })
    );
  };

  const conditionsSelectorButtonRef = useRef(null);

  const selectAllLabel = t('sharing.all.button');
  const selectNoneLabel = t('sharing.none.button');
  const selectActiveLabel = t('sharing.active.button');

  return (
    <li
      className="DataPickerView__feature-item"
      data-testid="datapickerview-conditions-list"
    >
      <div className="DataPickerView__list-item">
        <h2>
          {t('sharing.conditions.title')} (
          {t('sharing.selected.count', { count: selectedConditionIds.length })})
        </h2>
        {conditionsCount > 1 && (
          <>
            <Button
              id="conditions-selector-menu-button"
              className="DataPickerView__selector-menu-button"
              ref={conditionsSelectorButtonRef}
              onClick={toggleConditionsSelectorMenu}
              endIcon={<d4l-icon-arrow />}
              aria-haspopup="true"
              aria-controls="conditions-selector-menu"
              aria-expanded={isConditionsSelectorMenuOpen || undefined}
            >
              {t('sharing.select.button')}
            </Button>
            <Menu
              id="conditions-selector-menu"
              aria-labelledby="conditions-selector-menu-button"
              anchorEl={conditionsSelectorButtonRef.current}
              anchorOrigin={{
                horizontal: 'right',
                vertical: 'top',
              }}
              transformOrigin={{
                horizontal: 'right',
                vertical: 'top',
              }}
              getContentAnchorEl={null}
              open={isConditionsSelectorMenuOpen}
              keepMounted
              onClose={toggleConditionsSelectorMenu}
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
        {conditions.map(condition => (
          <ConditionsPickerItem condition={condition} key={condition.problemId} />
        ))}
      </ul>
    </li>
  );
};

export default ConditionsPicker;
