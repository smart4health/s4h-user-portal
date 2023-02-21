import isNil from './isNil';

const isEmpty = item => {
  if (isNil(item)) {
    return true;
  }
  if (typeof item === 'object') {
    if (Object.keys(item).length === 0) {
      return true;
    } else {
      return Object.values(item).every(value => !value);
    }
  }
};

export default isEmpty;
