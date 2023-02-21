/**
 * Tests were failing when custom history was included in index.js with
 * no good reason why. Extracting this to a separate dependency solved that
 * problem, what ever it was
 */

import { createBrowserHistory } from 'history';

/**
 * Using custom history and exporting it so we have access to route manipulation
 * in actions. This seems cleaner than passing history prop around to actions
 * callbacks and react-router should behave the same.
 */
const browserHistory = createBrowserHistory();

export default browserHistory;
