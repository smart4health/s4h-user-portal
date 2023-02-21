import classNames from 'classnames';
import React, { useEffect } from 'react';
import { connect, ConnectedProps, useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../redux';
import { selectIsSharingMode } from '../../../redux/globalsSlice';
import { getProvenance, selectProvenanceById } from '../../../redux/provenanceSlice';
import groupTitle from '../../../utils/groupTitle';
import GroupHeader from '../GroupHeader';
import ErrorView from '../GroupItem/ErrorView';
import FileView from '../GroupItem/FileView/FileView';
import QuestionnaireView from '../GroupItem/QuestionnaireView/QuestionnaireView';
import GroupItemThumbnailSlider from '../GroupItemThumbnailSlider';
import {
  fetchFiles,
  selectActiveGroupItem,
  selectFilesLoadedStatus,
  selectGroupById,
} from '../reduxSlice';
import './GroupDetails.scss';

interface OwnProps {
  domId: string;
}

const mapStateToProps = (state: AppState) => ({
  group: selectGroupById(state, state.documentsViewer.activeGroupId ?? ''),
  groupItem: selectActiveGroupItem(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = OwnProps & PropsFromRedux;

const GroupDetails = (props: Props) => {
  const { group, groupItem, domId } = props;
  const groupId = group?.id ?? '';
  const isGroupFilesNotLoaded = useSelector(state =>
    selectFilesLoadedStatus(groupId)(state)
  );
  const provenances = useSelector(state => selectProvenanceById(state, groupId));
  const activeGroupItem = useSelector(selectActiveGroupItem);
  const isSharing = useSelector(selectIsSharingMode);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isGroupFilesNotLoaded) {
      const documentIds = group?.items
        // @ts-ignore TS-FIXME
        .filter(groupItem => groupItem.type === 'File')
        // @ts-ignore TS-FIXME
        .map(groupItem => groupItem.id);

      dispatch(fetchFiles(documentIds));
    }
  }, [dispatch, group, isGroupFilesNotLoaded]);

  useEffect(
    function fetchProvenance() {
      if (!isSharing) {
        if (!provenances && activeGroupItem && activeGroupItem.identifier.length) {
          dispatch(
            getProvenance({
              resourceId: groupId,
              resourceIdentifiers: [activeGroupItem.identifier],
            })
          );
        }
      }
    },
    [activeGroupItem, dispatch, groupId, isSharing, provenances]
  );

  const className = classNames('GroupDetails', {
    'GroupDetails--hide-mobile': !group,
  });

  if (group === undefined) {
    return <div className={className}></div>;
  }
  return (
    <div
      id={domId}
      className={className}
      tabIndex={0}
      role="tabpanel"
      aria-label={groupTitle(group)}
    >
      <GroupHeader group={group} groupItem={groupItem} />
      {group.items.length > 1 ? (
        <GroupItemThumbnailSlider group={group} groupItem={groupItem} />
      ) : null}
      {groupItem ? (
        groupItem.type === 'File' ? (
          <FileView groupItem={groupItem} />
        ) : (
          <QuestionnaireView groupItem={groupItem} />
        )
      ) : (
        <ErrorView />
      )}
    </div>
  );
};

export default connector(GroupDetails);
