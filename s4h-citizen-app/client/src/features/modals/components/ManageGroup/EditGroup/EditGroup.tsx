import React from 'react';
import { useSelector } from 'react-redux';
import { selectGroupById } from '../../../../DocumentsViewer/reduxSlice';
import ModalWrapper from '../../../ModalWrapper';
import EditSimpleDocumentGroup from './EditSimpleDocumentGroup';

export interface Props {
  groupId: string;
}

const EditGroup: React.FC<Props> = ({ groupId }) => {
  const group = useSelector(state => selectGroupById(state, groupId));

  if (group?.groupType === 'Document') {
    return (
      <ModalWrapper className="ModalWrapper ModalWrapper--full-height">
        <EditSimpleDocumentGroup group={group} />
      </ModalWrapper>
    );
  }

  return null;
};

export default EditGroup;
