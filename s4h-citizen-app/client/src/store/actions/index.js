import globalActions from './globalActions';
import testActions from './testActions';

const waterfallActions = {
  ...globalActions,
  ...testActions,
};

export default waterfallActions;
