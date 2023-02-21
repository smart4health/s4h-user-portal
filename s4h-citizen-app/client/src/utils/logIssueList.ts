import { IssueList } from '@d4l/s4h-fhir-xforms';
import * as Sentry from '@sentry/browser';
import settings from './settings';

const logIssueList = (issueList: IssueList) => {
  issueList.forEach(issue => {
    switch (issue.severity) {
      case 'info':
        console.info(issue);
        break;
      case 'warning':
        console.warn(issue);
        break;
      case 'error':
        console.error(issue);
        if (settings.acceptsCookies) {
          Sentry.captureException(issue);
        }
        break;
      default:
        break;
    }
  });
};

export default logIssueList;
