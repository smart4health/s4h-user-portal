/**
 * List of all possible and allowed scopes
 */
const allowedScopesDict: string[] = [
  'perm:r',
  'perm:w',
  'rec:r',
  'rec:w',
  'attachment:r',
  'attachment:w',
  'user:r',
  'user:w',
  'user:q',
];

export const getAllScopes = (): string => allowedScopesDict.join(' ');
