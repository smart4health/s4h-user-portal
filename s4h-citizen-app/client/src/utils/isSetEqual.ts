const isSetEqual = (set1: Set<any>, set2: Set<any>): boolean => {
  if (set1.size !== set2.size) return false;

  for (const element of set1) {
    if (!set2.has(element)) return false;
  }

  return true;
};

export default isSetEqual;
