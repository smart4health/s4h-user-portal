// @ts-ignore
import * as crypto from 'crypto-browserify';
import { extractSourceId } from '../provenance';

const TEST_PARTNER_ID = '76d5bcef-01de-476f-a49c-d76518906455';
const TEST_CLIENT_ID = `${TEST_PARTNER_ID}#web`;
const SHA1_HASH_TEST_PARTNER_ID = 'bd8322709baea35456b8d50b759a4dad2cd85223';
const shasum = crypto.createHash('sha1');

describe('shasum', () => {
  it('produces correct has', () => {
    shasum.update(TEST_PARTNER_ID);
    const hashedPartnerId = shasum.digest('hex');
    expect(hashedPartnerId).toEqual(SHA1_HASH_TEST_PARTNER_ID);
  });
});
describe('extractSourceId', () => {
  it('returns the sha1 hash of the partner id', () => {
    const sourceId = extractSourceId(TEST_CLIENT_ID);
    expect(sourceId).toEqual(SHA1_HASH_TEST_PARTNER_ID);
  });
});
