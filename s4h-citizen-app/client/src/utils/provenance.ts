// @ts-ignore
import { createHash } from 'crypto-browserify';
const HASH_ENCODING = 'hex';

export function extractSourceId(clientId: string): string {
  const shasum = createHash('sha1');
  const partnerId = clientId.split('#')[0];
  shasum.update(partnerId);
  const hashedPartnerId = shasum.digest(HASH_ENCODING);
  return hashedPartnerId;
}
