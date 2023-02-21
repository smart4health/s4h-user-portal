const isArrayEqual = (arrayOne: Array<any>, arrayTwo: Array<any>): boolean => {
  if (arrayOne == null || arrayTwo == null) return false;
  if (arrayOne === arrayTwo) return true;
  if (arrayOne.length !== arrayTwo.length) return false;
  const sortedArrayOne = arrayOne.slice().sort();
  const sortedArrayTwo = arrayTwo.slice().sort();

  for (let i = 0; i < sortedArrayOne.length; i = i + 1) {
    if (sortedArrayOne[i] !== sortedArrayTwo[i]) return false;
  }
  return true;
};

export default isArrayEqual;
