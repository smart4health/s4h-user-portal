import { GroupItem } from '@d4l/s4h-fhir-xforms';
import { GroupItemTitles } from '../i18n';

const groupItemTitle = (groupItem: GroupItem): string => {
  if (groupItem.type === 'Questionnaire' && groupItem.thumbnailText) {
    return GroupItemTitles[groupItem.thumbnailText] ?? groupItem.thumbnailText;
  }

  if (groupItem.type === 'File') {
    return groupItem.title;
  }

  return 'N/A';
};

export default groupItemTitle;
