import { Group } from '@d4l/s4h-fhir-xforms';
import i18n, { TreatmentCourseTitles } from '../i18n';

const groupTitle = (group: Group): string => {
  if (group.groupType === 'Document') {
    return group.title;
  } else if (group.groupType === 'Course') {
    return group.courseTypes.reduce((prev, next) => {
      const key = next.split('$$')[1];
      return i18n.t(`${prev}${TreatmentCourseTitles[key] ?? ''}`);
    }, '');
  }

  return 'unknown';
};

export default groupTitle;
