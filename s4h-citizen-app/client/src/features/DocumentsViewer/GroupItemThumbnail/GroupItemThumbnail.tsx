import { FileGroupItem, QuestionnaireGroupItem } from '@d4l/s4h-fhir-xforms';
import React from 'react';
import FileThumbnail from './FileThumbnail';
import './GroupItemThumbnail.scss';
import QuestionnaireThumbnail from './QuestionnaireThumbnail';

interface Props {
  groupItem: FileGroupItem | QuestionnaireGroupItem;
  isActive: boolean;
  isLarger?: boolean;
  isSquare?: boolean;
  onSelect: () => void;
  isButton?: boolean;
}

const GroupItemThumbnail: React.FC<Props> = ({ groupItem, ...props }) => {
  if (groupItem.type === 'File') {
    return <FileThumbnail groupItem={groupItem} {...props} />;
  }

  if (groupItem.type === 'Questionnaire') {
    return <QuestionnaireThumbnail groupItem={groupItem} {...props} />;
  }

  return <div>N/A</div>;
};

export default GroupItemThumbnail;
