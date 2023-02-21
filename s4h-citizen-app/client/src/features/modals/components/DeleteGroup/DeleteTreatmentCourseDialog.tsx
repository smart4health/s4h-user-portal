import { ComplexCourseGroup } from '@d4l/s4h-fhir-xforms';
import { Components } from '@d4l/web-components-library/dist/loader';
import classNames from 'classnames';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import groupItemTitle from '../../../../utils/groupItemTitle';
import webComponentWrapper from '../../../../utils/webComponentWrapper';
import GroupItemThumbnail from '../../../DocumentsViewer/GroupItemThumbnail';
interface Props {
  group: ComplexCourseGroup;
  setDeleteAll: (deleteAll: boolean) => void;
  setDeleteItemIds: (ids: string[]) => void;
  setAnyItemSelected: (deletionPending: boolean) => void;
}

type Selection = Record<string, boolean>;

const DeleteTreatmentCourseDialog: React.FC<Props> = ({
  group,
  setDeleteAll,
  setDeleteItemIds,
  setAnyItemSelected,
}) => {
  const { t } = useTranslation();
  const [isAllSelected, setIsAllSelected] = useState(false);
  const initialSelection = group.items.reduce<Selection>((hash, { id }) => {
    hash[id] = false;
    return hash;
  }, {});
  const [selection, setSelection] = useState<Selection>(initialSelection);

  function selectAll(selected: boolean) {
    setIsAllSelected(selected);
    setDeleteAll(selected);
  }

  function select(selection: Selection) {
    const deleteableIds = Object.entries(selection)
      .filter(([_k, v]) => v)
      .map(([k, _v]) => k);
    setDeleteItemIds(deleteableIds);
    setSelection(selection);
    setAnyItemSelected(deleteableIds.length > 0);
  }

  function toggleSelectAll(selected: boolean) {
    const newSelection = Object.keys(selection).reduce((hash, id) => {
      hash[id] = selected;
      return hash;
    }, selection);
    selectAll(selected);
    select(newSelection);
  }

  function toggleSelect(itemId: string) {
    const newSelection = { ...selection, [itemId]: !selection[itemId] };
    const hasUnselectedValues = Object.values(newSelection).includes(false);
    selectAll(!hasUnselectedValues);
    select(newSelection);
  }

  return (
    <>
      <p>{t('delete_files_description')}</p>

      <d4l-checkbox
        checked={isAllSelected}
        class="DeleteGroup__selectAllCheckbox"
        /*
        // @ts-ignore */
        key={`select_all_checkbox-${isAllSelected}`}
        label={t('select_all')}
        name="select_all_checkbox"
        /*
        // @ts-ignore */
        ref={webComponentWrapper<Components.D4lCheckbox>({
          checkboxId: 'select_all_checkbox',
          // @ts-ignore
          handleChange: e => toggleSelectAll(e.target?.checked),
        })}
      />

      <div className="DeleteGroup__divider" />

      <div className="DeleteGroup__itemList">
        {group.items.map(item => (
          <div className="DeleteGroup__deleteableItem" key={item.id}>
            <div className="DeleteGroup__deleteableItemThumbnail">
              <GroupItemThumbnail
                groupItem={item}
                isActive={selection[item.id]}
                isLarger
                isSquare
                onSelect={() => toggleSelect(item.id)}
              />
              <input
                className={classNames('DeleteGroup__selectOneCheckbox', {
                  'DeleteGroup__selectOneCheckbox--checked': selection[item.id],
                })}
                type="checkbox"
                onClick={() => toggleSelect(item.id)}
              />
            </div>
            <div className="DeleteGroup__deleteableItemMeta">
              <h6>{groupItemTitle(item)}</h6>
              {item.date && <p>{new Date(item.date).toLocaleDateString()}</p>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default DeleteTreatmentCourseDialog;
