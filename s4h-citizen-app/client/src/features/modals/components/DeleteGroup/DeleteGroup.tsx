import { Group } from '@d4l/s4h-fhir-xforms';
import { unwrapResult } from '@reduxjs/toolkit';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { selectViewportSize, ViewportSize } from '../../../../redux/globalsSlice';
import {
  deleteGroup,
  deleteGroupItems,
  deselectGroup,
  selectAllGroups,
  setGroupActive,
  setGroupItemActive,
} from '../../../DocumentsViewer/reduxSlice';
import { hideModal } from '../../modalsSlice';
import ModalWrapper from '../../ModalWrapper';
import ModalButton from '../ModalButton';
import ModalFooter from '../ModalFooter';
import ModalHeader from '../ModalHeader';
import DeleteDocumentDialog from './DeleteDocumentDialog';
import './DeleteGroup.scss';
import DeleteTreatmentCourseDialog from './DeleteTreatmentCourseDialog';

export const findNextGroup = (groups: Group[], id: string): Group | undefined => {
  const idx = groups.findIndex(item => item.id === id);
  return idx > 0 ? groups[idx - 1] : groups.length > 1 ? groups[idx + 1] : undefined;
};

export interface Props {
  group: Group;
}

const DeleteGroup: React.FC<Props> = ({ group }) => {
  const { t } = useTranslation();
  const [isDeletionPending, setIsDeletionPending] = useState(false);
  const [shouldDeleteEntireGroup, setShouldDeleteEntireGroup] = useState(
    group.groupType === 'Document'
  );
  const [deleteableItemIds, setDeleteItemIds] = useState<string[]>([]);
  const [anyItemSelected, setAnyItemSelected] = useState<boolean>(
    deleteableItemIds.length > 0
  );

  const nextGroupToDisplay = useSelector(state =>
    findNextGroup(selectAllGroups(state), group.id)
  );
  const viewportSize = useSelector(selectViewportSize);

  const dispatch = useDispatch();

  const onClick = useCallback(async () => {
    setIsDeletionPending(true);

    try {
      if (shouldDeleteEntireGroup) {
        const deletionResult = await dispatch(deleteGroup(group));
        unwrapResult(deletionResult);
        if (viewportSize !== ViewportSize.WIDE) {
          dispatch(deselectGroup());
        } else {
          if (nextGroupToDisplay) {
            dispatch(setGroupActive(nextGroupToDisplay.id));
            dispatch(setGroupItemActive(nextGroupToDisplay.items[0]));
          } else {
            dispatch(deselectGroup());
          }
        }
      } else {
        const deletionResult = await dispatch(
          deleteGroupItems({
            deleteEntireGroup: false,
            group,
            groupItemIds: deleteableItemIds,
          })
        );
        unwrapResult(deletionResult);
      }
      dispatch(hideModal());
    } catch (serializedError) {
      setIsDeletionPending(false);
      // TODO: add a UI error messaging here instead of console.debug
      console.debug('delete request failed with id ' + group.id);
      console.error(serializedError);
    }
  }, [
    shouldDeleteEntireGroup,
    dispatch,
    group,
    viewportSize,
    nextGroupToDisplay,
    deleteableItemIds,
  ]);

  let doneLabel = t('delete');
  if (group.groupType === 'Course') {
    if (shouldDeleteEntireGroup) {
      doneLabel = t('delete_entire_treatment.button');
    }

    doneLabel = `${doneLabel} (${deleteableItemIds.length})`;
  }

  const title =
    group.groupType === 'Document' ? t('delete_document') : t('delete_treatment');

  const isDeleteButtonDisabled =
    isDeletionPending || (group.groupType === 'Course' && !anyItemSelected);

  return (
    <ModalWrapper className="ModalWrapper ModalWrapper--full-height">
      <>
        <ModalHeader title={title} />
        <section className="DeleteGroup__content">
          {group.groupType === 'Document' ? (
            <DeleteDocumentDialog />
          ) : (
            <DeleteTreatmentCourseDialog
              group={group}
              setDeleteAll={setShouldDeleteEntireGroup}
              setDeleteItemIds={setDeleteItemIds}
              setAnyItemSelected={setAnyItemSelected}
            />
          )}
        </section>
        <ModalFooter isCancelable>
          <ModalButton
            dataTest="doneBtn"
            disabled={isDeleteButtonDisabled}
            isLoading={isDeletionPending}
            onClick={onClick}
            text={doneLabel}
          />
        </ModalFooter>
      </>
    </ModalWrapper>
  );
};

export default DeleteGroup;
