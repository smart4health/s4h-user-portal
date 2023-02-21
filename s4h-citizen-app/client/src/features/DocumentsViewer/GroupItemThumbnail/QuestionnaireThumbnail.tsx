import { QuestionnaireGroupItem } from '@d4l/s4h-fhir-xforms';
import React from 'react';
import ThumbnailButton from './ThumbnailButton';

interface Props {
  groupItem: QuestionnaireGroupItem;
  isActive: boolean;
  isLarger?: boolean;
  isSquare?: boolean;
  onSelect: () => void;
  isButton?: boolean;
}
const QuestionnaireThumbnail: React.FC<Props> = ({
  groupItem,
  isActive,
  isLarger,
  isSquare,
  onSelect,
  isButton = false,
}) => {
  return (
    <ThumbnailButton
      onClick={onSelect}
      isActive={isActive}
      isLarger={isLarger}
      isSquare={isSquare}
      className="GroupItemThumbnail--questionnaire"
      isButton={isButton}
    >
      {groupItem.thumbnailText || 'n\\a'}
    </ThumbnailButton>
  );
};

export default QuestionnaireThumbnail;
